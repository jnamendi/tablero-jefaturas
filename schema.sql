-- ============================================================
-- BASE DE DATOS: tablero_jefaturas (MySQL)
-- Descripción: Estructura relacional normalizada para el Tablero de Control
-- ============================================================

CREATE DATABASE IF NOT EXISTS tablero_jefaturas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tablero_jefaturas;

-- ------------------------------------------------------------
-- Tabla: areas (Jefaturas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS areas (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) DEFAULT NULL,
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_area_code (code)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: activities (Actividades individuales de jefaturas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(36) NOT NULL,
  area_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('pendiente', 'en_progreso', 'completado') DEFAULT 'pendiente',
  assigned_date DATETIME DEFAULT NULL,
  due_date DATETIME DEFAULT NULL,
  points INT DEFAULT 0,
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_activities_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: indicators (Indicadores clave / KPIs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indicators (
  id VARCHAR(36) NOT NULL,
  area_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_indicators_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: indicator_period_values (Desglose mensual de metas y resultados)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS indicator_period_values (
  id INT AUTO_INCREMENT NOT NULL,
  indicator_id VARCHAR(36) NOT NULL,
  month_key VARCHAR(2) NOT NULL, -- '01' a '12' (Ene a Dic)
  goal DECIMAL(15,4) DEFAULT NULL,
  result DECIMAL(15,4) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_indicator_month (indicator_id, month_key),
  CONSTRAINT fk_indicator_values_indicator FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: projects (Proyectos estratégicos globales)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points INT DEFAULT 0,
  status ENUM('pendiente', 'en_progreso', 'completado') DEFAULT 'pendiente',
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla de Asociación Many-to-Many: project_areas (Jefaturas involucradas)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_areas (
  project_id VARCHAR(36) NOT NULL,
  area_id VARCHAR(36) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, area_id),
  CONSTRAINT fk_project_areas_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_areas_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: diarios (Diarios de Bitácora a Bordo)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diarios (
  id VARCHAR(36) NOT NULL,
  area_id VARCHAR(36) NOT NULL,
  type ENUM('primaria', 'secundaria') NOT NULL,
  name VARCHAR(255) NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- 'Diaria', 'Semanal', etc.
  objective TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_diarios_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: diario_entries (Entradas individuales en bitácoras)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diario_entries (
  id VARCHAR(36) NOT NULL,
  diario_id VARCHAR(36) NOT NULL,
  date DATETIME NOT NULL,
  comment TEXT NOT NULL,
  evidence_url VARCHAR(1024) DEFAULT NULL,
  evidence_desc VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_entries_diario FOREIGN KEY (diario_id) REFERENCES diarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: diario_evaluations (Evaluaciones del administrador por mes)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diario_evaluations (
  id INT AUTO_INCREMENT NOT NULL,
  diario_id VARCHAR(36) NOT NULL,
  month_key VARCHAR(7) NOT NULL, -- Formato 'YYYY-MM'
  status ENUM('cumple', 'no_cumple') DEFAULT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_diario_eval_month (diario_id, month_key),
  CONSTRAINT fk_evaluations_diario FOREIGN KEY (diario_id) REFERENCES diarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- INSERCIÓN DE DATOS DE SEMILLA (SEED DATA)
-- Basado exactamente en seedData() de la aplicación React
-- ============================================================

-- IDs estables de ejemplo para mantener la integridad referencial en el script
SET @area_operaciones_id = 'a1-seed-id-operaciones-2026';
SET @area_finanzas_id    = 'a2-seed-id-finanzas-2026';

-- 1. Inserción de Áreas
INSERT INTO areas (id, name, position, code) VALUES
(@area_operaciones_id, 'Ejemplo — Operaciones', 'Jefe de Operaciones', '1234'),
(@area_finanzas_id, 'Ejemplo — Finanzas', 'Jefe de Finanzas', '5678');

-- 2. Inserción de Actividades
INSERT INTO activities (id, area_id, title, status, assigned_date, due_date, points, completed_at) VALUES
('act-seed-1', @area_operaciones_id, 'Actualizar manual de procesos', 'en_progreso', '2026-06-20', '2026-07-15', 30, NULL),
('act-seed-2', @area_operaciones_id, 'Auditoría interna Q3', 'pendiente', '2026-06-25', '2026-08-01', 50, NULL),
('act-seed-3', @area_finanzas_id, 'Cierre contable de junio', 'completado', '2026-06-01', '2026-07-05', 40, '2026-06-05');

-- 3. Inserción de Indicadores
SET @ind_entregas_id  = 'ind-seed-1-entregas';
SET @ind_incidencias_id = 'ind-seed-2-incidencias';
SET @ind_reduccion_id = 'ind-seed-3-reduccion';

INSERT INTO indicators (id, area_id, name, unit, description) VALUES
(@ind_entregas_id, @area_operaciones_id, 'Órdenes entregadas a tiempo', '%', 'Porcentaje de órdenes entregadas dentro del plazo acordado con el cliente, calculado sobre el total de órdenes cerradas en el mes.'),
(@ind_incidencias_id, @area_operaciones_id, 'Incidencias resueltas', 'casos', 'Número de tickets de soporte cerrados y confirmados por el cliente durante el mes.'),
(@ind_reduccion_id, @area_finanzas_id, 'Reducción de gasto operativo', '%', 'Variación porcentual del gasto operativo del mes comparado contra el mismo mes del año anterior.');

-- 4. Metas y Resultados mensuales de Indicadores
-- Meta acumulada y resultados registrados (Ene a Abr en resultados, Ene a Dic en metas)
INSERT INTO indicator_period_values (indicator_id, month_key, goal, result) VALUES
-- Órdenes entregadas a tiempo (Metas: Ene-Nov: 8, Dic: 7. Resultados Ene: 15, Feb: 18, Mar: 20, Abr: 25)
(@ind_entregas_id, '01', 8, 15),
(@ind_entregas_id, '02', 8, 18),
(@ind_entregas_id, '03', 8, 20),
(@ind_entregas_id, '04', 8, 25),
(@ind_entregas_id, '05', 8, NULL),
(@ind_entregas_id, '06', 8, NULL),
(@ind_entregas_id, '07', 8, NULL),
(@ind_entregas_id, '08', 8, NULL),
(@ind_entregas_id, '09', 8, NULL),
(@ind_entregas_id, '10', 8, NULL),
(@ind_entregas_id, '11', 8, NULL),
(@ind_entregas_id, '12', 7, NULL),

-- Incidencias resueltas (Metas: Ene-Jun: 3, Jul: 4, Ago-Sep: 3, Oct-Dic: 4. Resultados Ene: 8, Feb: 10, Mar: 11, Abr: 11)
(@ind_incidencias_id, '01', 3, 8),
(@ind_incidencias_id, '02', 3, 10),
(@ind_incidencias_id, '03', 3, 11),
(@ind_incidencias_id, '04', 3, 11),
(@ind_incidencias_id, '05', 3, NULL),
(@ind_incidencias_id, '06', 3, NULL),
(@ind_incidencias_id, '07', 4, NULL),
(@ind_incidencias_id, '08', 3, NULL),
(@ind_incidencias_id, '09', 3, NULL),
(@ind_incidencias_id, '10', 4, NULL),
(@ind_incidencias_id, '11', 4, NULL),
(@ind_incidencias_id, '12', 4, NULL),

-- Reducción de gasto operativo (Metas: 1 para todos los meses. Resultados Ene: 2, Feb: 2, Mar: 2, Abr: 3)
(@ind_reduccion_id, '01', 1, 2),
(@ind_reduccion_id, '02', 1, 2),
(@ind_reduccion_id, '03', 1, 2),
(@ind_reduccion_id, '04', 1, 3),
(@ind_reduccion_id, '05', 1, NULL),
(@ind_reduccion_id, '06', 1, NULL),
(@ind_reduccion_id, '07', 1, NULL),
(@ind_reduccion_id, '08', 1, NULL),
(@ind_reduccion_id, '09', 1, NULL),
(@ind_reduccion_id, '10', 1, NULL),
(@ind_reduccion_id, '11', 1, NULL),
(@ind_reduccion_id, '12', 1, NULL);

-- 5. Inserción de Proyectos
SET @project_cierre_id = 'proj-seed-1-cierre';

INSERT INTO projects (id, name, description, points, status, completed_at) VALUES
(@project_cierre_id, 'Ejemplo — Optimización de cierre mensual', 'Iniciativa conjunta para reducir el tiempo de cierre financiero y operativo.', 60, 'completado', '2026-06-15');

-- 6. Inserción de project_areas (Muchos a Muchos)
INSERT INTO project_areas (project_id, area_id) VALUES
(@project_cierre_id, @area_operaciones_id),
(@project_cierre_id, @area_finanzas_id);

-- 7. Inserción de Diarios (Diarios a Bordo)
SET @diario_pedidos_id = 'diario-seed-1-pedidos';
SET @diario_cap_id     = 'diario-seed-2-capacitacion';

INSERT INTO diarios (id, area_id, type, name, frequency, objective) VALUES
(@diario_pedidos_id, @area_operaciones_id, 'primaria', 'Revisión de pedidos pendientes', 'Diaria', 'Verificar que no queden pedidos sin procesar al cierre del día.'),
(@diario_cap_id, @area_operaciones_id, 'secundaria', 'Capacitación al equipo', 'Mensual', 'Realizar al menos una sesión de capacitación al mes para el equipo de operaciones.');

-- 8. Entradas de Diarios (Bitácoras)
INSERT INTO diario_entries (id, diario_id, date, comment, evidence_url, evidence_desc) VALUES
('entry-seed-1', @diario_pedidos_id, '2026-07-01', 'Se revisaron todos los pedidos del día, sin pendientes.', '', '');
