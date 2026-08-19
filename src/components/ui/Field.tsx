import React from 'react';
import { GRID, INK, MUTED } from '../../utils/constants';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  border: `1px solid ${GRID}`,
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: "'IBM Plex Sans', sans-serif",
  color: INK,
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, children }) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '11.5px',
          fontWeight: 600,
          color: MUTED,
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
};
export default Field;
