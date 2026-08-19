import React from 'react';
import { ActivityStatus } from '../../types';
import { BRICK, AMBER, FOREST } from '../../utils/constants';

interface StatusPillProps {
  status: ActivityStatus;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const map = {
    pendiente: { label: 'Pendiente', color: BRICK, bg: '#F5E4E1' },
    en_progreso: { label: 'En progreso', color: AMBER, bg: '#F4EAD3' },
    completado: { label: 'Completado', color: FOREST, bg: '#E1EDE5' },
  };
  const s = map[status] || map.pendiente;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        color: s.color,
        background: s.bg,
        padding: '3px 9px',
        borderRadius: '3px',
        textTransform: 'uppercase',
      }}
    >
      {s.label}
    </span>
  );
};
export default StatusPill;
