# Guía de Despliegue en Producción — Windows Server 2022 Standard Edition
## Tablero de Control — Indicadores por Jefatura (Next.js 14 + Prisma + MS SQL Server / MySQL + IIS)

Este documento detalla el procedimiento paso a paso para desplegar y configurar la plataforma en **Windows Server 2022 Standard Edition**, utilizando **Microsoft SQL Server** (o MySQL), **Node.js LTS**, el gestor de servicios de Windows (**NSSM**) y **Internet Information Services (IIS)** con proxy inverso (ARR + URL Rewrite) con soporte HTTPS/SSL.

---

## 🏗️ Arquitectura de la Solución en Windows Server

```
                          [ Cliente Web / Intranet ]
                                     │
                             (Puertos 80 / 443)
                                     ▼
                  [ Internet Information Services (IIS) ]
                     ├── Módulo URL Rewrite 2.1
                     └── Application Request Routing (ARR 3.0)
                                     │
                             (http://127.0.0.1:3000)
                                     ▼
                    [ Servicio de Windows (NSSM) ]
                    └── Node.js 20 LTS (Next.js Production Server)
                                     │
                                     ▼
                  [ Microsoft SQL Server 2019 / 2022 ]
                     ├── Base de Datos: tablero_jefaturas
                     └── Puerto TCP: 1433
```

---

## 📋 Requisitos Previos del Servidor

- **Sistema Operativo**: Windows Server 2022 Standard Edition (x64)
- **Permisos**: Cuenta con privilegios de Administrador local.
- **Acceso a Internet** (o paquetes de instalación precargados para entornos offline).
- **IP estática** y nombre de host/DNS configurado en la red corporativa.

---

## Paso 1: Instalación de Herramientas y Runtimes Base

Abra **PowerShell como Administrador** (`Clic derecho en el botón Inicio` → *Windows PowerShell (Administrador)*).

### 1.1 Instalar Gestor de Paquetes Chocolatey (Opcional pero recomendado)
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 1.2 Instalar Node.js 20 LTS, Git, NSSM y Visual C++ Redistributable
```powershell
# Instalar Node.js LTS (v20), Git para Windows, NSSM y librerías C++ requeridas por Prisma
choco install -y nodejs-lts git nssm vcredist140
```

> **Nota:** Cierre y vuelva a abrir la consola de PowerShell para refrescar las variables de entorno (`PATH`).

Verifique que las herramientas respondan correctamente:
```powershell
node -v      # Debe retornar v20.x.x
npm -v       # Debe retornar 10.x.x
git --version
nssm version
```

---

## Paso 2: Instalación y Configuración de Microsoft SQL Server

Si ya dispone de una instancia de MS SQL Server en su red o en el mismo servidor, salte al **Paso 2.2**.

### 2.1 Instalar SQL Server 2022 y SSMS (Si es local)
```powershell
# Instalar SQL Server 2022 Express / Developer y Management Studio
choco install -y sql-server-2022 sql-server-management-studio
```

---

### 2.2 Habilitar Autenticación Mixta y Protocolo TCP/IP

1. **Habilitar Autenticación Mixta (SQL Server and Windows Authentication mode)**:
   - Abra **SQL Server Management Studio (SSMS)** y conéctese con Autenticación de Windows.
   - Clic derecho en el Servidor (raíz) → **Properties** → pestaña **Security**.
   - Seleccione **SQL Server and Windows Authentication mode**.
   - Clic en **OK**.

2. **Habilitar Protocolo TCP/IP**:
   - Abra **SQL Server Configuration Manager**.
   - Despliegue **SQL Server Network Configuration** → **Protocols for MSSQLSERVER** (o `Protocols for SQLEXPRESS`).
   - Clic derecho en **TCP/IP** → **Enable**.
   - Doble clic en **TCP/IP** → pestaña **IP Addresses**:
     - Vaya al final a la sección **IPAll**.
     - Borre cualquier valor en `TCP Dynamic Ports`.
     - Establezca `TCP Port` en `1433`.
   - Clic en **Apply** y **OK**.

