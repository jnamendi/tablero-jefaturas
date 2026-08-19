import React from 'react';
import { scoreColor } from '../../utils/helpers';
import { BRICK, AMBER, FOREST, INK, MUTED } from '../../utils/constants';

interface DialProps {
  pct: number;
  size?: number;
  label?: string;
  sub?: string;
  color?: string;
}

export const Dial: React.FC<DialProps> = ({ pct, size = 96, label, sub, color }) => {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  const r = size / 2 - 15;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const svgH = size / 2 + 20;
  const startAngle = 180;
  const endAngle = 360;
  const angleFor = (p: number) => startAngle + (p / 100) * (endAngle - startAngle);

  const polar = (deg: number, radius: number): [number, number] => {
    const rad = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };

  const arcPath = (a0: number, a1: number, radius: number): string => {
    const [x0, y0] = polar(a0, radius);
    const [x1, y1] = polar(a1, radius);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`;
  };

  const zones = [
    { from: 0, to: 60, color: BRICK },
    { from: 60, to: 90, color: AMBER },
    { from: 90, to: 100, color: FOREST },
  ];
  const strokeW = Math.max(6, size * 0.1);
  const needleLen = r - 3;
  const [nx, ny] = polar(angleFor(clamped), needleLen);
  const textColor = color || scoreColor(clamped);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <svg width={size} height={svgH} viewBox={`0 0 ${size} ${svgH}`}>
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(angleFor(z.from), angleFor(z.to), r)}
            stroke={z.color}
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="butt"
            opacity={0.9}
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={INK}
          strokeWidth={Math.max(2, size * 0.025)}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={Math.max(3, size * 0.045)} fill={INK} />
        <text
          x={polar(180, r + 11)[0]}
          y={polar(180, r + 11)[1] + 3}
          fontSize={Math.max(8, size * 0.075)}
          fontFamily="'IBM Plex Mono', monospace"
          fill={MUTED}
          textAnchor="middle"
        >
          0%
        </text>
        <text
          x={polar(360, r + 11)[0]}
          y={polar(360, r + 11)[1] + 3}
          fontSize={Math.max(8, size * 0.075)}
          fontFamily="'IBM Plex Mono', monospace"
          fill={MUTED}
          textAnchor="middle"
        >
          100%
        </text>
      </svg>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: Math.max(14, size * 0.26),
          fontWeight: 800,
          color: textColor,
          lineHeight: 1,
          marginTop: '-2px',
        }}
      >
        {Math.round(clamped)}%
      </div>
      {label && (
        <div
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12.5px',
            fontWeight: 600,
            color: INK,
            textAlign: 'center',
            lineHeight: 1.25,
            marginTop: '2px',
          }}
        >
          {label}
        </div>
      )}
      {sub && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: MUTED,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};
export default Dial;
