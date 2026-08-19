import { OrganizationData } from '../types';

export function seedData(): OrganizationData {
  const a1 = 'seed-area-operaciones';
  const a2 = 'seed-area-finanzas';
  
  return {
    areas: [
      { id: a1, name: "Ejemplo — Operaciones", position: "Jefe de Operaciones", code: "1234" },
      { id: a2, name: "Ejemplo — Finanzas", position: "Jefe de Finanzas", code: "5678" },
    ],
    activities: [
      { id: 'seed-act-manual', areaId: a1, title: "Actualizar manual de procesos", status: "en_progreso", assignedDate: "2026-06-20", dueDate: "2026-07-15", points: 30, completedAt: null },
      { id: 'seed-act-auditoria', areaId: a1, title: "Auditoría interna Q3", status: "pendiente", assignedDate: "2026-06-25", dueDate: "2026-08-01", points: 50, completedAt: null },
      { id: 'seed-act-cierre', areaId: a2, title: "Cierre contable de junio", status: "completado", assignedDate: "2026-06-01", dueDate: "2026-07-05", points: 40, completedAt: "2026-06-05" },
    ],
    indicators: [
      { id: 'seed-ind-ordenes', areaId: a1, name: "Órdenes entregadas a tiempo", unit: "%",
        description: "Porcentaje de órdenes entregadas dentro del plazo acordado con el cliente, calculado sobre el total de órdenes cerradas en el mes.",
        monthlyGoals: { "01": 8, "02": 8, "03": 8, "04": 8, "05": 8, "06": 8, "07": 8, "08": 8, "09": 8, "10": 8, "11": 8, "12": 7 },
        monthly: { "01": 15, "02": 18, "03": 20, "04": 25 }, history: [] },
      { id: 'seed-ind-incidencias', areaId: a1, name: "Incidencias resueltas", unit: "casos",
        description: "Número de tickets de soporte cerrados y confirmados por el cliente durante el mes.",
        monthlyGoals: { "01": 3, "02": 3, "03": 3, "04": 3, "05": 3, "06": 3, "07": 4, "08": 3, "09": 3, "10": 4, "11": 4, "12": 4 },
        monthly: { "01": 8, "02": 10, "03": 11, "04": 11 }, history: [] },
      { id: 'seed-ind-reduccion', areaId: a2, name: "Reducción de gasto operativo", unit: "%",
        description: "Variación porcentual del gasto operativo del mes comparado contra el mismo mes del año anterior.",
        monthlyGoals: { "01": 1, "02": 1, "03": 1, "04": 1, "05": 1, "06": 1, "07": 1, "08": 1, "09": 1, "10": 1, "11": 1, "12": 1 },
        monthly: { "01": 2, "02": 2, "03": 2, "04": 3 }, history: [] },
    ],
    projects: [
      { id: 'seed-proj-optimizacion', name: "Ejemplo — Optimización de cierre mensual", description: "Iniciativa conjunta para reducir el tiempo de cierre financiero y operativo.", areaIds: [a1, a2], points: 60, status: "completado", completedAt: "2026-06-15" },
    ],
    diarios: [
      {
        id: 'seed-diario-pedidos', areaId: a1, type: "primaria", name: "Revisión de pedidos pendientes",
        frequency: "Diaria", objective: "Verificar que no queden pedidos sin procesar al cierre del día.",
        entries: [
          { id: 'seed-entry-revision', date: "2026-07-01", comment: "Se revisaron todos los pedidos del día, sin pendientes.", evidenceUrl: "", evidenceDesc: "", createdAt: "2026-07-01T17:00:00" },
        ],
        evaluations: {},
      },
      {
        id: 'seed-diario-capacitacion', areaId: a1, type: "secundaria", name: "Capacitación al equipo",
        frequency: "Mensual", objective: "Realizar al menos una sesión de capacitación al mes para el equipo de operaciones.",
        entries: [], evaluations: {},
      },
    ],
  };
}
