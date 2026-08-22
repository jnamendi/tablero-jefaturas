import { NextResponse } from 'next/server';
import { prisma } from '../../../utils/db';
import { seedData } from '../../../data/seed';

// Sequential promise queue to serialize POST synchronization transactions.
// This prevents concurrent transactions from overlapping, causing database write deadlocks,
// write conflicts, or unique key violations (e.g. areas_code_key) on concurrent upsertions.
let postQueue = Promise.resolve();

function parseDate(d: any): Date | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d !== 'string' || !d.trim()) return null;
  const str = d.trim();
  const parsed = new Date(str.includes('T') ? str : `${str}T00:00:00.000Z`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(d: any): string | null {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (!trimmed) return null;
    return trimmed.slice(0, 10);
  }
  return null;
}

export async function GET() {
  try {
    let rawAreas = await prisma.area.findMany();

    // Server-Side Auto-Seeding:
    // If the database has no areas, seed it natively on the server side.
    // Wrap it in a try-catch to safely handle any concurrent dual-request collisions (e.g. StrictMode mounts)
    if (rawAreas.length === 0) {
      try {
        const seed = seedData();
        
        await prisma.$transaction(async (tx) => {
          // 1. Insert Areas
          for (const area of seed.areas) {
            await tx.area.create({
              data: { id: area.id, name: area.name, position: area.position || null, code: area.code }
            });
          }

          // 2. Insert Activities
          for (const act of seed.activities) {
            await tx.activity.create({
              data: {
                id: act.id,
                areaId: act.areaId,
                title: act.title,
                status: act.status,
                assignedDate: parseDate(act.assignedDate),
                dueDate: parseDate(act.dueDate),
                points: Number(act.points) || 0,
                completedAt: parseDate(act.completedAt),
              }
            });
          }

          // 3. Insert Indicators & values
          for (const ind of seed.indicators) {
            await tx.indicator.create({
              data: {
                id: ind.id,
                areaId: ind.areaId,
                name: ind.name,
                unit: ind.unit,
                description: ind.description || null,
              }
            });

            const periodValues = [];
            for (let m = 1; m <= 12; m++) {
              const monthKey = String(m).padStart(2, '0');
              const goal = ind.monthlyGoals?.[monthKey] !== undefined ? parseFloat(ind.monthlyGoals[monthKey] as string) : null;
              const result = ind.monthly?.[monthKey] !== undefined ? parseFloat(ind.monthly[monthKey] as string) : null;

              if (goal !== null || result !== null) {
                periodValues.push({
                  indicatorId: ind.id,
                  monthKey,
                  goal,
                  result,
                });
              }
            }

            if (periodValues.length > 0) {
              await tx.indicatorPeriodValue.createMany({
                data: periodValues
              });
            }
          }

          // 4. Insert Projects & relations
          for (const p of seed.projects) {
            await tx.project.create({
              data: {
                id: p.id,
                name: p.name,
                description: p.description || null,
                points: Number(p.points) || 0,
                status: p.status,
                completedAt: parseDate(p.completedAt),
              }
            });

            if (p.areaIds && p.areaIds.length > 0) {
              await tx.projectArea.createMany({
                data: p.areaIds.map((aid: string) => ({
                  projectId: p.id,
                  areaId: aid,
                }))
              });
            }
          }

          // 5. Insert Diarios, entries & evaluations
          for (const d of seed.diarios) {
            await tx.diario.create({
              data: {
                id: d.id,
                areaId: d.areaId,
                type: d.type,
                name: d.name,
                frequency: d.frequency,
                objective: d.objective || null,
              }
            });

            if (d.entries && d.entries.length > 0) {
              await tx.diarioEntry.createMany({
                data: d.entries.map((e: any) => ({
                  id: e.id,
                  diarioId: d.id,
                  date: parseDate(e.date) || new Date(),
                  comment: e.comment,
                  evidenceUrl: e.evidenceUrl || null,
                  evidenceDesc: e.evidenceDesc || null,
                }))
              });
            }

            if (d.evaluations) {
              const evToSave = [];
              for (const [monthKey, evalData] of Object.entries(d.evaluations) as [string, any][]) {
                evToSave.push({
                  diarioId: d.id,
                  monthKey,
                  status: evalData.status || null,
                  note: evalData.note || null,
                });
              }
              if (evToSave.length > 0) {
                await tx.diarioEvaluation.createMany({
                  data: evToSave,
                });
              }
            }
          }
        });
        
        console.log('Database successfully seeded server-side.');
      } catch (seedErr) {
        // Silently catch unique constraint/deadlock failures if a concurrent GET request already wrote the seed.
        console.log('Database already seeded concurrently by another request thread.');
      }
      
      // Reload rawAreas from database
      rawAreas = await prisma.area.findMany();
    }

    const rawActivities = await prisma.activity.findMany();
    
    const rawIndicators = await prisma.indicator.findMany({
      include: { periodValues: true }
    });
    
    const rawProjects = await prisma.project.findMany({
      include: { areaIds: true }
    });
    
    const rawDiarios = await prisma.diario.findMany({
      include: { entries: true, evaluations: true }
    });

    // 1. Map Indicators to client format
    const indicators = rawIndicators.map((ind) => {
      const monthlyGoals: Record<string, number> = {};
      const monthly: Record<string, number> = {};

      ind.periodValues.forEach((val) => {
        if (val.goal !== null && val.goal !== undefined) {
          monthlyGoals[val.monthKey] = val.goal;
        }
        if (val.result !== null && val.result !== undefined) {
          monthly[val.monthKey] = val.result;
        }
      });

      return {
        id: ind.id,
        areaId: ind.areaId,
        name: ind.name,
        unit: ind.unit,
        description: ind.description || undefined,
        monthlyGoals,
        monthly,
      };
    });

    // 2. Map Projects to client format
    const projects = rawProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      points: p.points,
      status: p.status as any,
      completedAt: formatDate(p.completedAt),
      areaIds: p.areaIds.map((pa) => pa.areaId),
    }));

    // 3. Map Diarios to client format
    const diarios = rawDiarios.map((d) => {
      const evaluations: Record<string, { status: any; note?: string }> = {};
      d.evaluations.forEach((ev) => {
        evaluations[ev.monthKey] = {
          status: ev.status || '',
          note: ev.note || undefined,
        };
      });

      return {
        id: d.id,
        areaId: d.areaId,
        type: d.type as any,
        name: d.name,
        frequency: d.frequency,
        objective: d.objective || undefined,
        entries: d.entries.map((e) => ({
          ...e,
          date: formatDate(e.date) || '',
        })),
        evaluations,
      };
    });

    return NextResponse.json({
      areas: rawAreas,
      activities: rawActivities.map(a => ({
        ...a,
        assignedDate: formatDate(a.assignedDate) || '',
        dueDate: formatDate(a.dueDate) || '',
        completedAt: formatDate(a.completedAt),
        status: a.status as any,
      })),
      indicators,
      projects,
      diarios,
    });
  } catch (error) {
    console.error('Error loading data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Actual POST logic handler
async function handlePost(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { areas, activities, indicators, projects, diarios } = body;

    if (!areas || !activities || !indicators || !projects || !diarios) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const areaIds: string[] = areas.map((a: any) => a.id);
    const activityIds: string[] = activities.map((a: any) => a.id);
    const indicatorIds: string[] = indicators.map((i: any) => i.id);
    const projectIds: string[] = projects.map((p: any) => p.id);
    const diarioIds: string[] = diarios.map((d: any) => d.id);

    // Run synchronization inside a single database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Sync Areas
      await tx.area.deleteMany({
        where: { id: { notIn: areaIds } },
      });
      for (const area of areas) {
        await tx.area.upsert({
          where: { id: area.id },
          update: { name: area.name, position: area.position || null, code: area.code },
          create: { id: area.id, name: area.name, position: area.position || null, code: area.code },
        });
      }

      // 2. Sync Activities
      await tx.activity.deleteMany({
        where: { id: { notIn: activityIds } },
      });
      for (const act of activities) {
        await tx.activity.upsert({
          where: { id: act.id },
          update: {
            areaId: act.areaId,
            title: act.title,
            status: act.status,
            assignedDate: parseDate(act.assignedDate),
            dueDate: parseDate(act.dueDate),
            points: Number(act.points) || 0,
            completedAt: parseDate(act.completedAt),
          },
          create: {
            id: act.id,
            areaId: act.areaId,
            title: act.title,
            status: act.status,
            assignedDate: parseDate(act.assignedDate),
            dueDate: parseDate(act.dueDate),
            points: Number(act.points) || 0,
            completedAt: parseDate(act.completedAt),
          },
        });
      }

      // 3. Sync Indicators
      await tx.indicator.deleteMany({
        where: { id: { notIn: indicatorIds } },
      });
      for (const ind of indicators) {
        await tx.indicator.upsert({
          where: { id: ind.id },
          update: { name: ind.name, unit: ind.unit, description: ind.description || null, areaId: ind.areaId },
          create: { id: ind.id, name: ind.name, unit: ind.unit, description: ind.description || null, areaId: ind.areaId },
        });

        // Sync period values for this indicator
        await tx.indicatorPeriodValue.deleteMany({
          where: { indicatorId: ind.id },
        });

        const periodValuesToSave = [];
        for (let m = 1; m <= 12; m++) {
          const monthKey = String(m).padStart(2, '0');
          const goal = ind.monthlyGoals?.[monthKey] !== undefined ? parseFloat(ind.monthlyGoals[monthKey]) : null;
          const result = ind.monthly?.[monthKey] !== undefined ? parseFloat(ind.monthly[monthKey]) : null;

          if (goal !== null || result !== null) {
            periodValuesToSave.push({
              indicatorId: ind.id,
              monthKey,
              goal,
              result,
            });
          }
        }
        
        if (periodValuesToSave.length > 0) {
          await tx.indicatorPeriodValue.createMany({
            data: periodValuesToSave
          });
        }
      }

      // 4. Sync Projects
      await tx.project.deleteMany({
        where: { id: { notIn: projectIds } },
      });
      for (const p of projects) {
        await tx.project.upsert({
          where: { id: p.id },
          update: {
            name: p.name,
            description: p.description || null,
            points: Number(p.points) || 0,
            status: p.status,
            completedAt: parseDate(p.completedAt),
          },
          create: {
            id: p.id,
            name: p.name,
            description: p.description || null,
            points: Number(p.points) || 0,
            status: p.status,
            completedAt: parseDate(p.completedAt),
          },
        });

        // Sync project-area assignments
        await tx.projectArea.deleteMany({
          where: { projectId: p.id },
        });
        
        if (p.areaIds && p.areaIds.length > 0) {
          await tx.projectArea.createMany({
            data: p.areaIds.map((aid: string) => ({
              projectId: p.id,
              areaId: aid,
            })),
          });
        }
      }

      // 5. Sync Diarios
      await tx.diario.deleteMany({
        where: { id: { notIn: diarioIds } },
      });
      for (const d of diarios) {
        await tx.diario.upsert({
          where: { id: d.id },
          update: {
            areaId: d.areaId,
            type: d.type,
            name: d.name,
            frequency: d.frequency,
            objective: d.objective || null,
          },
          create: {
            id: d.id,
            areaId: d.areaId,
            type: d.type,
            name: d.name,
            frequency: d.frequency,
            objective: d.objective || null,
          },
        });

        // Sync Entries
        await tx.diarioEntry.deleteMany({
          where: { diarioId: d.id },
        });
        if (d.entries && d.entries.length > 0) {
          await tx.diarioEntry.createMany({
            data: d.entries.map((e: any) => ({
              id: e.id,
              diarioId: d.id,
              date: parseDate(e.date) || new Date(),
              comment: e.comment,
              evidenceUrl: e.evidenceUrl || null,
              evidenceDesc: e.evidenceDesc || null,
            })),
          });
        }

        // Sync Evaluations
        await tx.diarioEvaluation.deleteMany({
          where: { diarioId: d.id },
        });
        if (d.evaluations) {
          const evToSave = [];
          for (const [monthKey, evalData] of Object.entries(d.evaluations) as [string, any][]) {
            evToSave.push({
              diarioId: d.id,
              monthKey,
              status: evalData.status || null,
              note: evalData.note || null,
            });
          }
          if (evToSave.length > 0) {
            await tx.diarioEvaluation.createMany({
              data: evToSave,
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Intercept Prisma's P2002 Unique Constraint violation specifically for the area code uniqueness
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({
        error: 'unique_code_violation',
        message: 'El código de acceso de jefatura ya está en uso por otra área.'
      }, { status: 409 });
    }
    
    console.error('Error syncing data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Front facing POST route handler queued sequentially
export async function POST(request: Request): Promise<Response> {
  return new Promise((resolve) => {
    postQueue = postQueue.then(async () => {
      try {
        const response = await handlePost(request);
        resolve(response);
      } catch (err) {
        console.error('Queue execution failed:', err);
        resolve(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
      }
    });
  });
}
