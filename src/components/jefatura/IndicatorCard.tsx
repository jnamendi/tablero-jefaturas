import React, { useState } from 'react';
import { Indicator } from '../../types';
import {
  indicatorAccumulated,
  indicatorGoalTotal,
  indicatorGoalToDate,
  clampPct,
  scoreColor,
  fmt,
} from '../../utils/helpers';
import { PANEL, GRID, INK, MUTED, PAPER } from '../../utils/constants';
import { Dial } from '../ui/Dial';
import { Btn } from '../ui/Btn';
import { Info } from 'lucide-react';
import { MonthlyBreakdown } from './MonthlyBreakdown';

interface IndicatorCardProps {
  ind: Indicator;
  onUpdate: (id: string, patch: Partial<Indicator>) => void;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ ind, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const accumulated = indicatorAccumulated(ind);
  const goalTotal = indicatorGoalTotal(ind);
  const goalToDate = indicatorGoalToDate(ind);
  const pct = clampPct(accumulated, goalToDate);

  return (
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
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Dial pct={pct} size={78} color={scoreColor(pct)} />
          <div>
            <div
              style={{
                fontFamily: "'Roboto Slab', serif",
                fontWeight: 700,
                fontSize: '15.5px',
                color: INK,
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              {ind.name}
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: scoreColor(pct),
                }}
              >
                Acumulado: {fmt(accumulated)} {ind.unit}
              </span>
            </div>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                color: MUTED,
              }}
            >
              Meta anual: {fmt(goalTotal)} {ind.unit}
            </span>
          </div>
        </div>
        <Btn
          variant="ghost"
          onClick={() => setExpanded((e) => !e)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          {expanded ? 'Ocultar desglose mensual' : 'Ver desglose mensual'}
        </Btn>
      </div>

      {ind.description && (
        <div
          style={{
            marginTop: '12px',
            padding: '9px 12px',
            background: PAPER,
            border: `1px solid ${GRID}`,
            borderRadius: '4px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <Info size={13} color={MUTED} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: MUTED,
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontWeight: 600, color: INK }}>Cómo se mide: </span>
            {ind.description}
          </div>
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${GRID}` }}>
          <MonthlyBreakdown ind={ind} onUpdate={onUpdate} editableGoals={false} />
        </div>
      )}
    </div>
  );
};
export default IndicatorCard;
