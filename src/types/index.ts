export interface Area {
  id: string;
  name: string;
  position?: string;
  code: string;
}

export type ActivityStatus = 'pendiente' | 'en_progreso' | 'completado';

export interface Activity {
  id: string;
  areaId: string;
  title: string;
  status: ActivityStatus;
  assignedDate: string;
  dueDate: string;
  points: number;
  completedAt: string | null;
}

export interface Indicator {
  id: string;
  areaId: string;
  name: string;
  unit: string;
  description?: string;
  monthlyGoals: Record<string, number | string>;
  monthly: Record<string, number | string>;
  history?: any[]; // Kept for exact structure preservation
}

export type ProjectStatus = 'pendiente' | 'en_progreso' | 'completado';

export interface Project {
  id: string;
  name: string;
  description?: string;
  areaIds: string[];
  points: number;
  status: ProjectStatus;
  completedAt: string | null;
}

export interface DiarioEntry {
  id: string;
  date: string;
  comment: string;
  evidenceUrl?: string;
  evidenceDesc?: string;
  createdAt: string;
}

export interface DiarioEvaluation {
  status: 'cumple' | 'no_cumple' | '' | null;
  note?: string;
}

export interface Diario {
  id: string;
  areaId: string;
  type: 'primaria' | 'secundaria';
  name: string;
  frequency: string;
  objective?: string;
  entries: DiarioEntry[];
  evaluations: Record<string, DiarioEvaluation>; // Monthly evaluations keyed by month (YYYY-MM)
}

export interface OrganizationData {
  areas: Area[];
  activities: Activity[];
  indicators: Indicator[];
  projects: Project[];
  diarios: Diario[];
}

export type SessionState =
  | null
  | { role: 'admin' }
  | { role: 'jefatura'; areaId: string };
