import React, { useState } from 'react';
import { Area, Activity, Indicator, Project, Diario } from '../../types';
import {
  areaScore,
  areaPointsBreakdown,
  areaPointsSeries,
  scoreColor,
  fmt,
} from '../../utils/helpers';
import {
  FolderKanban,
  Anchor,
  Target,
  ClipboardList,
  Award,
  Trophy,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '../shared/Header';
import { Dial } from '../ui/Dial';
import { StatusPill } from '../ui/StatusPill';
import { DueBadge } from '../ui/DueBadge';
import { EmptyNote } from '../ui/EmptyNote';
import { IndicatorCard } from './IndicatorCard';
import { JefaturaDiarioCard } from './JefaturaDiarioCard';
import { inputStyle } from '../ui/Field';
import {
  PAPER,
  PANEL,
  GRID,
  INK,
  MUTED,
  COPPER,
  FOREST,
  COPPER_DK,
} from '../../utils/constants';

interface JefaturaDashboardProps {
  area: Area;
  areas: Area[];
  activities: Activity[];
  indicators: Indicator[];
  projects: Project[];
  diarios: Diario[];
  onUpdateIndicator: (id: string, patch: Partial<Indicator>) => void;
  onUpdateActivity: (id: string, patch: Partial<Activity>) => void;
  onUpdateDiario: (id: string, patch: Partial<Diario>) => void;
  onLogout: () => void;
}

export const JefaturaDashboard: React.FC<JefaturaDashboardProps> = ({
  area,
  areas,
  activities,
  indicators,
  projects,
  diarios,
  onUpdateIndicator,
  onUpdateActivity,
  onUpdateDiario,
  onLogout,
}) => {
  const [tab, setTab] = useState<string>('proyectos');
  const areaActs = activities.filter((a) => a.areaId === area.id);
  const areaInds = indicators.filter((i) => i.areaId === area.id);
  const areaProjects = (projects || []).filter((p) => (p.areaIds || []).includes(area.id));
  const areaDiarios = (diarios || []).filter((x) => x.areaId === area.id);
  const score = areaScore(area.id, indicators, activities);
  const points = areaPointsBreakdown(area.id, activities, projects);
  const pointsSeries = areaPointsSeries(area.id, activities, projects);

  const TABS: [string, string, React.ComponentType<any>][] = [
    ['proyectos', 'Proyectos', FolderKanban],
    ['diario', 'Diario a Bordo', Anchor],
    ['indicadores', 'Indicadores y Metas', Target],
    ['actividades', 'Actividades', ClipboardList],
    ['puntos', 'Puntos', Award],
  ];

  return (
    <div style={{ minHeight: '100vh', background: PAPER }}>
      <Header
        title={area.name}
        subtitle={area.position ? `${area.position} · Panel de jefatura` : 'Panel de jefatura'}
        onLogout={onLogout}
      />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px' }}>
        {/* resumen */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            background: PANEL,
            border: `1px solid ${GRID}`,
            borderRadius: '6px',
            padding: '20px 26px',
            marginBottom: '22px',
          }}
        >
          <Dial pct={score} size={100} color={scoreColor(score)} />
          <div>
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              Cumplimiento general del área
            </div>
            <div style={{ fontFamily: "'Roboto Slab', serif", fontSize: '26px', fontWeight: 700, color: INK }}>
              {Math.round(score)}%
            </div>
            <div style={{ fontSize: '12.5px', color: MUTED, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {areaInds.length} indicador(es) ·{' '}
              {areaActs.filter((a) => a.status === 'completado').length}/{areaActs.length}{' '}
              actividades completadas
            </div>
          </div>
        </div>

        {/* panel de pestañas */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {TABS.map(([k, l, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 16px',
                borderRadius: '4px',
                border: `1px solid ${GRID}`,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                background: tab === k ? INK : PANEL,
                color: tab === k ? '#fff' : INK,
              }}
            >
              <Icon size={14} color={tab === k ? '#fff' : COPPER} /> {l}
            </button>
          ))}
        </div>

        {/* proyectos */}
        {tab === 'proyectos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {areaProjects.length === 0 && (
              <EmptyNote text="No participas en ningún proyecto por el momento." />
            )}
            {areaProjects.map((p) => (
              <div
                key={p.id}
                style={{
                  background: PANEL,
                  border: `1px solid ${GRID}`,
                  borderRadius: '6px',
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Roboto Slab', serif",
                    fontWeight: 700,
                    fontSize: '15px',
                    color: INK,
                  }}
                >
                  {p.name}
                </div>
                {p.description && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: '12.5px',
                      color: MUTED,
                      marginTop: '4px',
                    }}
                  >
                    {p.description}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {(p.areaIds || []).map((aid) => {
                    const other = areas.find((x) => x.id === aid);
                    const isMe = aid === area.id;
                    return (
                      <span
                        key={aid}
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 600,
                          color: isMe ? '#fff' : COPPER_DK,
                          background: isMe ? COPPER : '#F3E3D8',
                          padding: '3px 9px',
                          borderRadius: '3px',
                        }}
                      >
                        {isMe ? `${area.name} (tú)` : other ? other.name : 'Área eliminada'}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* diario a bordo */}
        {tab === 'diario' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {areaDiarios.length === 0 && (
              <EmptyNote text="Aún no tienes actividades asignadas en el Diario a Bordo." />
            )}
            {areaDiarios.map((act) => (
              <JefaturaDiarioCard key={act.id} act={act} onUpdate={onUpdateDiario} />
            ))}
          </div>
        )}

        {/* indicadores */}
        {tab === 'indicadores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {areaInds.length === 0 && <EmptyNote text="Aún no tienes indicadores asignados." />}
            {areaInds.map((ind) => (
              <IndicatorCard key={ind.id} ind={ind} onUpdate={onUpdateIndicator} />
            ))}
          </div>
        )}

        {/* actividades */}
        {tab === 'actividades' && (
          <div
            style={{
              background: PANEL,
              border: `1px solid ${GRID}`,
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {areaActs.length === 0 && (
              <div style={{ padding: '18px' }}>
                <EmptyNote text="No tienes actividades asignadas." />
              </div>
            )}
            {areaActs.map((act, i) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                  borderTop: i === 0 ? 'none' : `1px solid ${GRID}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      color: INK,
                    }}
                  >
                    {act.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: MUTED,
                      display: 'flex',
                      gap: '10px',
                      marginTop: '2px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>Asignada: {act.assignedDate || '—'}</span>
                    <span>Vence: {act.dueDate || 'sin fecha'}</span>
                    <DueBadge dueDate={act.dueDate} status={act.status} />
                  </div>
                </div>
                <StatusPill status={act.status} />
                <select
                  value={act.status}
                  onChange={(e) => {
                    const status = e.target.value as any;
                    onUpdateActivity(act.id, {
                      status,
                      completedAt:
                        status === 'completado'
                          ? act.completedAt || new Date().toISOString().slice(0, 10)
                          : null,
                    });
                  }}
                  style={{ ...inputStyle, width: '150px', padding: '6px 8px', fontSize: '12.5px' }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* puntos */}
        {tab === 'puntos' && (
          <div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div
                style={{
                  flex: '1 1 160px',
                  background: PANEL,
                  border: `1px solid ${GRID}`,
                  borderRadius: '6px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Trophy size={26} color={COPPER} />
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: MUTED,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    Puntos totales
                  </div>
                  <div
                    style={{
                      fontFamily: "'Roboto Slab', serif",
                      fontSize: '24px',
                      fontWeight: 700,
                      color: INK,
                    }}
                  >
                    {fmt(points.total)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: '1 1 160px',
                  background: PANEL,
                  border: `1px solid ${GRID}`,
                  borderRadius: '6px',
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  Por actividades
                </div>
                <div
                  style={{
                    fontFamily: "'Roboto Slab', serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: INK,
                    marginTop: '4px',
                  }}
                >
                  {fmt(points.activityPoints)}
                </div>
              </div>
              <div
                style={{
                  flex: '1 1 160px',
                  background: PANEL,
                  border: `1px solid ${GRID}`,
                  borderRadius: '6px',
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  Por proyectos
                </div>
                <div
                  style={{
                    fontFamily: "'Roboto Slab', serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: INK,
                    marginTop: '4px',
                  }}
                >
                  {fmt(points.projectPoints)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: PANEL,
                border: `1px solid ${GRID}`,
                borderRadius: '6px',
                padding: '18px 20px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Roboto Slab', serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: INK,
                  marginBottom: '14px',
                }}
              >
                Puntos acumulados por mes
              </div>
              {pointsSeries.length === 0 ? (
                <EmptyNote text="Aún no tienes actividades o proyectos completados con puntos registrados." />
              ) : (
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer>
                    <ComposedChart data={pointsSeries} margin={{ top: 6, right: 12, bottom: 0, left: -12 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontFamily: 'IBM Plex Sans', fontSize: 11.5, fill: MUTED }}
                        axisLine={{ stroke: GRID }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: MUTED }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 12.5,
                          border: `1px solid ${GRID}`,
                          borderRadius: 4,
                        }}
                        formatter={(value: any, name: any) => [
                          fmt(value),
                          name === 'points' ? 'Ganados ese mes' : 'Acumulado',
                        ]}
                      />
                      <Bar dataKey="points" fill={COPPER} radius={[3, 3, 0, 0]} name="points" />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke={FOREST}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: FOREST }}
                        name="cumulative"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default JefaturaDashboard;
