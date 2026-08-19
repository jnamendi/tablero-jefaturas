# Implementation Plan - Migration Track

This plan decomposes the monolith React application into a modular React, TypeScript, and Vite-based project structure.

## Phases

### Phase 1: Project Setup & Package Installation
1. Initialize a React + TS + Vite template.
2. Add necessary configuration files (`tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`).
3. Install standard project dependencies:
   - `react`, `react-dom` (v18 or newer)
   - `lucide-react`
   - `recharts`
   - `@types/react`, `@types/react-dom`
4. Add global CSS in `src/index.css` (importing fonts and the spin animation).

### Phase 2: Define TypeScript Interfaces
- Create `src/types/index.ts` to define types:
  - `Area`, `Activity`, `Indicator`, `Project`, `DiarioEntry`, `DiarioEvaluation`, `Diario`, `OrganizationData`, `SessionState`.

### Phase 3: Extract Utility Functions & Mock Data
- Create `src/utils/helpers.ts` containing:
  - `uid`, `currentMonthKey`, `monthKeyLabel`, `hasResultValue`, `indicatorAccumulated`, `indicatorGoalTotal`, `indicatorGoalToDate`, `fmt`, `formatLive`, `parseLive`, `clampPct`, `scoreColor`, `businessDaysUntil`, `areaPointsBreakdown`, `areaPointsSeries`, `areaScore`.
- Create `src/data/seed.ts` containing `seedData()`.

### Phase 4: Create Reusable UI Components & Modals
- Extract `src/components/ui/` components:
  - `Btn.tsx`, `Dial.tsx`, `StatusPill.tsx`, `DueBadge.tsx`, `EmptyNote.tsx`, `TypeBadge.tsx`, `EvalBadge.tsx`, `Table.tsx`.
- Extract `src/components/modals/` overlays:
  - `Overlay.tsx`, `FormModal.tsx`, `ProjectFormModal.tsx`, `ConfirmModal.tsx`.

### Phase 5: Extract Feature Modules
- Extract `src/components/shared/Header.tsx`.
- Extract `src/components/auth/LoginBackdrop.tsx` and `src/components/auth/Login.tsx`.
- Extract `src/components/jefatura/` dashboard and sub-components:
  - `MonthlyBreakdown.tsx`, `IndicatorCard.tsx`, `JefaturaDiarioCard.tsx`, `JefaturaDashboard.tsx`.
- Extract `src/components/admin/` dashboard and sub-components:
  - `AdminIndicatorCard.tsx`, `AdminDiarioCard.tsx`, `RankingTab.tsx`, `AdminDashboard.tsx`.

### Phase 6: Core Application Assembly & Verification
- Assemble in `src/App.tsx` handling local state, session management, storage integration with debounce persistence.
- Remove old `tablero-jefaturas.jsx` once verified.
