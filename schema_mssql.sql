-- ============================================================
-- BASE DE DATOS: tablero_jefaturas (MS SQL Server 2019 / v15.0+)
-- Descripción: Estructura relacional normalizada y adaptada a Transact-SQL
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'tablero_jefaturas')
BEGIN
    CREATE DATABASE tablero_jefaturas;
END
GO

USE tablero_jefaturas;
GO

-- ------------------------------------------------------------
-- Tabla: areas (Jefaturas)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.areas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.areas (
        id VARCHAR(36) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        position NVARCHAR(255) NULL,
        code VARCHAR(50) NOT NULL,
        created_at DATETIME2 CONSTRAINT df_areas_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_areas_updated DEFAULT GETDATE(),
        CONSTRAINT pk_areas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT uq_areas_code UNIQUE (code)
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: activities (Actividades individuales de jefaturas)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.activities', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.activities (
        id VARCHAR(36) NOT NULL,
        area_id VARCHAR(36) NOT NULL,
        title NVARCHAR(255) NOT NULL,
        status VARCHAR(50) CONSTRAINT df_activities_status DEFAULT 'pendiente',
        assigned_date DATETIME2 NULL,
        due_date DATETIME2 NULL,
        points INT CONSTRAINT df_activities_points DEFAULT 0,
        completed_at DATETIME2 NULL,
        created_at DATETIME2 CONSTRAINT df_activities_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_activities_updated DEFAULT GETDATE(),
        CONSTRAINT pk_activities PRIMARY KEY CLUSTERED (id),
        CONSTRAINT fk_activities_area FOREIGN KEY (area_id) REFERENCES dbo.areas(id) ON DELETE CASCADE,
        CONSTRAINT chk_activities_status CHECK (status IN ('pendiente', 'en_progreso', 'completado'))
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: indicators (Indicadores clave / KPIs)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.indicators', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.indicators (
        id VARCHAR(36) NOT NULL,
        area_id VARCHAR(36) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        unit NVARCHAR(50) NOT NULL,
        description NVARCHAR(MAX) NULL,
        created_at DATETIME2 CONSTRAINT df_indicators_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_indicators_updated DEFAULT GETDATE(),
        CONSTRAINT pk_indicators PRIMARY KEY CLUSTERED (id),
        CONSTRAINT fk_indicators_area FOREIGN KEY (area_id) REFERENCES dbo.areas(id) ON DELETE CASCADE
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: indicator_period_values (Desglose mensual de metas y resultados)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.indicator_period_values', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.indicator_period_values (
        id INT IDENTITY(1,1) NOT NULL,
        indicator_id VARCHAR(36) NOT NULL,
        month_key VARCHAR(2) NOT NULL, -- '01' a '12' (Ene a Dic)
        goal DECIMAL(15,4) NULL,
        result DECIMAL(15,4) NULL,
        created_at DATETIME2 CONSTRAINT df_period_values_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_period_values_updated DEFAULT GETDATE(),
        CONSTRAINT pk_indicator_period_values PRIMARY KEY CLUSTERED (id),
        CONSTRAINT uq_indicator_month UNIQUE (indicator_id, month_key),
        CONSTRAINT fk_indicator_values_indicator FOREIGN KEY (indicator_id) REFERENCES dbo.indicators(id) ON DELETE CASCADE,
        CONSTRAINT chk_indicator_month_key CHECK (month_key LIKE '[0-1][0-9]')
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: projects (Proyectos estratégicos globales)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.projects', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.projects (
        id VARCHAR(36) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        points INT CONSTRAINT df_projects_points DEFAULT 0,
        status VARCHAR(50) CONSTRAINT df_projects_status DEFAULT 'pendiente',
        completed_at DATETIME2 NULL,
        created_at DATETIME2 CONSTRAINT df_projects_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_projects_updated DEFAULT GETDATE(),
        CONSTRAINT pk_projects PRIMARY KEY CLUSTERED (id),
        CONSTRAINT chk_projects_status CHECK (status IN ('pendiente', 'en_progreso', 'completado'))
    );
END
GO

