import React from 'react';
import { COPPER_DK } from '../../utils/constants';

interface TypeBadgeProps {
  type: 'primaria' | 'secundaria';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const isPrimary = type === 'primaria';
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        color: isPrimary ? COPPER_DK : '#3B5B73',
        background: isPrimary ? '#F3E3D8' : '#DFE9EF',
        padding: '3px 8px',
        borderRadius: '3px',
      }}
    >
      {isPrimary ? 'Primaria' : 'Secundaria'}
    </span>
  );
};
export default TypeBadge;
