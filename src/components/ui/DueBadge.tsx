import React from 'react';
import { ActivityStatus } from '../../types';
import { businessDaysUntil } from '../../utils/helpers';
import { MUTED, FOREST, BRICK, AMBER } from '../../utils/constants';

interface DueBadgeProps {
  dueDate: string;
  status: ActivityStatus;
}

export const DueBadge: React.FC<DueBadgeProps> = ({ dueDate, status }) => {
  if (!dueDate) {
    return (
      <span style={{ color: MUTED, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }}>
        —
      </span>
    );
  }
  if (status === 'completado') {
    return (
      <span style={{ color: FOREST, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }}>
        Completada
      </span>
    );
  }
  const d = businessDaysUntil(dueDate);
  if (d === null) {
    return (
      <span style={{ color: MUTED, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5 }}>
        —
      </span>
    );
  }
  let text = '';
  let color = MUTED;
  if (d < 0) {
    text = `${Math.abs(d)} día${Math.abs(d) === 1 ? '' : 's'} hábil(es) vencido`;
    color = BRICK;
  } else if (d === 0) {
    text = 'Vence hoy';
    color = AMBER;
  } else {
    text = `${d} día${d === 1 ? '' : 's'} hábil(es) restante(s)`;
    color = d <= 2 ? AMBER : MUTED;
  }
  return (
    <span
      style={{
        color,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11.5,
        fontWeight: d < 0 ? 600 : 400,
      }}
    >
      {text}
    </span>
  );
};
export default DueBadge;
