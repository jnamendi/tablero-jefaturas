import React from 'react';
import { Overlay } from './Overlay';
import { Btn } from '../ui/Btn';
import { AlertTriangle } from 'lucide-react';
import { INK, BRICK, AMBER } from '../../utils/constants';

interface ConfirmModalProps {
  text: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  text,
  danger,
  onConfirm,
  onCancel,
}) => {
  return (
    <Overlay onClose={onCancel}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        <AlertTriangle
          size={20}
          color={danger ? BRICK : AMBER}
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '14px',
            color: INK,
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
          Cancelar
        </Btn>
        <Btn
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          style={{
            flex: 1,
            justifyContent: 'center',
            ...(danger ? { background: BRICK, color: '#fff', borderColor: BRICK } : {}),
          }}
        >
          Confirmar
        </Btn>
      </div>
    </Overlay>
  );
};
export default ConfirmModal;
