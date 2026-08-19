import React, { useState } from 'react';
import { Indicator } from '../../types';
import {
  parseLive,
  formatLive,
  clampPct,
  scoreColor,
  fmt,
} from '../../utils/helpers';
import { MONTHS, GRID, INK, MUTED, PAPER } from '../../utils/constants';
import { Btn } from '../ui/Btn';
import { Save } from 'lucide-react';

interface MonthlyBreakdownProps {
  ind: Indicator;
  onUpdate: (id: string, patch: Partial<Indicator>) => void;
  editableGoals?: boolean;
}

export const MonthlyBreakdown: React.FC<MonthlyBreakdownProps> = ({
  ind,
  onUpdate,
  editableGoals = true,
}) => {
  const [goals, setGoals] = useState<Record<string, string | number>>(() => ({
    ...(ind.monthlyGoals || {}),
  }));
  const [results, setResults] = useState<Record<string, string | number>>(() => ({
    ...(ind.monthly || {}),
  }));
  const [dirty, setDirty] = useState(false);

  const setGoal = (k: string, v: string) => {
    const p = parseLive(v);
    if (p !== null) {
      setGoals((prev) => ({ ...prev, [k]: p }));
      setDirty(true);
    }
  };

  const setResult = (k: string, v: string) => {
    const p = parseLive(v);
    if (p !== null) {
      setResults((prev) => ({ ...prev, [k]: p }));
      setDirty(true);
    }
  };

  const hasResult = (k: string) =>
    results[k] !== undefined && results[k] !== null && String(results[k]).trim() !== '';

  const totalGoals = MONTHS.reduce((s, m) => s + (Number(goals[m.key]) || 0), 0);
  const totalResults = MONTHS.reduce(
    (s, m) => s + (hasResult(m.key) ? Number(results[m.key]) || 0 : 0),
    0
  );
  const totalGoalsToDate = MONTHS.reduce(
    (s, m) => s + (hasResult(m.key) ? Number(goals[m.key]) || 0 : 0),
    0
  );

  const save = () => {
    const isEmpty = (v: any) => v === undefined || v === null || String(v).trim() === '';
    const cleanGoals: Record<string, string | number> = {};
    const cleanResults: Record<string, string | number> = {};
    MONTHS.forEach((m) => {
      cleanGoals[m.key] = isEmpty(goals[m.key]) ? '' : Number(goals[m.key]) || 0;
      cleanResults[m.key] = isEmpty(results[m.key]) ? '' : Number(results[m.key]) || 0;
    });
    onUpdate(ind.id, { monthlyGoals: cleanGoals, monthly: cleanResults });
    setDirty(false);
  };

  const cellInput: React.CSSProperties = {
    width: '100%',
    minWidth: '118px',
    padding: '6px 6px',
    border: `1px solid ${GRID}`,
    borderRadius: '3px',
    fontSize: '12.5px',
    fontFamily: "'IBM Plex Mono', monospace",
    color: INK,
    background: '#fff',
    outline: 'none',
    textAlign: 'center',
  };

  const th: React.CSSProperties = {
    fontSize: '10.5px',
    fontWeight: 700,
    color: MUTED,
    textTransform: 'uppercase',
    padding: '0 4px 6px',
    fontFamily: "'IBM Plex Sans', sans-serif",
    textAlign: 'center',
  };

  const rowLabel: React.CSSProperties = {
    fontSize: '11.5px',
    fontWeight: 600,
    color: INK,
    padding: '6px 10px 6px 0',
    whiteSpace: 'nowrap',
    fontFamily: "'IBM Plex Sans', sans-serif",
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '1560px' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>Mes</th>
              {MONTHS.map((m) => (
                <th key={m.key} style={th}>
                  {m.label}
                </th>
              ))}
              <th style={{ ...th, color: INK, minWidth: '130px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={rowLabel}>
                Meta {!editableGoals && <span style={{ fontWeight: 400, color: MUTED, fontSize: 10 }}>(solo admin)</span>}
              </td>
              {MONTHS.map((m) => (
                <td key={m.key} style={{ padding: '2px 3px' }}>
                  {editableGoals ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formatLive(goals[m.key] ?? '')}
                      onChange={(e) => setGoal(m.key, e.target.value)}
                      style={cellInput}
                    />
                  ) : (
                    <div style={{ ...cellInput, background: PAPER, color: MUTED, cursor: 'default' }}>
                      {formatLive(goals[m.key] ?? '') || '—'}
                    </div>
                  )}
                </td>
              ))}
              <td
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: INK,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {fmt(totalGoals)}
              </td>
            </tr>
            <tr>
              <td style={rowLabel}>Resultado</td>
              {MONTHS.map((m) => (
                <td key={m.key} style={{ padding: '2px 3px' }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatLive(results[m.key] ?? '')}
                    onChange={(e) => setResult(m.key, e.target.value)}
                    style={cellInput}
                  />
                </td>
              ))}
              <td
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: INK,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {fmt(totalResults)}
              </td>
            </tr>
            <tr>
              <td style={rowLabel}>Cumpl.</td>
              {MONTHS.map((m) => {
                const g = Number(goals[m.key]) || 0;
                const r = Number(results[m.key]) || 0;
                const pct = hasResult(m.key) && g > 0 ? clampPct(r, g) : null;
                return (
                  <td
                    key={m.key}
                    style={{
                      textAlign: 'center',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: pct === null ? MUTED : scoreColor(pct),
                      padding: '4px 0',
                    }}
                  >
                    {pct === null ? '—' : `${Math.round(pct)}%`}
                  </td>
                );
              })}
              <td
                style={{
                  textAlign: 'center',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: scoreColor(clampPct(totalResults, totalGoalsToDate)),
                  whiteSpace: 'nowrap',
                }}
              >
                {totalGoalsToDate > 0 ? `${Math.round(clampPct(totalResults, totalGoalsToDate))}%` : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <Btn onClick={save} style={{ fontSize: '12.5px', opacity: dirty ? 1 : 0.6 }}>
          <Save size={13} /> Guardar desglose
        </Btn>
      </div>
    </div>
  );
};
export default MonthlyBreakdown;
