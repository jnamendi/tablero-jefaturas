# Migration Specification

This track migrates the monolith React application `tablero-jefaturas.jsx` into a modular, modern React + TypeScript + Vite project while keeping 100% of its existing functionality.

## Core Features to Maintain
1. **Authentication / Role-Based Access**:
   - Administrador: Login via code (`ADMIN_CODE = "ADMIN2026"`). Full management of areas, activities, indicators, projects, diaries, and live scoreboard / ranking.
   - Jefatura: Login by selecting area and entering local access code.
2. **Data Model**:
   - `Area`: Name, position/cargo, access code.
   - `Activity`: Title, assigned date, due date, status, points, completed date.
   - `Indicator`: Name, unit, description, monthly goals, monthly results.
   - `Project`: Name, description, points, status, completed date, involved areas (multi-select).
   - `Diario`: Type (primary/secondary), frequency, objective, log entries, monthly evaluations.
3. **Calculations & Behavior**:
   - Business days remaining/overdue (`businessDaysUntil`).
   - Area Score (`areaScore`): 50% average indicator completion + 50% activity completion rate.
   - Points breakdown and monthly cumulative series (`areaPointsBreakdown`, `areaPointsSeries`).
   - Circular visual dials (`Dial`) representing percentage metrics.
   - Decimal live formatting input (`formatLive`, `parseLive`).
4. **Data Persistence**:
   - Syncs dynamically using `window.storage` (with key `"org-data"`). Fallback to standard seed data (`seedData()`) if storage is empty.
5. **Aesthetics & Styling**:
   - Rich technical blueprint theme (grises azulados, copper, green, amber, brick).
   - Dynamic SVG background on the login page (`LoginBackdrop`).
   - Fonts: Roboto Slab, IBM Plex Sans, IBM Plex Mono.
