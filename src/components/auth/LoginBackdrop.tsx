import React from 'react';
import { FOREST, COPPER, INK, BRICK, AMBER } from '../../utils/constants';

export const LoginBackdrop: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* línea de tendencia ascendente */}
      <polyline
        points="60,620 220,560 340,600 480,460 610,500 760,340 900,380 1040,220"
        fill="none"
        stroke={FOREST}
        strokeWidth="4"
        opacity="0.16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [60, 620],
        [220, 560],
        [340, 600],
        [480, 460],
        [610, 500],
        [760, 340],
        [900, 380],
        [1040, 220],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={FOREST} opacity="0.18" />
      ))}

      {/* barras ascendentes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={90 + i * 46}
          y={860 - (i + 2) * 34}
          width="30"
          height={(i + 2) * 34}
          fill={COPPER}
          opacity="0.09"
          rx="2"
        />
      ))}

      {/* medidor / gauge en la esquina superior derecha */}
      <g transform="translate(1330,150)" opacity="0.14">
        <path d="M -140 0 A 140 140 0 0 1 140 0" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M -140 0 A 140 140 0 0 1 -46 -132" fill="none" stroke={BRICK} strokeWidth="10" strokeLinecap="butt" />
        <path d="M -46 -132 A 140 140 0 0 1 46 -132" fill="none" stroke={AMBER} strokeWidth="10" strokeLinecap="butt" />
        <path d="M 46 -132 A 140 140 0 0 1 140 0" fill="none" stroke={FOREST} strokeWidth="10" strokeLinecap="butt" />
        <line x1="0" y1="0" x2="70" y2="-120" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        <circle cx="0" cy="0" r="12" fill={INK} />
      </g>

      {/* rings target type */}
      <g transform="translate(1420,700)" opacity="0.13">
        <circle r="90" fill="none" stroke={COPPER} strokeWidth="8" />
        <circle r="58" fill="none" stroke={COPPER} strokeWidth="8" />
        <circle r="24" fill={COPPER} />
      </g>

      {/* checklist */}
      <g transform="translate(180,120)" opacity="0.14" stroke={INK} strokeWidth="6" strokeLinecap="round">
        <rect x="0" y="0" width="220" height="150" rx="10" fill="none" />
        <path d="M20 35 l14 14 l24 -28" fill="none" />
        <line x1="70" y1="42" x2="190" y2="42" />
        <path d="M20 80 l14 14 l24 -28" fill="none" />
        <line x1="70" y1="87" x2="190" y2="87" />
        <path d="M20 125 l14 14 l24 -28" fill="none" />
        <line x1="70" y1="132" x2="190" y2="132" />
      </g>

      {/* second trendline */}
      <polyline
        points="980,820 1080,780 1160,800 1260,700 1360,740 1460,600"
        fill="none"
        stroke={AMBER}
        strokeWidth="3.5"
        opacity="0.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default LoginBackdrop;
