import React from 'react';
import { EmptyNote } from './EmptyNote';
import { PANEL, GRID, PAPER, INK, MUTED } from '../../utils/constants';

interface TableProps<T> {
  rows: T[];
  cols: string[];
  render: (row: T) => React.ReactNode[];
  emptyText?: string;
  aligns?: ('left' | 'center' | 'right')[];
}

export function Table<T>({
  rows,
  cols,
  render,
  emptyText = 'Sin datos.',
  aligns = [],
}: TableProps<T>) {
  const alignFor = (i: number) => aligns[i] || (i === cols.length - 1 ? 'right' : 'left');

  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${GRID}`,
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols.length - 1}, 1fr) auto`,
          padding: '10px 16px',
          background: PAPER,
          borderBottom: `1px solid ${GRID}`,
        }}
      >
        {cols.map((c, i) => (
          <div
            key={i}
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: MUTED,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              textAlign: alignFor(i),
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {rows.length === 0 && (
        <div style={{ padding: '16px' }}>
          <EmptyNote text={emptyText} />
        </div>
      )}
      {rows.map((r, ri) => (
        <div
          key={ri}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols.length - 1}, 1fr) auto`,
            padding: '12px 16px',
            alignItems: 'center',
            borderTop: ri === 0 ? 'none' : `1px solid ${GRID}`,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13.5px',
            color: INK,
          }}
        >
          {render(r).map((cell, ci) => (
            <div key={ci} style={{ textAlign: alignFor(ci) }}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
export default Table;
