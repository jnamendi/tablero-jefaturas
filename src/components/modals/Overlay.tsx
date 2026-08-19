import React from 'react';
import { PANEL, GRID } from '../../utils/constants';

interface OverlayProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ children, onClose }) => {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(22, 35, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: PANEL,
          borderRadius: '6px',
          border: `1px solid ${GRID}`,
          width: '360px',
          maxWidth: '100%',
          padding: '24px',
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default Overlay;
