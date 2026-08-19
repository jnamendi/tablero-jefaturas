import React from 'react';
import { MUTED } from '../../utils/constants';

interface EmptyNoteProps {
  text: string;
}

export const EmptyNote: React.FC<EmptyNoteProps> = ({ text }) => {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: '13px',
        color: MUTED,
        padding: '10px 4px',
      }}
    >
      {text}
    </div>
  );
};
export default EmptyNote;
