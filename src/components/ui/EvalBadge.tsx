import React from 'react';
import { CalendarCheck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DiarioEvaluation } from '../../types';
import { FOREST, BRICK, MUTED, PAPER } from '../../utils/constants';

interface EvalBadgeProps {
  status: DiarioEvaluation['status'];
}

export const EvalBadge: React.FC<EvalBadgeProps> = ({ status }) => {
  const map = {
    cumple: { label: 'Cumple', color: FOREST, bg: '#E1EDE5', Icon: ThumbsUp },
    no_cumple: { label: 'No cumple', color: BRICK, bg: '#F5E4E1', Icon: ThumbsDown },
  };

  const s = status ? map[status as 'cumple' | 'no_cumple'] : null;

  if (!s) {
    return (
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          fontWeight: 600,
          color: MUTED,
          background: PAPER,
          padding: '3px 9px',
          borderRadius: '3px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <CalendarCheck size={11} /> Pendiente de evaluación
      </span>
    );
  }

  const Icon = s.Icon;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        fontWeight: 700,
        color: s.color,
        background: s.bg,
        padding: '3px 9px',
        borderRadius: '3px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        textTransform: 'uppercase',
      }}
    >
      <Icon size={11} /> {s.label}
    </span>
  );
};
export default EvalBadge;
