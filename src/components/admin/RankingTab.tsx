import React from 'react';
import { Area, Activity, Project } from '../../types';
import { areaPointsBreakdown, fmt } from '../../utils/helpers';
import { EmptyNote } from '../ui/EmptyNote';
import { Medal } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  PANEL,
  GRID,
  INK,
  MUTED,
  COPPER,
  PAPER,
  COPPER_DK,
} from '../../utils/constants';

interface RankingTabProps {
  areas: Area[];
  activities: Activity[];
  projects: Project[];
}

export const RankingTab: React.FC<RankingTabProps> = ({ areas, activities, projects }) => {
  const ranked = areas
    .map((a) => ({ area: a, ...areaPointsBreakdown(a.id, activities, projects) }))
    .sort((a, b) => b.total - a.total);

  const chartData = ranked.map((r) => ({
    name: r.area.name.replace(/^Ejemplo — /, ''),
    puntos: r.total,
  }));

  const medalColor = (i: number) =>
    i === 0 ? '#D4A017' : i === 1 ? '#9AA5AB' : i === 2 ? '#B0703A' : MUTED;

  return (
    <div>
      {areas.length === 0 ? (
        <EmptyNote text="Primero crea áreas en la pestaña 'Áreas'." />
      ) : (
        <>
          <div
            style={{
              background: PANEL,
              border: `1px solid ${GRID}`,
              borderRadius: '6px',
              padding: '18px 20px',
              marginBottom: '20px',
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
              Comparativo de puntos por jefatura
            </div>
            <div style={{ width: '100%', height: Math.max(200, chartData.length * 46) }}>
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: MUTED }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontFamily: 'IBM Plex Sans', fontSize: 12, fill: INK }}
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
                    formatter={(v: any) => [fmt(v), 'Puntos']}
                  />
                  <Bar dataKey="puntos" fill={COPPER} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              background: PANEL,
              border: `1px solid ${GRID}`,
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 130px 130px 110px',
                padding: '10px 16px',
                background: PAPER,
                borderBottom: `1px solid ${GRID}`,
              }}
            >
              {['#', 'Jefatura', 'Actividades', 'Proyectos', 'Total'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    textAlign: i >= 2 ? 'right' : 'left',
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
            {ranked.map((r, i) => (
              <div
                key={r.area.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 130px 130px 110px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  borderTop: i === 0 ? 'none' : `1px solid ${GRID}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {i < 3 ? <Medal size={16} color={medalColor(i)} /> : null}
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: i < 3 ? INK : MUTED,
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: INK,
                    }}
                  >
                    {r.area.name}
                  </div>
                  {r.area.position && (
                    <div
                      style={{
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        fontSize: '11.5px',
                        color: MUTED,
                      }}
                    >
                      {r.area.position}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12.5px',
                    color: MUTED,
                  }}
                >
                  {fmt(r.activityPoints)}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '12.5px',
                    color: MUTED,
                  }}
                >
                  {fmt(r.projectPoints)}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: COPPER_DK,
                  }}
                >
                  {fmt(r.total)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
export default RankingTab;