3. **Reiniciar el Servicio SQL Server**:
   - En **SQL Server Services**, clic derecho en **SQL Server (MSSQLSERVER)** → **Restart**.

---

### 2.3 Crear Base de Datos, Usuario y Cargar Esquema Transact-SQL

Abra **SSMS** o ejecute desde PowerShell con `sqlcmd`:

```sql
-- 1. Crear base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'tablero_jefaturas')
BEGIN
    CREATE DATABASE tablero_jefaturas;
END
GO

USE tablero_jefaturas;
GO

-- 2. Crear Login de SQL Server y Usuario
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'tablero_user')
BEGIN
    CREATE LOGIN tablero_user WITH PASSWORD = 'StrongPassword!2026', CHECK_POLICY = ON;
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'tablero_user')
BEGIN
    CREATE USER tablero_user FOR LOGIN tablero_user;
    ALTER ROLE db_owner ADD MEMBER tablero_user;
END
GO
```

4. **Ejecutar el Script `schema_mssql.sql`**:
   - Abra el archivo `schema_mssql.sql` provisto en la raíz del proyecto dentro de SSMS.
   - Ejecute el script (`F5`) sobre la base de datos `tablero_jefaturas`.
   - Este script crea automáticamente las tablas normalizadas (`areas`, `activities`, `indicators`, `indicator_period_values`, `projects`, `project_areas`, `diarios`, `diario_entries`, `diario_evaluations`), los disparadores `AFTER UPDATE` para auditoría y los datos iniciales de prueba.

---

## Paso 3: Despliegue del Código Fuente y Configuración

### 3.1 Ubicar el Proyecto en el Servidor
Cree un directorio de aplicación estructurado, por ejemplo en `C:\apps\tablero-jefaturas`:

```powershell
New-Item -ItemType Directory -Path "C:\apps\tablero-jefaturas" -Force
cd "C:\apps\tablero-jefaturas"
```

Clone el repositorio o copie los archivos del proyecto a esta carpeta:
```powershell
git clone <URL_DEL_REPOSITORIO_GIT> C:\apps\tablero-jefaturas
cd C:\apps\tablero-jefaturas
```

---

### 3.2 Configurar el Archivo `.env` para MS SQL Server

Cree o modifique el archivo `C:\apps\tablero-jefaturas\.env` con los parámetros de conexión de SQL Server:

```env
NODE_ENV="production"
PORT=3000
HOSTNAME="0.0.0.0"

# Formato de conexión para Microsoft SQL Server:
DATABASE_URL="sqlserver://localhost:1433;database=tablero_jefaturas;user=tablero_user;password=StrongPassword!2026;encrypt=true;trustServerCertificate=true"
```

*(Si utiliza una instancia nombrada de SQL Server como SQLEXPRESS, use: `sqlserver://localhost;instanceName=SQLEXPRESS;database=tablero_jefaturas;user=tablero_user;password=StrongPassword!2026;encrypt=true;trustServerCertificate=true`)*

---

### 3.3 Configurar `prisma/schema.prisma` para SQL Server

Asegúrese de que el archivo `prisma/schema.prisma` esté configurado con el proveedor `sqlserver`:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Modelos mapeados a las tablas existentes
model Area {
  id        String     @id @db.VarChar(36)
  name      String     @db.NVarChar(255)
  position  String?    @db.NVarChar(255)
  code      String     @unique @db.VarChar(50)
  
  activities Activity[]
  indicators Indicator[]
  diarios    Diario[]

  @@map("areas")
}

model Activity {
  id           String    @id @db.VarChar(36)
  areaId       String    @map("area_id") @db.VarChar(36)
  title        String    @db.NVarChar(255)
  status       String    @default("pendiente") @db.VarChar(50)
  assignedDate DateTime? @map("assigned_date")
  dueDate      DateTime? @map("due_date")
  points       Int       @default(0)
  completedAt  DateTime? @map("completed_at")
  
  area         Area      @relation(fields: [areaId], references: [id], onDelete: Cascade)

  @@map("activities")
}

