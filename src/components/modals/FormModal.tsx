import React, { useState } from 'react';
import { Overlay } from './Overlay';
import { Field, inputStyle } from '../ui/Field';
import { Btn } from '../ui/Btn';
import { Save } from 'lucide-react';
import { INK } from '../../utils/constants';

export interface FormField {
  key: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: (string | { value: string; label: string })[];
}

interface FormModalProps {
  title: string;
  fields: FormField[];
  initial: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
  onCancel: () => void;
}

export const FormModal: React.FC<FormModalProps> = ({
  title,
  fields,
  initial,
  onSave,
  onCancel,
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => ({ ...initial }));

  const setVal = (key: string, v: any) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  const canSave = fields.every(
    (f) => !f.required || String(values[f.key] ?? '').trim() !== ''
  );

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
      {fields.map((f) => (
        <Field key={f.key} label={f.label}>
          {f.type === 'textarea' ? (
            <textarea
              value={values[f.key] ?? ''}
              onChange={(e) => setVal(f.key, e.target.value)}
              placeholder={f.placeholder || ''}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
              autoFocus={f === fields[0]}
            />
          ) : f.type === 'select' ? (
            <select
              value={values[f.key] ?? ''}
              onChange={(e) => setVal(f.key, e.target.value)}
              style={inputStyle}
              autoFocus={f === fields[0]}
            >
              {(f.options || []).map((opt) => {
                const val = typeof opt === 'string' ? opt : opt.value;
                const label = typeof opt === 'string' ? opt : opt.label;
                return (
                  <option key={val} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type={f.type || 'text'}
              value={values[f.key] ?? ''}
              onChange={(e) => setVal(f.key, e.target.value)}
              placeholder={f.placeholder || ''}
              style={inputStyle}
              autoFocus={f === fields[0]}
            />
          )}
        </Field>
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
          Cancelar
        </Btn>
        <Btn
          onClick={() => canSave && onSave(values)}
          style={{ flex: 1, justifyContent: 'center', opacity: canSave ? 1 : 0.5 }}
        >
          <Save size={14} /> Guardar
        </Btn>
      </div>
    </Overlay>
  );
};
export default FormModal;