-- ------------------------------------------------------------
-- Tabla de Asociación Many-to-Many: project_areas (Jefaturas involucradas)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.project_areas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.project_areas (
        project_id VARCHAR(36) NOT NULL,
        area_id VARCHAR(36) NOT NULL,
        assigned_at DATETIME2 CONSTRAINT df_project_areas_assigned DEFAULT GETDATE(),
        CONSTRAINT pk_project_areas PRIMARY KEY CLUSTERED (project_id, area_id),
        CONSTRAINT fk_project_areas_project FOREIGN KEY (project_id) REFERENCES dbo.projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_project_areas_area FOREIGN KEY (area_id) REFERENCES dbo.areas(id) ON DELETE CASCADE
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: diarios (Diarios de Bitácora a Bordo)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.diarios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.diarios (
        id VARCHAR(36) NOT NULL,
        area_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        frequency NVARCHAR(50) NOT NULL, -- 'Diaria', 'Semanal', etc.
        objective NVARCHAR(MAX) NULL,
        created_at DATETIME2 CONSTRAINT df_diarios_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_diarios_updated DEFAULT GETDATE(),
        CONSTRAINT pk_diarios PRIMARY KEY CLUSTERED (id),
        CONSTRAINT fk_diarios_area FOREIGN KEY (area_id) REFERENCES dbo.areas(id) ON DELETE CASCADE,
        CONSTRAINT chk_diarios_type CHECK (type IN ('primaria', 'secundaria'))
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: diario_entries (Entradas individuales en bitácoras)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.diario_entries', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.diario_entries (
        id VARCHAR(36) NOT NULL,
        diario_id VARCHAR(36) NOT NULL,
        date DATETIME2 NOT NULL,
        comment NVARCHAR(MAX) NOT NULL,
        evidence_url VARCHAR(1024) NULL,
        evidence_desc NVARCHAR(512) NULL,
        created_at DATETIME2 CONSTRAINT df_entries_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_entries_updated DEFAULT GETDATE(),
        CONSTRAINT pk_diario_entries PRIMARY KEY CLUSTERED (id),
        CONSTRAINT fk_entries_diario FOREIGN KEY (diario_id) REFERENCES dbo.diarios(id) ON DELETE CASCADE
    );
END
GO

-- ------------------------------------------------------------
-- Tabla: diario_evaluations (Evaluaciones del administrador por mes)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.diario_evaluations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.diario_evaluations (
        id INT IDENTITY(1,1) NOT NULL,
        diario_id VARCHAR(36) NOT NULL,
        month_key VARCHAR(7) NOT NULL, -- Formato 'YYYY-MM'
        status VARCHAR(50) NULL,
        note NVARCHAR(MAX) NULL,
        created_at DATETIME2 CONSTRAINT df_evaluations_created DEFAULT GETDATE(),
        updated_at DATETIME2 CONSTRAINT df_evaluations_updated DEFAULT GETDATE(),
        CONSTRAINT pk_diario_evaluations PRIMARY KEY CLUSTERED (id),
        CONSTRAINT uq_diario_eval_month UNIQUE (diario_id, month_key),
        CONSTRAINT fk_evaluations_diario FOREIGN KEY (diario_id) REFERENCES dbo.diarios(id) ON DELETE CASCADE,
        CONSTRAINT chk_diario_eval_status CHECK (status IN ('cumple', 'no_cumple'))
    );
END
GO


-- ============================================================
-- CREACIÓN DE TRIGGERS PARA ACTUALIZACIÓN DE updated_at
-- MS SQL requiere triggers individuales ya que no posee "ON UPDATE CURRENT_TIMESTAMP"
-- ============================================================

CREATE OR ALTER TRIGGER dbo.trg_areas_update
ON dbo.areas
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.areas
    SET updated_at = GETDATE()
    FROM dbo.areas t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_activities_update
ON dbo.activities
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.activities
    SET updated_at = GETDATE()
    FROM dbo.activities t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_indicators_update
ON dbo.indicators
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.indicators
    SET updated_at = GETDATE()
    FROM dbo.indicators t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_indicator_period_values_update
ON dbo.indicator_period_values
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.indicator_period_values
    SET updated_at = GETDATE()
    FROM dbo.indicator_period_values t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_projects_update
ON dbo.projects
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.projects
    SET updated_at = GETDATE()
    FROM dbo.projects t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_diarios_update
ON dbo.diarios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.diarios
    SET updated_at = GETDATE()
    FROM dbo.diarios t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_diario_entries_update
ON dbo.diario_entries
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.diario_entries
    SET updated_at = GETDATE()
    FROM dbo.diario_entries t INNER JOIN inserted i ON t.id = i.id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_diario_evaluations_update
ON dbo.diario_evaluations
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.diario_evaluations
    SET updated_at = GETDATE()
    FROM dbo.diario_evaluations t INNER JOIN inserted i ON t.id = i.id;
END;
GO


-- ============================================================
-- INSERCIÓN DE DATOS DE SEMILLA (SEED DATA)
-- Transact-SQL utiliza DECLARE para el manejo de variables
-- ============================================================

DECLARE @area_operaciones_id VARCHAR(36) = 'a1-seed-id-operaciones-2026';
DECLARE @area_finanzas_id    VARCHAR(36) = 'a2-seed-id-finanzas-2026';

-- 1. Inserción de Áreas
INSERT INTO dbo.areas (id, name, position, code) VALUES
(@area_operaciones_id, N'Ejemplo — Operaciones', N'Jefe de Operaciones', '1234'),
(@area_finanzas_id, N'Ejemplo — Finanzas', N'Jefe de Finanzas', '5678');

-- 2. Inserción de Actividades
INSERT INTO dbo.activities (id, area_id, title, status, assigned_date, due_date, points, completed_at) VALUES
('act-seed-1', @area_operaciones_id, N'Actualizar manual de procesos', 'en_progreso', '2026-06-20', '2026-07-15', 30, NULL),
('act-seed-2', @area_operaciones_id, N'Auditoría interna Q3', 'pendiente', '2026-06-25', '2026-08-01', 50, NULL),
('act-seed-3', @area_finanzas_id, N'Cierre contable de junio', 'completado', '2026-06-01', '2026-07-05', 40, '2026-06-05');

-- 3. Inserción de Indicadores
DECLARE @ind_entregas_id  VARCHAR(36) = 'ind-seed-1-entregas';
DECLARE @ind_incidencias_id VARCHAR(36) = 'ind-seed-2-incidencias';
DECLARE @ind_reduccion_id VARCHAR(36) = 'ind-seed-3-reduccion';

INSERT INTO dbo.indicators (id, area_id, name, unit, description) VALUES
(@ind_entregas_id, @area_operaciones_id, N'Órdenes entregadas a tiempo', N'%', N'Porcentaje de órdenes entregadas dentro del plazo acordado con el cliente, calculado sobre el total de órdenes cerradas en el mes.'),
(@ind_incidencias_id, @area_operaciones_id, N'Incidencias resueltas', N'casos', N'Número de tickets de soporte cerrados y confirmados por el cliente durante el mes.'),
(@ind_reduccion_id, @area_finanzas_id, N'Reducción de gasto operativo', N'%', N'Variación porcentual del gasto operativo del mes comparado contra el mismo mes del año anterior.');

-- 4. Metas y Resultados mensuales de Indicadores
INSERT INTO dbo.indicator_period_values (indicator_id, month_key, goal, result) VALUES
-- Órdenes entregadas a tiempo
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

-- Incidencias resueltas
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

-- Reducción de gasto operativo
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
DECLARE @project_cierre_id VARCHAR(36) = 'proj-seed-1-cierre';

INSERT INTO dbo.projects (id, name, description, points, status, completed_at) VALUES
(@project_cierre_id, N'Ejemplo — Optimización de cierre mensual', N'Iniciativa conjunta para reducir el tiempo de cierre financiero y operativo.', 60, 'completado', '2026-06-15');

-- 6. Inserción de project_areas (Muchos a Muchos)
INSERT INTO dbo.project_areas (project_id, area_id) VALUES
(@project_cierre_id, @area_operaciones_id),
(@project_cierre_id, @area_finanzas_id);

-- 7. Inserción de Diarios (Diarios a Bordo)
DECLARE @diario_pedidos_id VARCHAR(36) = 'diario-seed-1-pedidos';
DECLARE @diario_cap_id     VARCHAR(36) = 'diario-seed-2-capacitacion';

INSERT INTO dbo.diarios (id, area_id, type, name, frequency, objective) VALUES
(@diario_pedidos_id, @area_operaciones_id, 'primaria', N'Revisión de pedidos pendientes', 'Diaria', N'Verificar que no queden pedidos sin procesar al cierre del día.'),
(@diario_cap_id, @area_operaciones_id, 'secundaria', N'Capacitación al equipo', 'Mensual', N'Realizar al menos una sesión de capacitación al mes para el equipo de operaciones.');

-- 8. Entradas de Diarios (Bitácoras)
INSERT INTO dbo.diario_entries (id, diario_id, date, comment, evidence_url, evidence_desc) VALUES
('entry-seed-1', @diario_pedidos_id, '2026-07-01', N'Se revisaron todos los pedidos del día, sin pendientes.', '', '');
GO