model Indicator {
  id           String                 @id @db.VarChar(36)
  areaId       String                 @map("area_id") @db.VarChar(36)
  name         String                 @db.NVarChar(255)
  unit         String                 @db.NVarChar(50)
  description  String?                @db.NVarChar(Max)
  
  area         Area                   @relation(fields: [areaId], references: [id], onDelete: Cascade)
  periodValues IndicatorPeriodValue[]

  @@map("indicators")
}

model IndicatorPeriodValue {
  id          Int       @id @default(autoincrement())
  indicatorId String    @map("indicator_id") @db.VarChar(36)
  monthKey    String    @map("month_key") @db.VarChar(2)
  goal        Float?
  result      Float?
  
  indicator   Indicator @relation(fields: [indicatorId], references: [id], onDelete: Cascade)

  @@unique([indicatorId, monthKey])
  @@map("indicator_period_values")
}

model Project {
  id          String        @id @db.VarChar(36)
  name        String        @db.NVarChar(255)
  description String?       @db.NVarChar(Max)
  points      Int           @default(0)
  status      String        @default("pendiente") @db.VarChar(50)
  completedAt DateTime?     @map("completed_at")
  
  areaIds     ProjectArea[]

  @@map("projects")
}

model ProjectArea {
  projectId String  @map("project_id") @db.VarChar(36)
  areaId    String  @map("area_id") @db.VarChar(36)
  
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@id([projectId, areaId])
  @@map("project_areas")
}

model Diario {
  id          String             @id @db.VarChar(36)
  areaId      String             @map("area_id") @db.VarChar(36)
  type        String             @db.VarChar(50)
  name        String             @db.NVarChar(255)
  frequency   String             @db.NVarChar(50)
  objective   String?            @db.NVarChar(Max)
  
  area        Area               @relation(fields: [areaId], references: [id], onDelete: Cascade)
  entries     DiarioEntry[]
  evaluations DiarioEvaluation[]

  @@map("diarios")
}

model DiarioEntry {
  id           String   @id @db.VarChar(36)
  diarioId     String   @map("diario_id") @db.VarChar(36)
  date         DateTime @map("date")
  comment      String   @db.NVarChar(Max)
  evidenceUrl  String?  @map("evidence_url") @db.VarChar(1024)
  evidenceDesc String?  @map("evidence_desc") @db.NVarChar(512)
  
  diario       Diario   @relation(fields: [diarioId], references: [id], onDelete: Cascade)

  @@map("diario_entries")
}

model DiarioEvaluation {
  id       Int     @id @default(autoincrement())
  diarioId String  @map("diario_id") @db.VarChar(36)
  monthKey String  @map("month_key") @db.VarChar(7)
  status   String? @db.VarChar(50)
  note     String? @db.NVarChar(Max)
  
  diario   Diario  @relation(fields: [diarioId], references: [id], onDelete: Cascade)

  @@unique([diarioId, monthKey])
  @@map("diario_evaluations")
}
```

---

## Paso 4: Instalación de Dependencias y Compilación del Proyecto

Ejecute en PowerShell dentro de `C:\apps\tablero-jefaturas`:

```powershell
cd C:\apps\tablero-jefaturas

# 1. Instalar dependencias exactas del proyecto
npm ci

# 2. Generar el cliente de Prisma
npx prisma generate

# 3. Compilar la aplicación Next.js para producción
npm run build
```

---

## Paso 5: Registrar la Aplicación como Servicio de Windows (NSSM)

Configurar la aplicación como un Servicio de Windows garantiza:
- **Arranque automático** con el inicio del servidor sin requerir sesión iniciada.
- **Autorrecuperación** en caso de reinicio imprevisto o error.
- **Redirección de logs** a archivos físicos para auditoría.

### 5.1 Crear el Servicio con PowerShell
```powershell
$nodeExe  = (Get-Command node).Source
$appDir   = "C:\apps\tablero-jefaturas"
$nextCli  = "$appDir\node_modules\next\dist\bin\next"

