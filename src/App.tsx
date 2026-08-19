"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OrganizationData, SessionState, Indicator, Activity, Diario } from './types';
import { seedData } from './data/seed';
import { Login } from './components/auth/Login';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { JefaturaDashboard } from './components/jefatura/JefaturaDashboard';
import { ADMIN_CODE } from './utils/constants';

export default function App() {
  const [data, setData] = useState<OrganizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionState>(null);
  const [loginError, setLoginError] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        } else {
          setData(seedData());
        }
      } catch (err) {
        console.error('Error fetching data from server, falling back to seed:', err);
        setData(seedData());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback((next: OrganizationData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });

        if (res.status === 409) {
          const errData = await res.json();
          if (errData.error === 'unique_code_violation') {
            alert('⚠️ Error de duplicado: El código de acceso ingresado ya está siendo usado por otra jefatura. Por favor, utiliza un código diferente para cada área.');
            
            // Reload the last known valid state from the database to revert the UI state
            const reloadRes = await fetch('/api/data');
            if (reloadRes.ok) {
              const freshData = await reloadRes.json();
              setData(freshData);
            }
          }
        }
      } catch (e) {
        console.error('Error saving data to server:', e);
      }
    }, 250);
  }, []);

  const updateData = useCallback(
    (updater: OrganizationData | ((prev: OrganizationData) => OrganizationData)) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const norm = (s: string) => (s || '').trim().toUpperCase();

  const handleEnterAdmin = (code: string) => {
    if (norm(code) === norm(ADMIN_CODE)) {
      setSession({ role: 'admin' });
      setLoginError('');
    } else {
      setLoginError(`Código de administrador incorrecto. (escribiste: "${code}")`);
    }
  };

  const handleEnterArea = (areaId: string, code: string) => {
    if (!data) return;
    const area = data.areas.find((a) => a.id === areaId);
    if (!area) {
      setLoginError('Selecciona un área.');
      return;
    }
    if (norm(area.code) !== norm(code)) {
      setLoginError(`Código de acceso incorrecto. (escribiste: "${code}")`);
      return;
    }
    setSession({ role: 'jefatura', areaId });
    setLoginError('');
  };

  if (loading || !data) {
    return <Login areas={[]} loading={true} onEnterAdmin={() => {}} onEnterArea={() => {}} />;
  }

  if (!session) {
    return (
      <Login
        areas={data.areas}
        onEnterAdmin={handleEnterAdmin}
        onEnterArea={handleEnterArea}
        error={loginError}
      />
    );
  }

  if (session.role === 'admin') {
    return (
      <AdminDashboard
        data={data}
        setData={updateData as React.Dispatch<React.SetStateAction<OrganizationData>>}
        onLogout={() => setSession(null)}
      />
    );
  }

  const area = data.areas.find((a) => a.id === session.areaId);
  if (!area) {
    setSession(null);
    return null;
  }

  return (
    <JefaturaDashboard
      area={area}
      areas={data.areas}
      activities={data.activities}
      indicators={data.indicators}
      projects={data.projects}
      diarios={data.diarios}
      onUpdateIndicator={(id: string, patch: Partial<Indicator>) =>
        updateData((d) => ({
          ...d,
          indicators: d.indicators.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }))
      }
      onUpdateActivity={(id: string, patch: Partial<Activity>) =>
        updateData((d) => ({
          ...d,
          activities: d.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }))
      }
      onUpdateDiario={(id: string, patch: Partial<Diario>) =>
        updateData((d) => ({
          ...d,
          diarios: d.diarios.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }))
      }
      onLogout={() => setSession(null)}
    />
  );
}
