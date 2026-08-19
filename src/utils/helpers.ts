import { Indicator, Activity, Project } from '../types';
import { MONTHS, FOREST, AMBER, BRICK } from './constants';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthKeyLabel(key: string): string {
  if (!key) return '';
  const [y, m] = key.split('-');
  const found = MONTHS.find((mm) => mm.key === m);
  return `${found ? found.full : m} ${y}`;
}

export function hasResultValue(ind: Indicator, key: string): boolean {
  const v = (ind.monthly || {})[key];
  return v !== undefined && v !== null && String(v).trim() !== '';
}

export function indicatorAccumulated(ind: Indicator): number {
  const monthly = ind.monthly || {};
  return MONTHS.reduce((sum, m) => sum + (hasResultValue(ind, m.key) ? (Number(monthly[m.key]) || 0) : 0), 0);
}

export function indicatorGoalTotal(ind: Indicator): number {
  const goals = ind.monthlyGoals || {};
  return MONTHS.reduce((sum, m) => sum + (Number(goals[m.key]) || 0), 0);
}

// Meta acumulada solo de los meses que ya tienen un resultado registrado
// (evita penalizar el % por periodos futuros que aún no han pasado).
export function indicatorGoalToDate(ind: Indicator): number {
  const goals = ind.monthlyGoals || {};
  return MONTHS.reduce((sum, m) => sum + (hasResultValue(ind, m.key) ? (Number(goals[m.key]) || 0) : 0), 0);
}

export function fmt(n: number | string): string {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US', { maximumFractionDigits: 4, minimumFractionDigits: 0 });
}

// Formatea mientras se escribe, preservando un punto decimal final "en progreso" (ej. "2310060.")
export function formatLive(rawInput: string | number | null | undefined): string {
  if (rawInput === '' || rawInput === null || rawInput === undefined) return '';
  const raw = String(rawInput);
  const neg = raw.startsWith('-') ? '-' : '';
  const clean = raw.replace(/^-/, '');
  const [intPart, ...decParts] = clean.split('.');
  const intFormatted = intPart === '' ? '' : Number(intPart || 0).toLocaleString('en-US');
  if (decParts.length === 0) return neg + intFormatted;
  return neg + intFormatted + '.' + decParts.join('').slice(0, 4);
}

// Quita separadores de miles y deja un número "crudo" válido para guardar en el estado
export function parseLive(display: string): string | null {
  const cleaned = display.replace(/,/g, '');
  if (!/^-?\d*\.?\d*$/.test(cleaned)) return null;
  return cleaned;
}

export function clampPct(avance: number, meta: number): number {
  if (!meta || meta <= 0) return 0;
  return Math.max(0, Math.min(100, (avance / meta) * 100));
}

export function scoreColor(pct: number): string {
  if (pct >= 90) return FOREST;
  if (pct >= 60) return AMBER;
  return BRICK;
}

// Cuenta días hábiles (lun-vie) entre hoy y una fecha límite.
// Positivo = días hábiles restantes, negativo = días hábiles de atraso, 0 = vence hoy.
export function businessDaysUntil(dueDateStr: string): number | null {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr + 'T00:00:00');
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due.getTime() === today.getTime()) return 0;
  const sign = due > today ? 1 : -1;
  const start = sign > 0 ? today : due;
  const end = sign > 0 ? due : today;
  let count = 0;
  const cur = new Date(start);
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count * sign;
}

export function areaPointsBreakdown(
  areaId: string,
  activities: Activity[],
  projects: Project[]
): { activityPoints: number; projectPoints: number; total: number } {
  const activityPoints = (activities || [])
    .filter((a) => a.areaId === areaId && a.status === 'completado')
    .reduce((s, a) => s + (Number(a.points) || 0), 0);
  const projectPoints = (projects || [])
    .filter((p) => p.status === 'completado' && (p.areaIds || []).includes(areaId))
    .reduce((s, p) => s + (Number(p.points) || 0), 0);
  return { activityPoints, projectPoints, total: activityPoints + projectPoints };
}

// Referencing MONTHS for graph month plotting
export function areaPointsSeries(
  areaId: string,
  activities: Activity[],
  projects: Project[]
): { month: string; points: number; cumulative: number }[] {
  const map: Record<string, number> = {};
  (activities || [])
    .filter((a) => a.areaId === areaId && a.status === 'completado' && a.completedAt)
    .forEach((a) => {
      const mk = a.completedAt!.slice(0, 7);
      map[mk] = (map[mk] || 0) + (Number(a.points) || 0);
    });
  (projects || [])
    .filter((p) => p.status === 'completado' && (p.areaIds || []).includes(areaId) && p.completedAt)
    .forEach((p) => {
      const mk = p.completedAt!.slice(0, 7);
      map[mk] = (map[mk] || 0) + (Number(p.points) || 0);
    });
  const monthKeys = Object.keys(map).sort();
  let cum = 0;
  return monthKeys.map((mk) => {
    cum += map[mk];
    return {
      month: monthKeyLabel(mk).replace(/ \d{4}$/, ''),
      points: map[mk],
      cumulative: cum,
    };
  });
}

export function areaScore(
  areaId: string,
  indicators: Indicator[],
  activities: Activity[]
): number {
  const inds = indicators.filter((i) => i.areaId === areaId);
  const acts = activities.filter((a) => a.areaId === areaId);
  const indAvg = inds.length
    ? inds.reduce((s, i) => s + clampPct(indicatorAccumulated(i), indicatorGoalToDate(i)), 0) / inds.length
    : null;
  const actPct = acts.length
    ? (acts.filter((a) => a.status === 'completado').length / acts.length) * 100
    : null;
  if (indAvg === null && actPct === null) return 0;
  if (indAvg === null) return actPct!;
  if (actPct === null) return indAvg;
  return (indAvg + actPct) / 2;
}
