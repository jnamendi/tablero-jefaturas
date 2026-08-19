import React from 'react';
import { COPPER, INK, GRID, BRICK } from '../../utils/constants';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'dark';
}

export const Btn: React.FC<BtnProps> = ({
  children,
  onClick,
  variant = 'primary',
  style,
  ...rest
}) => {
  const base: React.CSSProperties = {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '9px 16px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    border: '1px solid transparent',
    transition: 'all .15s ease',
  };

  const variants = {
    primary: { background: COPPER, color: '#fff', borderColor: COPPER },
    ghost: { background: 'transparent', color: INK, borderColor: GRID },
    danger: { background: 'transparent', color: BRICK, borderColor: '#E0B8B0' },
    dark: { background: INK, color: '#fff', borderColor: INK },
  };

  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
};
export default Btn;
