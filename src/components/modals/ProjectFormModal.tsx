import React, { useState } from 'react';
import { Overlay } from './Overlay';
import { Field, inputStyle } from '../ui/Field';
import { Btn } from '../ui/Btn';
import { Save } from 'lucide-react';
import { Area } from '../../types';
import { INK, COPPER, GRID } from '../../utils/constants';

interface ProjectFormModalProps {
  title: string;
  initial: {
    name: string;
    description?: string;
    areaIds?: string[];
    points?: number;
    status?: 'pendiente' | 'en_progreso' | 'completado';
  };
  areas: Area[];
  onSave: (values: {
    name: string;
    description: string;
    areaIds: string[];
    points: number;
    status: 'pendiente' | 'en_progreso' | 'completado';
  }) => void;
  onCancel: () => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  title,
  initial,
  areas,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [areaIds, setAreaIds] = useState<string[]>(initial.areaIds || []);
  const [points, setPoints] = useState<number | string>(initial.points ?? 0);
  const [status, setStatus] = useState<'pendiente' | 'en_progreso' | 'completado'>(
    initial.status || 'pendiente'
  );

  const toggle = (id: string) => {
    setAreaIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const canSave = name.trim() !== '';

  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          fontFamily: "'Roboto Slab', serif",
          fontWeight: 700,
          fontSize: '16px',
          color: INK,
          marginBottom: '16px',
        }}
      >
        {title}
      </div>
      <Field label="Nombre del proyecto">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </Field>
      <Field label="Descripción (opcional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        />
      </Field>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <Field label="Puntos al completarse">
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              style={inputStyle}
              placeholder="0"
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Estado">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'pendiente' | 'en_progreso' | 'completado')
              }
              style={inputStyle}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
          </Field>
        </div>
      </div>
      <Field label="Jefaturas involucradas">
        {areas.length === 0 ? (
          <div style={{ fontSize: '12.5px', color: '#5B6B70', fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Primero crea áreas en la pestaña "Áreas".
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '180px',
              overflowY: 'auto',
              border: `1px solid ${GRID}`,
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            {areas.map((a) => (
              <label
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '13px',
                  color: INK,
                  cursor: 'pointer',
                  padding: '3px 4px',
                }}
              >
                <input
                  type="checkbox"
                  checked={areaIds.includes(a.id)}
                  onChange={() => toggle(a.id)}
                  style={{ accentColor: COPPER, width: '15px', height: '15px' }}
                />
                {a.name}
              </label>
            ))}
          </div>
        )}
      </Field>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
          Cancelar
        </Btn>
        <Btn
          onClick={() =>
            canSave &&
            onSave({
              name,
              description,
              areaIds,
              points: Number(points) || 0,
              status,
            })
          }
          style={{ flex: 1, justifyContent: 'center', opacity: canSave ? 1 : 0.5 }}
        >
          <Save size={14} /> Guardar
        </Btn>
      </div>
    </Overlay>
  );
};
export default ProjectFormModal;
