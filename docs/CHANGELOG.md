# Changelog

Todos los cambios notables del proyecto son documentados acá.
Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Backend
- Pendiente: Phase 0 — Bugfixes críticos (ver ROADMAP.md)

### Frontend
- Pendiente: eliminar `src/node_modules` del repositorio

---

## [0.0.1] — 2026-06-07

### Added — Backend
- Arquitectura hexagonal con capas `domain`, `application`, `infrastructure`
- Patrón Port/Adapter implementado para todos los repositorios
- Auth completa: registro, login, logout con blacklist Redis, verificación de email, reset de password
- JWT con `@nestjs/jwt` y blacklist de tokens via Redis
- CRUD de tareas con use cases por operación
- CRUD de subtareas
- CRUD de tags
- CRUD de workspaces con soporte de colaboradores
- Schema Prisma: User, Workspace, Task, Subtasks, Tags, TaskTags, Reminders, Notifications, ActivityLogs, Settings, Session, Account, VerificationToken
- Swagger integrado en `/api/docs`
- Redis como microservicio de transporte
- Infraestructura de email (nodemailer + mailjet)
- Versionado de API bajo prefijo `/v1`

### Added — Frontend
- Setup Angular 18 con Tailwind CSS
- Arquitectura en capas: `core/domain`, `data/repositories`, `presentation/pages`
- Routing con lazy loading para `auth` y `dashboard`
- Sistema de alertas (`AlertService`)
- Componente modal configurable
- Páginas: Landing, Dashboard (esqueleto), Auth, Not Found
- Múltiples librerías de iconos: ng-icons, heroicons, material icons, bootstrap icons

### Known Issues — Backend
- `await` faltante en `deleteUser` → usuario no se elimina de la DB
- `await` faltante en `updateTask` → responde con Promise en lugar de la tarea
- IDOR en endpoints de tareas → cualquier usuario puede ver tareas de otro
- `GET /auth/logout` debería ser `POST`
- `@Public()` + `@UseGuards(JwtAuthGuard)` en conflicto en `Auth.controller.ts`
- `Task` sin `@id` en Prisma schema
- `assignedTo` en `Task` sin FK real
- Versiones NestJS mixtas (v10/v11)
- Typo: `workspsace` en nombres de archivos
- Respuestas del API en inglés y español mezclados

### Known Issues — Frontend
- `src/node_modules` commiteado en el repositorio
- Email hardcodeado `admin@admin.com` en `dashboard.component.ts`
- `app.component.html` de ~20KB sin descomponer en componentes

---

*Ver también: [ROADMAP.md](./ROADMAP.md) | [monday-vs-taskflow.md](./monday-vs-taskflow.md)*
