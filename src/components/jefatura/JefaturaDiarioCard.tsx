import React, { useState } from 'react';
import { Diario, DiarioEntry } from '../../types';
import { currentMonthKey, monthKeyLabel, uid } from '../../utils/helpers';
import { PANEL, GRID, INK, MUTED, PAPER, COPPER } from '../../utils/constants';
import { TypeBadge } from '../ui/TypeBadge';
import { EvalBadge } from '../ui/EvalBadge';
import { Field, inputStyle } from '../ui/Field';
import { Btn } from '../ui/Btn';
import { EmptyNote } from '../ui/EmptyNote';
import { Target, Plus, Link2 } from 'lucide-react';

interface JefaturaDiarioCardProps {
  act: Diario;
  onUpdate: (id: string, patch: Partial<Diario>) => void;
}

export const JefaturaDiarioCard: React.FC<JefaturaDiarioCardProps> = ({ act, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMonth, setViewMonth] = useState(currentMonthKey());
  const [comment, setComment] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');

  const viewEval = act.evaluations?.[viewMonth];
  const entries = [...(act.entries || [])]
    .filter((e) => (e.date || '').slice(0, 7) === viewMonth)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const addEntry = () => {
    if (!comment.trim()) return;
    const entry: DiarioEntry = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      comment: comment.trim(),
      evidenceUrl: evidenceUrl.trim(),
      evidenceDesc: evidenceDesc.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdate(act.id, { entries: [...(act.entries || []), entry] });
    setComment('');
    setEvidenceUrl('');
    setEvidenceDesc('');
  };

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
            <EvalBadge status={viewEval?.status} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '11.5px',
              color: MUTED,
            }}
          >
            Mes:
          </span>
          <input
            type="month"
            value={viewMonth}
            onChange={(e) => setViewMonth(e.target.value)}
            style={{ ...inputStyle, width: '150px', padding: '6px 8px', fontSize: '12.5px' }}
          />
          <Btn
            variant="ghost"
            onClick={() => setExpanded((e) => !e)}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {expanded ? 'Ocultar bitácora' : 'Ver bitácora'}
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

      {viewEval?.note && (
        <div
          style={{
            marginTop: '8px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: MUTED,
            fontStyle: 'italic',
          }}
        >
          Nota del administrador ({monthKeyLabel(viewMonth)}): {viewEval.note}
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${GRID}` }}>
          <div
            style={{
              fontFamily: "'Roboto Slab', serif",
              fontWeight: 700,
              fontSize: '13px',
              color: INK,
              marginBottom: '8px',
            }}
          >
            Agregar entrada a la bitácora
          </div>
          <Field label="Comentario">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="¿Qué se hizo hoy respecto a esta actividad?"
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            />
          </Field>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px' }}>
              <Field label="Enlace de evidencia (opcional)">
                <input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </Field>
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <Field label="Descripción de la evidencia (opcional)">
                <input
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Ej. Foto del área, captura de pantalla..."
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
          <Btn onClick={addEntry} style={{ opacity: comment.trim() ? 1 : 0.5 }}>
            <Plus size={13} /> Agregar entrada
          </Btn>

          <div style={{ marginTop: '20px', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: '13px', color: INK }}>
              Bitácora — {monthKeyLabel(viewMonth)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.length === 0 && (
              <EmptyNote text={`No hay entradas registradas en ${monthKeyLabel(viewMonth)}.`} />
            )}
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
      )}
    </div>
  );
};
export default JefaturaDiarioCard;