# 1. Crear directorio de logs
New-Item -ItemType Directory -Path "$appDir\logs" -Force

# 2. Instalar el servicio
nssm install TableroJefaturasService $nodeExe $nextCli "start -p 3000"

# 3. Configurar directorio de trabajo y variables de entorno
nssm set TableroJefaturasService AppDirectory $appDir
nssm set TableroJefaturasService AppEnvironmentExtra NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1

# 4. Configurar logs de salida y errores
nssm set TableroJefaturasService AppStdout "$appDir\logs\service-out.log"
nssm set TableroJefaturasService AppStderr "$appDir\logs\service-err.log"

# 5. Configurar inicio automático y política de reinicio
nssm set TableroJefaturasService Start SERVICE_AUTO_START
nssm set TableroJefaturasService AppThrottle 1500
nssm set TableroJefaturasService AppRestartDelay 2000

# 6. Iniciar el servicio
nssm start TableroJefaturasService
```

### 5.2 Comprobar Estado del Servicio
```powershell
Get-Service TableroJefaturasService
# El estado debe indicar "Running"

# Probar respuesta interna local
Invoke-RestMethod -Uri "http://127.0.0.1:3000" -Method Head
```

---

## Paso 6: Configurar IIS como Reverse Proxy (Puertos 80 y 443)

### 6.1 Instalar Rol IIS y Módulos de Enrutamiento (URL Rewrite y ARR 3.0)
```powershell
# 1. Instalar el rol de servidor Web (IIS)
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# 2. Instalar módulo URL Rewrite (mediante Chocolatey)
choco install -y urlrewrite

# 3. Descargar e instalar directamente el módulo oficial Microsoft ARR 3.0 (x64)
$arrUrl = "https://go.microsoft.com/fwlink/?LinkID=615136"
$arrMsi = "$env:TEMP\requestRouter_amd64.msi"

Write-Host "Descargando Application Request Routing 3.0..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $arrUrl -OutFile $arrMsi -UseBasicParsing

Write-Host "Instalando Application Request Routing 3.0..." -ForegroundColor Cyan
Start-Process msiexec.exe -ArgumentList "/i `"$arrMsi`" /qn /norestart" -Wait

# 4. Reiniciar IIS para registrar los nuevos módulos
iisreset
```

### 6.2 Habilitar Funcionalidad de Proxy en ARR
```powershell
& "$env:SystemRoot\System32\inetsrv\appcmd.exe" set config -section:system.webServer/proxy /enabled:"True" /commit:apphost
```

### 6.3 Crear el Sitio IIS y el archivo `web.config`

1. Cree el directorio raíz para el sitio web de IIS:
   ```powershell
   New-Item -ItemType Directory -Path "C:\inetpub\tablero-web" -Force
   ```

2. Cree el archivo `C:\inetpub\tablero-web\web.config` con la regla de redirección reversa:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
       <system.webServer>
           <rewrite>
               <rules>
                   <rule name="ReverseProxyToNextJs" stopProcessing="true">
                       <match url="(.*)" />
                       <action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />
                       <serverVariables>
                           <set name="HTTP_X_FORWARDED_HOST" value="{HTTP_HOST}" />
                           <set name="HTTP_X_FORWARDED_SCHEMA" value="http" />
                           <set name="HTTP_X_FORWARDED_PROTO" value="http" />
                       </serverVariables>
                   </rule>
               </rules>
           </rewrite>
           <httpErrors errorMode="DetailedLocalOnly" />
           <security>
               <requestFiltering>
                   <requestLimits maxAllowedContentLength="52428800" /> <!-- 50 MB para evidencias -->
               </requestFiltering>
           </security>
       </system.webServer>
   </configuration>
   ```

3. Vincular el sitio en IIS:
   ```powershell
   Import-Module WebAdministration
   Set-ItemProperty "IIS:\Sites\Default Web Site" -Name physicalPath -Value "C:\inetpub\tablero-web"
   Restart-Service W3SVC
   ```

---

## Paso 7: Configuración del Firewall de Windows

Habilite los puertos de entrada HTTP (80) y HTTPS (443):

```powershell
# Permitir tráfico HTTP (80)
New-NetFirewallRule -DisplayName "Tablero HTTP (Port 80)" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Permitir tráfico HTTPS (443)
New-NetFirewallRule -DisplayName "Tablero HTTPS (Port 443)" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

