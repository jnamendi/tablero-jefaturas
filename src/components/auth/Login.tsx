import React, { useState } from 'react';
import {
  Gauge,
  Building2,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { LoginBackdrop } from './LoginBackdrop';
import { Btn } from '../ui/Btn';
import { Field, inputStyle } from '../ui/Field';
import { Area } from '../../types';
import {
  PAPER,
  PANEL,
  GRID,
  INK,
  COPPER,
  MUTED,
  BRICK,
  LOGO_DATA_URI,
} from '../../utils/constants';

interface CodeInputProps {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ value, onChange, onEnter }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
        style={{ ...inputStyle, paddingRight: '68px' }}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: 'absolute',
          right: '6px',
          top: '50%',
          transform: 'translateY(-50%)',
          border: 'none',
          background: 'transparent',
          color: COPPER,
          cursor: 'pointer',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '11.5px',
          fontWeight: 600,
          padding: '4px 6px',
        }}
      >
        {show ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
};

interface ErrorLineProps {
  text: string;
}

const ErrorLine: React.FC<ErrorLineProps> = ({ text }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: BRICK,
        fontSize: '12.5px',
        marginTop: '4px',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <AlertTriangle size={13} /> {text}
    </div>
  );
};

interface LoginProps {
  areas: Area[];
  onEnterAdmin: (code: string) => void;
  onEnterArea: (areaId: string, code: string) => void;
  error?: string;
  loading?: boolean;
}

export const Login: React.FC<LoginProps> = ({
  areas,
  onEnterAdmin,
  onEnterArea,
  error,
  loading,
}) => {
  const [role, setRole] = useState<'jefatura' | 'admin' | null>(null);
  const [areaId, setAreaId] = useState('');
  const [code, setCode] = useState('');

  const roleBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '13px 14px',
    background: PAPER,
    border: `1px solid ${GRID}`,
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAPER,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <LoginBackdrop />
      <div
        style={{
          width: '380px',
          background: PANEL,
          border: `1px solid ${GRID}`,
          borderRadius: '6px',
          padding: '34px 30px',
          boxShadow: '0 6px 28px rgba(22,35,42,0.10)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <img src={LOGO_DATA_URI} alt="Logo" style={{ height: '64px', width: 'auto' }} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '4px',
            justifyContent: 'center',
          }}
        >
          <Gauge size={22} color={COPPER} strokeWidth={2.2} />
          <div
            style={{
              fontFamily: "'Roboto Slab', serif",
              fontWeight: 700,
              fontSize: '19px',
              color: INK,
            }}
          >
            Tablero de Control
          </div>
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12.5px',
            color: MUTED,
            marginBottom: '26px',
            textAlign: 'center',
          }}
        >
          Indicadores y Actividades
        </div>

        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: MUTED,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
            }}
          >
            <Loader2 size={16} className="spin" /> Cargando datos…
          </div>
        ) : !role ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setRole('jefatura')} style={roleBtnStyle}>
              <Building2 size={18} color={COPPER} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: INK }}>
                  Soy una jefatura
                </div>
                <div style={{ fontSize: '11.5px', color: MUTED }}>
                  Ver mis actividades e indicadores
                </div>
              </div>
              <ChevronRight size={16} color={MUTED} style={{ marginLeft: 'auto' }} />
            </button>
            <button onClick={() => setRole('admin')} style={roleBtnStyle}>
              <ShieldCheck size={18} color={COPPER} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: INK }}>
                  Soy administrador
                </div>
                <div style={{ fontSize: '11.5px', color: MUTED }}>
                  Gestionar áreas, metas y actividades
                </div>
              </div>
              <ChevronRight size={16} color={MUTED} style={{ marginLeft: 'auto' }} />
            </button>
          </div>
        ) : role === 'admin' ? (
          <div>
            <Field label="Código de administrador">
              <CodeInput value={code} onChange={setCode} onEnter={() => onEnterAdmin(code)} />
            </Field>
            {error && <ErrorLine text={error} />}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Btn variant="ghost" onClick={() => setRole(null)}>
                <ArrowLeft size={14} /> Volver
              </Btn>
              <Btn onClick={() => onEnterAdmin(code)}>Entrar</Btn>
            </div>
          </div>
        ) : (
          <div>
            <Field label="Área / jefatura">
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                style={inputStyle}
                autoFocus
              >
                <option value="">Selecciona tu área…</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Código de acceso">
              <CodeInput
                value={code}
                onChange={setCode}
                onEnter={() => onEnterArea(areaId, code)}
              />
            </Field>
            {error && <ErrorLine text={error} />}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Btn variant="ghost" onClick={() => setRole(null)}>
                <ArrowLeft size={14} /> Volver
              </Btn>
              <Btn onClick={() => onEnterArea(areaId, code)}>Entrar</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Login;
