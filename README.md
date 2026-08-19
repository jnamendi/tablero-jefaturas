# Tablero de Control — Indicadores por Jefatura

Plataforma monorepo modular e interactiva de indicadores, metas, actividades y diarios a bordo por jefatura. Diseñada bajo un estilo visual de papel de plano técnico (blueprint aesthetic) con paleta de colores cobres, verdes, ámbar y grises azulados.

Esta aplicación ha sido unificada y migrada a una arquitectura **Full-Stack monorepo utilizando Next.js 14+ (App Router) y Prisma ORM con MySQL**, eliminando la necesidad de procesos y servidores backend independientes.

---

## 🛠️ Tecnologías del Monorepo

- **Frontend & Routing**: Next.js 14+ (App Router, Server Components y Client Components)
- **Base de Datos**: MySQL 8.x / 5.7 (o compatible)
- **ORM & Migraciones**: Prisma ORM (Prisma Client + Prisma Engine)
- **Librería de Gráficos**: Recharts
- **Iconografía**: Lucide React
- **Estilos**: Vanilla CSS con variables de diseño blueprint técnico

---

## 📂 Estructura del Proyecto

El monorepo organiza las vistas del cliente y las API route handlers del lado del servidor dentro de un único directorio `src/app`:

```text
tablero-jefaturas/
├── package.json                   # Dependencias unificadas de Next.js y scripts del monorepo
├── tsconfig.json                  # Reglas estrictas de TypeScript adaptadas para Next.js
├── next.config.mjs                # Configuración de compilación de Next.js
├── .env.example                   # Plantilla segura de variables de entorno para MySQL
├── prisma/
│   └── schema.prisma              # Modelos de datos de la base de datos relacional para Prisma
├── src/
│   ├── app/                       # Directorio raíz de rutas de Next.js (App Router)
│   │   ├── layout.tsx             # Diseño estructural HTML global (fuentes Roboto y Plex)
│   │   ├── globals.css            # Hoja de estilos de plano técnico
│   │   ├── page.tsx               # Página de inicio (renderiza el dashboard raíz)
│   │   └── api/
│   │       └── data/
│   │           └── route.ts       # APIs Server-Side (GET y POST) conectadas a MySQL
│   ├── App.tsx                    # Orquestador del Dashboard del cliente con peticiones relativas
│   ├── types/
│   │   └── index.ts               # Tipos estrictos compartidos para todo el monorepo
│   ├── utils/
│   │   ├── constants.ts           # Paletas de colores hex, ADMIN_CODE, y logos en base64
│   │   ├── helpers.ts             # Funciones de lógica matemática de score y días hábiles
│   │   └── db.ts                  # Instancia del cliente de base de datos Prisma (Singleton)
│   ├── data/
│   │   └── seed.ts                # Semilla de datos por defecto (seedData)
│   └── components/                # Componentes React modulares
│       ├── shared/                # Cabeceras técnicas comunes
│       ├── ui/                    # Componentes base (Dials, Botones, Tablas genéricas)
│       ├── modals/                # Modales interactivos (formularios, proyectos, alertas)
│       ├── auth/                  # Pantallas de Login y fondos SVG interactivos
│       ├── jefatura/              # Dashboards, cards y hojas de bitácoras de jefaturas
│       └── admin/                 # Admin console, visores de bitácoras y leaderboard de puntos
```

---

## ⚙️ APIs de Persistencia Server-Side (`/api/data`)

Next.js expone dos Route Handlers de lado del servidor para interactuar transaccionalmente con tu base de datos MySQL:

- **`GET /api/data`**:
  - Consulta de forma relacional todas las tablas (`areas`, `activities`, `indicators`, `projects` y `diarios` con bitácoras y evaluaciones).
  - Normaliza y mapea la estructura relacional a las colecciones de tipo Map estructuradas por el frontend.
- **`POST /api/data`**:
  - Recibe el estado completo de la organización.
  - Ejecuta una sincronización transaccional completa dentro de `prisma.$transaction`. Esto permite actualizar, crear o limpiar registros en cascada manteniendo 100% de la integridad relacional de la base de datos.

---

## 🚀 Guía de Instalación y Puesta en Marcha

Sigue estos simples pasos para iniciar el proyecto full-stack de forma local:

### 1. Clonar e Instalar dependencias
Instala todas las herramientas de desarrollo y librerías del monorepo:
```bash
npm install
```

### 2. Configurar las Variables de Entorno
Crea una copia de la plantilla `.env.example` bajo el nombre de `.env`:
```bash
cp .env.example .env
```
Abre el archivo `.env` en tu editor de código y configura la URL de conexión a tu servidor MySQL local. Por ejemplo:
```env
DATABASE_URL="mysql://root:admin@localhost:3306/tablero_jefaturas"
```

### 3. Sincronizar el Esquema con MySQL
Utiliza Prisma para crear de forma automática las tablas y relaciones normalizadas en tu base de datos:
```bash
npx prisma db push
```
*(Alternativamente, puedes inicializar tu base de datos ejecutando manualmente el archivo `schema.sql` provisto en la raíz del proyecto).*

### 4. Ejecutar el Monorepo en Desarrollo
Inicia el servidor unificado de Next.js:
```bash
npm run dev
```
Abre **`http://localhost:3000`** en tu navegador para interactuar con la plataforma.

---

## 🌱 Inicialización Automática de Datos (Auto-Seeding)

La plataforma cuenta con un sistema de inicialización automática inteligente. Si la base de datos MySQL se encuentra completamente vacía en el primer arranque:
1. El cliente detectará que no existen Jefaturas creadas.
2. Automáticamente cargará el archivo semilla `src/data/seed.ts`.
3. Enviará una petición `POST` al servidor Next.js para persistir el conjunto de datos de prueba (Jefatura de Operaciones con código de acceso `1234` y Jefatura de Finanzas con código `5678`).

Esto significa que la aplicación está **lista para usarse y probarse inmediatamente** en tu navegador.

---

## 📦 Compilación para Producción

Para validar tipos de TypeScript, generar el cliente de Prisma de producción y compilar páginas web optimizadas:

```bash
# Compilar todo el monorepo
npm run build

# Arrancar el servidor optimizado de producción en el puerto 3000
npm run start
```

---

## 🖥️ Despliegue en Servidores Windows

Para una guía exhaustiva paso a paso sobre cómo desplegar esta aplicación en **Windows Server 2022 Standard Edition** con **Microsoft SQL Server**, **IIS como Reverse Proxy (Puertos 80/443)** y **Servicio de Windows (NSSM)**, consulta el documento:
- 📖 [DEPLOYMENT_WINDOWS_SERVER_2022.md](./DEPLOYMENT_WINDOWS_SERVER_2022.md)

