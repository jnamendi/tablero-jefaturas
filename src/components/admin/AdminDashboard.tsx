import React, { useState } from 'react';
import { OrganizationData, Area, Activity, Indicator, Project, Diario } from '../../types';
import { uid, areaScore, scoreColor } from '../../utils/helpers';
import { Header } from '../shared/Header';
import { Dial } from '../ui/Dial';
import { Btn } from '../ui/Btn';
import { Table } from '../ui/Table';
import { StatusPill } from '../ui/StatusPill';
import { DueBadge } from '../ui/DueBadge';
import { EmptyNote } from '../ui/EmptyNote';
import { AdminIndicatorCard } from './AdminIndicatorCard';
import { AdminDiarioCard } from './AdminDiarioCard';
import { RankingTab } from './RankingTab';
import { FormModal, FormField } from '../modals/FormModal';
import { ProjectFormModal } from '../modals/ProjectFormModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import {
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
} from 'lucide-react';
import {
  PAPER,
  PANEL,
  GRID,
  INK,
  MUTED,
  COPPER,
  COPPER_DK,
} from '../../utils/constants';

interface AdminDashboardProps {
  data: OrganizationData;
  setData: React.Dispatch<React.SetStateAction<OrganizationData>>;
  onLogout: () => void;
}

type AdminModalState =
  | null
  | {
      kind: 'form';
      title: string;
      fields: FormField[];
      initial: Record<string, any>;
      onSave: (values: Record<string, any>) => void;
    }
  | {
      kind: 'project';
      title: string;
      initial: any;
      onSave: (values: any) => void;
    }
  | {
      kind: 'confirm';
      danger?: boolean;
      text: string;
      onConfirm: () => void;
    };

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  setData,
  onLogout,
}) => {
  const [tab, setTab] = useState<string>('resumen');
  const [modal, setModal] = useState<AdminModalState>(null);
  const { areas, activities, indicators, projects, diarios } = data;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tablero-datos-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const closeModal = () => setModal(null);

  // ---- Áreas ----
  const openAddArea = () =>
    setModal({
      kind: 'form',
      title: 'Nueva área / jefatura',
      fields: [
        { key: 'name', label: 'Nombre del área', required: true },
        { key: 'position', label: 'Cargo' },
        { key: 'code', label: 'Código de acceso', required: true },
      ],
      initial: { name: '', position: '', code: '' },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          areas: [
            ...d.areas,
            {
              id: uid(),
              name: v.name.trim(),
              position: v.position || '',
              code: v.code.trim(),
            },
          ],
        }));
        closeModal();
      },
    });

  const openEditArea = (a: Area) =>
    setModal({
      kind: 'form',
      title: 'Editar área',
      fields: [
        { key: 'name', label: 'Nombre del área', required: true },
        { key: 'position', label: 'Cargo' },
        { key: 'code', label: 'Código de acceso', required: true },
      ],
      initial: { name: a.name, position: a.position || '', code: a.code },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          areas: d.areas.map((x) =>
            x.id === a.id
              ? {
                  ...x,
                  name: v.name.trim(),
                  position: v.position || '',
                  code: v.code.trim(),
                }
              : x
          ),
        }));
        closeModal();
      },
    });

  const askRemoveArea = (a: Area) =>
    setModal({
      kind: 'confirm',
      danger: true,
      text: `¿Eliminar el área "${a.name}"? También se eliminarán sus actividades e indicadores.`,
      onConfirm: () => {
        setData((d) => ({
          ...d,
          areas: d.areas.filter((x) => x.id !== a.id),
          activities: d.activities.filter((x) => x.areaId !== a.id),
          indicators: d.indicators.filter((x) => x.areaId !== a.id),
        }));
        closeModal();
      },
    });

  // ---- Actividades ----
  const openAddActivity = (areaId: string) =>
    setModal({
      kind: 'form',
      title: 'Nueva actividad',
      fields: [
        { key: 'title', label: 'Título', required: true },
        { key: 'assignedDate', label: 'Fecha de asignación', type: 'date' },
        { key: 'dueDate', label: 'Fecha límite', type: 'date' },
        { key: 'points', label: 'Puntos al completarse', type: 'number', placeholder: '0' },
      ],
      initial: {
        title: '',
        assignedDate: new Date().toISOString().slice(0, 10),
        dueDate: '',
        points: 0,
      },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          activities: [
            ...d.activities,
            {
              id: uid(),
              areaId,
              title: v.title.trim(),
              status: 'pendiente',
              assignedDate: v.assignedDate || '',
              dueDate: v.dueDate || '',
              points: Number(v.points) || 0,
              completedAt: null,
            },
          ],
        }));
        closeModal();
      },
    });

  const openEditActivity = (act: Activity) =>
    setModal({
      kind: 'form',
      title: 'Editar actividad',
      fields: [
        { key: 'title', label: 'Título', required: true },
        { key: 'assignedDate', label: 'Fecha de asignación', type: 'date' },
        { key: 'dueDate', label: 'Fecha límite', type: 'date' },
        { key: 'points', label: 'Puntos al completarse', type: 'number', placeholder: '0' },
      ],
      initial: {
        title: act.title,
        assignedDate: act.assignedDate || '',
        dueDate: act.dueDate || '',
        points: act.points || 0,
      },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          activities: d.activities.map((x) =>
            x.id === act.id
              ? {
                  ...x,
                  title: v.title.trim(),
                  assignedDate: v.assignedDate || '',
                  dueDate: v.dueDate || '',
                  points: Number(v.points) || 0,
                }
              : x
          ),
        }));
        closeModal();
      },
    });

  const askRemoveActivity = (act: Activity) =>
    setModal({
      kind: 'confirm',
      danger: true,
      text: `¿Eliminar la actividad "${act.title}"?`,
      onConfirm: () => {
        setData((d) => ({
          ...d,
          activities: d.activities.filter((x) => x.id !== act.id),
        }));
        closeModal();
      },
    });

  // ---- Indicadores ----
  const openAddIndicator = (areaId: string) =>
    setModal({
      kind: 'form',
      title: 'Nuevo indicador',
      fields: [
        { key: 'name', label: 'Nombre del indicador', required: true },
        { key: 'unit', label: 'Unidad (%, casos, $...)' },
        {
          key: 'description',
          label: '¿Cómo se mide este indicador?',
          type: 'textarea',
          placeholder:
            'Ej. Número de órdenes entregadas dentro del plazo acordado, dividido entre el total de órdenes del mes.',
        },
      ],
      initial: { name: '', unit: '', description: '' },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          indicators: [
            ...d.indicators,
            {
              id: uid(),
              areaId,
              name: v.name.trim(),
              unit: v.unit || '',
              description: v.description || '',
              monthlyGoals: {},
              monthly: {},
              history: [],
            },
          ],
        }));
        closeModal();
      },
    });

  const openEditIndicator = (ind: Indicator) =>
    setModal({
      kind: 'form',
      title: 'Editar indicador',
      fields: [
        { key: 'name', label: 'Nombre del indicador', required: true },
        { key: 'unit', label: 'Unidad' },
        { key: 'description', label: '¿Cómo se mide este indicador?', type: 'textarea' },
      ],
      initial: { name: ind.name, unit: ind.unit || '', description: ind.description || '' },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          indicators: d.indicators.map((x) =>
            x.id === ind.id
              ? { ...x, name: v.name.trim(), unit: v.unit || '', description: v.description || '' }
              : x
          ),
        }));
        closeModal();
      },
    });

  const updateIndicator = (id: string, patch: Partial<Indicator>) =>
    setData((d) => ({
      ...d,
      indicators: d.indicators.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const askRemoveIndicator = (ind: Indicator) =>
    setModal({
      kind: 'confirm',
      danger: true,
      text: `¿Eliminar el indicador "${ind.name}"?`,
      onConfirm: () => {
        setData((d) => ({
          ...d,
          indicators: d.indicators.filter((x) => x.id !== ind.id),
        }));
        closeModal();
      },
    });

  // ---- Proyectos ----
  const openAddProject = () =>
    setModal({
      kind: 'project',
      title: 'Nuevo proyecto',
      initial: { name: '', description: '', areaIds: [], points: 0, status: 'pendiente' },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          projects: [
            ...(d.projects || []),
            {
              id: uid(),
              name: v.name.trim(),
              description: v.description || '',
              areaIds: v.areaIds,
              points: v.points || 0,
              status: v.status || 'pendiente',
              completedAt:
                v.status === 'completado' ? new Date().toISOString().slice(0, 10) : null,
            },
          ],
        }));
        closeModal();
      },
    });

  const openEditProject = (p: Project) =>
    setModal({
      kind: 'project',
      title: 'Editar proyecto',
      initial: {
        name: p.name,
        description: p.description || '',
        areaIds: p.areaIds || [],
        points: p.points || 0,
        status: p.status || 'pendiente',
      },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          projects: d.projects.map((x) => {
            if (x.id !== p.id) return x;
            const wasCompleted = x.status === 'completado';
            const nowCompleted = v.status === 'completado';
            return {
              ...x,
              name: v.name.trim(),
              description: v.description || '',
              areaIds: v.areaIds,
              points: v.points || 0,
              status: v.status || 'pendiente',
              completedAt: nowCompleted
                ? x.completedAt || new Date().toISOString().slice(0, 10)
                : wasCompleted && !nowCompleted
                ? null
                : x.completedAt,
            };
          }),
        }));
        closeModal();
      },
    });

  const askRemoveProject = (p: Project) =>
    setModal({
      kind: 'confirm',
      danger: true,
      text: `¿Eliminar el proyecto "${p.name}"?`,
      onConfirm: () => {
        setData((d) => ({
          ...d,
          projects: d.projects.filter((x) => x.id !== p.id),
        }));
        closeModal();
      },
    });

  // ---- Diario a Bordo ----
  const diarioFields: FormField[] = [
    {
      key: 'type',
      label: 'Tipo de actividad',
      type: 'select',
      options: [
        { value: 'primaria', label: 'Primaria' },
        { value: 'secundaria', label: 'Secundaria' },
      ],
    },
    { key: 'name', label: 'Nombre de la actividad', required: true },
    {
      key: 'frequency',
      label: 'Frecuencia',
      type: 'select',
      options: ['Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Otra'],
    },
    {
      key: 'objective',
      label: 'Objetivo de la actividad',
      type: 'textarea',
      placeholder: '¿Qué se busca lograr con esta actividad?',
    },
  ];

  const openAddDiario = (areaId: string) =>
    setModal({
      kind: 'form',
      title: 'Nueva actividad del Diario a Bordo',
      fields: diarioFields,
      initial: { type: 'primaria', name: '', frequency: 'Diaria', objective: '' },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          diarios: [
            ...(d.diarios || []),
            {
              id: uid(),
              areaId,
              type: v.type,
              name: v.name.trim(),
              frequency: v.frequency,
              objective: v.objective || '',
              entries: [],
              evaluations: {},
            },
          ],
        }));
        closeModal();
      },
    });

  const openEditDiario = (act: Diario) =>
    setModal({
      kind: 'form',
      title: 'Editar actividad del Diario a Bordo',
      fields: diarioFields,
      initial: { type: act.type, name: act.name, frequency: act.frequency, objective: act.objective || '' },
      onSave: (v) => {
        setData((d) => ({
          ...d,
          diarios: d.diarios.map((x) =>
            x.id === act.id
              ? {
                  ...x,
                  type: v.type,
                  name: v.name.trim(),
                  frequency: v.frequency,
                  objective: v.objective || '',
                }
              : x
          ),
        }));
        closeModal();
      },
    });

  const askRemoveDiario = (act: Diario) =>
    setModal({
      kind: 'confirm',
      danger: true,
      text: `¿Eliminar la actividad "${act.name}" del Diario a Bordo? También se perderá su bitácora.`,
      onConfirm: () => {
        setData((d) => ({
          ...d,
          diarios: d.diarios.filter((x) => x.id !== act.id),
        }));
        closeModal();
      },
    });

  const updateDiario = (id: string, patch: Partial<Diario>) =>
    setData((d) => ({
      ...d,
      diarios: d.diarios.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));

  return (
    <div style={{ minHeight: '100vh', background: PAPER }}>
      <Header
        title="Panel administrador"
        subtitle="Gestión de áreas, actividades e indicadores"
        onLogout={onLogout}
        onExport={exportData}
      />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 60px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '22px' }}>
          {[
            ['resumen', 'Resumen'],
            ['areas', 'Áreas'],
            ['actividades', 'Actividades'],
            ['indicadores', 'Indicadores'],
            ['proyectos', 'Proyectos'],
            ['diario', 'Diario a Bordo'],
            ['ranking', 'Ranking'],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: `1px solid ${GRID}`,
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                background: tab === k ? INK : PANEL,
                color: tab === k ? '#fff' : INK,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === 'resumen' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '14px',
            }}
          >
            {areas.length === 0 && <EmptyNote text="Crea tu primera área en la pestaña 'Áreas'." />}
            {areas.map((a) => {
              const s = areaScore(a.id, indicators, activities);
              return (
                <div
                  key={a.id}
                  style={{
                    background: PANEL,
                    border: `1px solid ${GRID}`,
                    borderRadius: '6px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Dial pct={s} color={scoreColor(s)} label={a.name} />
                  <div
                    style={{ fontSize: '11px', color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    código: {a.code}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'areas' && (
          <div>
            <Btn onClick={openAddArea} style={{ marginBottom: '14px' }}>
              <Plus size={14} /> Nueva área
            </Btn>
            <Table
              rows={areas}
              cols={['Nombre', 'Cargo', 'Código', '']}
              render={(a: Area) => [
                a.name,
                <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: MUTED }}>
                  {a.position || '—'}
                </span>,
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{a.code}</span>,
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <Btn variant="ghost" onClick={() => openEditArea(a)} style={{ padding: '5px 9px' }}>
                    <Pencil size={13} />
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={() => askRemoveArea(a)}
                    style={{ padding: '5px 9px' }}
                  >
                    <Trash2 size={13} />
                  </Btn>
                </div>,
              ]}
            />
          </div>
        )}

        {tab === 'actividades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {areas.length === 0 && <EmptyNote text="Primero crea un área en la pestaña 'Áreas'." />}
            {areas.map((a) => (
              <div key={a.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Roboto Slab', serif",
                      fontWeight: 700,
                      fontSize: '14.5px',
                      color: INK,
                    }}
                  >
                    {a.name}
                  </div>
                  <Btn
                    variant="ghost"
                    onClick={() => openAddActivity(a.id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    <Plus size={12} /> Añadir
                  </Btn>
                </div>
                <Table
                  rows={activities.filter((x) => x.areaId === a.id)}
                  cols={['Actividad', 'Asignada', 'Vence', 'Días', 'Pts', 'Estado', '']}
                  aligns={['left', 'left', 'left', 'left', 'center', 'left', 'right']}
                  render={(act: Activity) => [
                    act.title,
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>
                      {act.assignedDate || '—'}
                    </span>,
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>
                      {act.dueDate || '—'}
                    </span>,
                    <DueBadge dueDate={act.dueDate} status={act.status} />,
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '12px',
                        fontWeight: 700,
                        color: COPPER_DK,
                      }}
                    >
                      {act.points || 0}
                    </span>,
                    <StatusPill status={act.status} />,
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <Btn
                        variant="ghost"
                        onClick={() => openEditActivity(act)}
                        style={{ padding: '5px 9px' }}
                      >
                        <Pencil size={13} />
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => askRemoveActivity(act)}
                        style={{ padding: '5px 9px' }}
                      >
                        <Trash2 size={13} />
                      </Btn>
                    </div>,
                  ]}
                  emptyText="Sin actividades."
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'indicadores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {areas.length === 0 && <EmptyNote text="Primero crea un área en la pestaña 'Áreas'." />}
            {areas.map((a) => (
              <div key={a.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Roboto Slab', serif",
                      fontWeight: 700,
                      fontSize: '14.5px',
                      color: INK,
                    }}
                  >
                    {a.name}
                  </div>
                  <Btn
                    variant="ghost"
                    onClick={() => openAddIndicator(a.id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    <Plus size={12} /> Añadir indicador
                  </Btn>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {indicators.filter((x) => x.areaId === a.id).length === 0 && (
                    <div
                      style={{
                        background: PANEL,
                        border: `1px solid ${GRID}`,
                        borderRadius: '6px',
                        padding: '16px',
                      }}
                    >
                      <EmptyNote text="Sin indicadores." />
                    </div>
                  )}
                  {indicators
                    .filter((x) => x.areaId === a.id)
                    .map((ind) => (
                      <AdminIndicatorCard
                        key={ind.id}
                        ind={ind}
                        onUpdate={updateIndicator}
                        onEdit={() => openEditIndicator(ind)}
                        onRemove={() => askRemoveIndicator(ind)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'proyectos' && (
          <div>
            <Btn onClick={openAddProject} style={{ marginBottom: '14px' }}>
              <Plus size={14} /> Nuevo proyecto
            </Btn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(!projects || projects.length === 0) && (
                <div
                  style={{
                    background: PANEL,
                    border: `1px solid ${GRID}`,
                    borderRadius: '6px',
                    padding: '16px',
                  }}
                >
                  <EmptyNote text="Aún no hay proyectos. Crea el primero arriba." />
                </div>
              )}
              {(projects || []).map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: PANEL,
                    border: `1px solid ${GRID}`,
                    borderRadius: '6px',
                    padding: '16px 18px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <FolderKanban size={20} color={COPPER} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div
                            style={{
                              fontFamily: "'Roboto Slab', serif",
                              fontWeight: 700,
                              fontSize: '15px',
                              color: INK,
                            }}
                          >
                            {p.name}
                          </div>
                          <StatusPill status={p.status || 'pendiente'} />
                          <span
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: '11px',
                              fontWeight: 700,
                              color: COPPER_DK,
                            }}
                          >
                            {p.points || 0} pts
                          </span>
                        </div>
                        {p.description && (
                          <div
                            style={{
                              fontFamily: "'IBM Plex Sans', sans-serif",
                              fontSize: '12.5px',
                              color: MUTED,
                              marginTop: '3px',
                              maxWidth: '520px',
                            }}
                          >
                            {p.description}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {(p.areaIds || []).length === 0 && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                color: MUTED,
                                fontFamily: "'IBM Plex Sans', sans-serif",
                              }}
                            >
                              Sin jefaturas asignadas
                            </span>
                          )}
                          {(p.areaIds || []).map((aid) => {
                            const ar = areas.find((x) => x.id === aid);
                            if (!ar) return null;
                            return (
                              <span
                                key={aid}
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: COPPER_DK,
                                  background: '#F3E3D8',
                                  padding: '3px 9px',
                                  borderRadius: '3px',
                                }}
                              >
                                {ar.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Btn
                        variant="ghost"
                        onClick={() => openEditProject(p)}
                        style={{ padding: '6px 9px' }}
                      >
                        <Pencil size={13} />
                      </Btn>
                      <Btn
                        variant="danger"
                        onClick={() => askRemoveProject(p)}
                        style={{ padding: '6px 9px' }}
                      >
                        <Trash2 size={13} />
                      </Btn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'diario' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {areas.length === 0 && <EmptyNote text="Primero crea un área en la pestaña 'Áreas'." />}
            {areas.map((a) => (
              <div key={a.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Roboto Slab', serif",
                      fontWeight: 700,
                      fontSize: '14.5px',
                      color: INK,
                    }}
                  >
                    {a.name}
                  </div>
                  <Btn
                    variant="ghost"
                    onClick={() => openAddDiario(a.id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    <Plus size={12} /> Añadir actividad
                  </Btn>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(diarios || []).filter((x) => x.areaId === a.id).length === 0 && (
                    <div
                      style={{
                        background: PANEL,
                        border: `1px solid ${GRID}`,
                        borderRadius: '6px',
                        padding: '16px',
                      }}
                    >
                      <EmptyNote text="Sin actividades del Diario a Bordo." />
                    </div>
                  )}
                  {(diarios || [])
                    .filter((x) => x.areaId === a.id)
                    .map((act) => (
                      <AdminDiarioCard
                        key={act.id}
                        act={act}
                        onUpdate={updateDiario}
                        onEdit={() => openEditDiario(act)}
                        onRemove={() => askRemoveDiario(act)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'ranking' && (
          <RankingTab areas={areas} activities={activities} projects={projects} />
        )}
      </div>

      {modal?.kind === 'form' && (
        <FormModal
          title={modal.title}
          fields={modal.fields}
          initial={modal.initial}
          onSave={modal.onSave}
          onCancel={closeModal}
        />
      )}
      {modal?.kind === 'project' && (
        <ProjectFormModal
          title={modal.title}
          initial={modal.initial}
          areas={areas}
          onSave={modal.onSave}
          onCancel={closeModal}
        />
      )}
      {modal?.kind === 'confirm' && (
        <ConfirmModal
          text={modal.text}
          danger={modal.danger}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};
export default AdminDashboard;
