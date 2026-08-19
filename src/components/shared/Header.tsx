import React from 'react';
import { Gauge, Download, LogOut } from 'lucide-react';
import { Btn } from '../ui/Btn';
import { GRID, PANEL, COPPER, INK, MUTED, LOGO_DATA_URI } from '../../utils/constants';

interface HeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogout, onExport }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 28px',
        borderBottom: `1px solid ${GRID}`,
        background: PANEL,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Gauge size={22} color={COPPER} />
        <div>
          <div
            style={{
              fontFamily: "'Roboto Slab', serif",
              fontWeight: 700,
              fontSize: '17px',
              color: INK,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '11.5px',
              color: MUTED,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src={LOGO_DATA_URI} alt="Logo" style={{ height: '40px', width: 'auto' }} />
        {onExport && (
          <Btn variant="ghost" onClick={onExport}>
            <Download size={14} /> Exportar datos
          </Btn>
        )}
        <Btn variant="ghost" onClick={onLogout}>
          <LogOut size={14} /> Salir
        </Btn>
      </div>
    </div>
  );
};
export default Header;
