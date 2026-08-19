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
import { Pencil, Trash2, Info } from 'lucide-react';
import { MonthlyBreakdown } from '../jefatura/MonthlyBreakdown';

interface AdminIndicatorCardProps {
  ind: Indicator;
  onUpdate: (id: string, patch: Partial<Indicator>) => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const AdminIndicatorCard: React.FC<AdminIndicatorCardProps> = ({
  ind,
  onUpdate,
  onEdit,
  onRemove,
}) => {
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
        padding: '16px 18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Dial pct={pct} size={64} color={scoreColor(pct)} />
          <div>
            <div
              style={{
                fontFamily: "'Roboto Slab', serif",
                fontWeight: 700,
                fontSize: '14.5px',
                color: INK,
              }}
            >
              {ind.name}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11.5px',
                marginTop: '2px',
              }}
            >
              <span style={{ color: MUTED }}>
                Meta anual: {fmt(goalTotal)} {ind.unit}
              </span>
              <span style={{ color: scoreColor(pct), fontWeight: 600 }}>
                Acumulado: {fmt(accumulated)} {ind.unit}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Btn
            variant="ghost"
            onClick={() => setExpanded((e) => !e)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {expanded ? 'Ocultar desglose' : 'Ver desglose mensual'}
          </Btn>
          <Btn variant="ghost" onClick={onEdit} style={{ padding: '6px 9px' }}>
            <Pencil size={13} />
          </Btn>
          <Btn variant="danger" onClick={onRemove} style={{ padding: '6px 9px' }}>
            <Trash2 size={13} />
          </Btn>
        </div>
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
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${GRID}` }}>
          <MonthlyBreakdown ind={ind} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
};
export default AdminIndicatorCard;