---

## Paso 8: Certificados de Seguridad SSL/TLS (HTTPS)

### Opción 1: Certificado Corporativo / Active Directory
1. Abra el **Administrador de IIS** (`inetmgr`).
2. Seleccione el servidor → **Certificados de servidor** → Importe el certificado `.pfx`.
3. Seleccione **Default Web Site** → **Enlaces...** (Bindings) → **Agregar**:
   - Tipo: `https`
   - Puerto: `443`
   - Certificado SSL: Seleccione su certificado importado.

### Opción 2: Certificado Let's Encrypt (Dominio Público)
```powershell
choco install -y win-acme
wacs.exe
```
Siga las instrucciones interactivas para asociar el certificado al sitio IIS de forma automática con autorenovación.

---

## Paso 9: Script de Actualización Automática (Deploy Script)

Cree el archivo `C:\apps\tablero-jefaturas\actualizar-produccion.ps1` para despliegues posteriores de nuevas versiones:

```powershell
# ================================================================
# Script de Actualización en Producción — Tablero de Jefaturas
# ================================================================
$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Actualizando Tablero de Jefaturas..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Set-Location "C:\apps\tablero-jefaturas"

Write-Host "1. Descargando última versión de Git..." -ForegroundColor Yellow
git pull origin main

Write-Host "2. Instalando dependencias..." -ForegroundColor Yellow
npm ci

Write-Host "3. Generando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "4. Compilando aplicación Next.js..." -ForegroundColor Yellow
npm run build

Write-Host "5. Reiniciando servicio de Windows..." -ForegroundColor Yellow
nssm restart TableroJefaturasService

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Despliegue completado con éxito!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
```

---

## 🛠️ Guía de Diagnóstico y Monitoreo (Troubleshooting)

| Síntoma / Error | Causa Probable | Solución |
| :--- | :--- | :--- |
| **Error 502.3 / 502.5 en IIS** | El servicio Next.js en el puerto 3000 está detenido. | Verifique el estado con `Get-Service TableroJefaturasService`. Revise los logs en `C:\apps\tablero-jefaturas\logs\service-err.log`. |
| **Error de conexión Prisma (`P1001` / `P1003`)** | SQL Server no permite conexiones TCP/IP o las credenciales son incorrectas. | 1. Verifique en SQL Server Configuration Manager que TCP/IP esté habilitado en puerto 1433.<br>2. Verifique que el servicio `SQL Server (MSSQLSERVER)` esté en ejecución.<br>3. Compruebe la cadena `DATABASE_URL` en el archivo `.env`. |
| **Error de Certificado SSL de SQL Server (`trustServerCertificate`)** | SQL Server requiere certificado de transporte. | Asegúrese de incluir `trustServerCertificate=true;encrypt=true;` en la URL de conexión de SQL Server. |
| **Error 404 en rutas estáticas / _next** | La regla de reescritura de IIS no está pasando el subpath `{R:1}`. | Verifique que `web.config` contenga `<action type="Rewrite" url="http://127.0.0.1:3000/{R:1}" />`. |
| **Ubicación de Archivos de Logs** | - | • **Logs de la Aplicación**: `C:\apps\tablero-jefaturas\logs\`<br>• **Logs de IIS**: `C:\inetpub\logs\LogFiles\W3SVC1\` |
