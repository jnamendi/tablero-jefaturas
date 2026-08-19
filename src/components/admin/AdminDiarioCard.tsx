import React, { useState } from 'react';
import { Diario } from '../../types';
import { currentMonthKey, monthKeyLabel } from '../../utils/helpers';
import { PANEL, GRID, INK, MUTED, PAPER, COPPER } from '../../utils/constants';
import { TypeBadge } from '../ui/TypeBadge';
import { EvalBadge } from '../ui/EvalBadge';
import { Btn } from '../ui/Btn';
import { Field, inputStyle } from '../ui/Field';
import { EmptyNote } from '../ui/EmptyNote';
import {
  Pencil,
  Trash2,
  Target,
  CalendarCheck,
  Save,
  MessageSquare,
  Link2,
} from 'lucide-react';

interface AdminDiarioCardProps {
  act: Diario;
  onUpdate: (id: string, patch: Partial<Diario>) => void;
  onEdit: () => void;
  onRemove: () => void;
}

export const AdminDiarioCard: React.FC<AdminDiarioCardProps> = ({
  act,
  onUpdate,
  onEdit,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [evalMonth, setEvalMonth] = useState(currentMonthKey());
  const [status, setStatus] = useState<any>(act.evaluations?.[currentMonthKey()]?.status || '');
  const [note, setNote] = useState(act.evaluations?.[currentMonthKey()]?.note || '');

  const pickMonth = (key: string) => {
    setEvalMonth(key);
    setStatus(act.evaluations?.[key]?.status || '');
    setNote(act.evaluations?.[key]?.note || '');
  };

  const saveEval = () => {
    onUpdate(act.id, {
      evaluations: {
        ...(act.evaluations || {}),
        [evalMonth]: { status: status || null, note },
      },
    });
  };

  const pastEvals = Object.entries(act.evaluations || {})
    .filter(([, v]) => v && v.status)
    .sort((a, b) => b[0].localeCompare(a[0]));

  const entries = [...(act.entries || [])]
    .filter((e) => (e.date || '').slice(0, 7) === evalMonth)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

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
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <TypeBadge type={act.type} />
            <span
              style={{
                fontFamily: "'Roboto Slab', serif",
                fontWeight: 700,
                fontSize: '14.5px',
                color: INK,
              }}
            >
              {act.name}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              marginTop: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '11.5px',
                color: MUTED,
              }}
            >
              Frecuencia: <strong style={{ color: INK }}>{act.frequency}</strong>
            </span>
            <EvalBadge status={act.evaluations?.[currentMonthKey()]?.status} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn
            variant="ghost"
            onClick={() => setExpanded((e) => !e)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {expanded ? 'Ocultar bitácora' : 'Ver bitácora y evaluar'}
          </Btn>
          <Btn variant="ghost" onClick={onEdit} style={{ padding: '6px 9px' }}>
            <Pencil size={13} />
          </Btn>
          <Btn variant="danger" onClick={onRemove} style={{ padding: '6px 9px' }}>
            <Trash2 size={13} />
          </Btn>
        </div>
      </div>

      {act.objective && (
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
          <Target size={13} color={MUTED} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: MUTED,
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontWeight: 600, color: INK }}>Objetivo: </span>
            {act.objective}
          </div>
        </div>
      )}

      {expanded && (
        <div
          style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: `1px solid ${GRID}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Evaluación mensual */}
          <div>
            <div
              style={{
                fontFamily: "'Roboto Slab', serif",
                fontWeight: 700,
                fontSize: '13px',
                color: INK,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CalendarCheck size={14} color={COPPER} /> Evaluación mensual
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Field label="Mes">
                <input
                  type="month"
                  value={evalMonth}
                  onChange={(e) => pickMonth(e.target.value)}
                  style={{ ...inputStyle, width: '160px' }}
                />
              </Field>
              <Field label="Cumplimiento">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{ ...inputStyle, width: '160px' }}
                >
                  <option value="">Sin evaluar</option>
                  <option value="cumple">Cumple</option>
                  <option value="no_cumple">No cumple</option>
                </select>
              </Field>
              <Btn onClick={saveEval} style={{ marginBottom: '12px' }}>
                <Save size={13} /> Guardar evaluación
              </Btn>
            </div>
            <Field label="Nota (opcional)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              />
            </Field>

            {pastEvals.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {pastEvals.map(([mk, v]) => (
                  <div
                    key={mk}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '12px',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: MUTED,
                        minWidth: '110px',
                      }}
                    >
                      {monthKeyLabel(mk)}
                    </span>
                    <EvalBadge status={v.status} />
                    {v.note && <span style={{ color: MUTED }}>— {v.note}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bitácora */}
          <div>
            <div
              style={{
                fontFamily: "'Roboto Slab', serif",
                fontWeight: 700,
                fontSize: '13px',
                color: INK,
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageSquare size={14} color={COPPER} /> Bitácora de la jefatura —{' '}
              {monthKeyLabel(evalMonth)}
            </div>
            {entries.length === 0 && (
              <EmptyNote text={`Sin entradas registradas en ${monthKeyLabel(evalMonth)}.`} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entries.map((e) => (
                <div
                  key={e.id}
                  style={{
                    background: PAPER,
                    border: `1px solid ${GRID}`,
                    borderRadius: '4px',
                    padding: '10px 12px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: MUTED,
                      marginBottom: '4px',
                    }}
                  >
                    {e.date}
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: '13px',
                      color: INK,
                      lineHeight: 1.4,
                    }}
                  >
                    {e.comment}
                  </div>
                  {e.evidenceUrl && (
                    <a
                      href={e.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '6px',
                        fontSize: '12px',
                        color: COPPER,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >
                      <Link2 size={12} /> {e.evidenceDesc || 'Ver evidencia'}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDiarioCard;
