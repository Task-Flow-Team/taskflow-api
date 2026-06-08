# TaskFlow — Roadmap

> Objetivo: reemplazar Monday.com para un equipo de 2 desarrolladores.
> Stack: NestJS + Prisma + PostgreSQL + Redis (API) | Angular 18 + Tailwind (Web)
> Última actualización: 2026-06-08

---

## Fases

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
Bugs      Schema    Features  Analytics  Frontend  Deploy
críticos  y base    core      y reportes  completo  y CI/CD
```

---

## Phase 0 — Bugfixes Críticos

> ✅ COMPLETED — 2026-06-08 | 18 bugs fixed, 42/42 verification criteria passed

> Sin esto no se avanza. Son bugs que generan pérdida de datos o vulnerabilidades de seguridad.

### Backend

- [x] **[BUG]** Agregar `await` faltante en `deleteUser` — `prismaUser.repository.adapter.ts`
- [x] **[BUG]** Agregar `await` faltante en `updateTask` — `Task.controller.ts`
- [x] **[SECURITY]** Corregir IDOR en endpoints de tareas — agregar autorización por recurso en `Task.controller.ts`
- [x] **[SECURITY]** Cambiar `GET /auth/logout` a `POST /auth/logout`
- [x] **[SECURITY]** Verificar conflicto entre `@Public()` y `@UseGuards(JwtAuthGuard)` en `Auth.controller.ts`
- [x] **[BUG]** Reemplazar `throw new Error(...)` por `UnauthorizedException` en logout
- [x] **[SCHEMA]** Agregar `@id` a `Task` en `schema.prisma`
- [x] **[SCHEMA]** Agregar FK real para `assignedTo` en modelo `Task`
- [x] **[DEPS]** Alinear versiones de NestJS a v11 en `package.json`
- [x] **[REFACTOR]** Renombrar `workspsace.entity.ts` → `workspace.entity.ts`
- [x] **[REFACTOR]** Renombrar `workspsace.repository.port.ts` → `workspace.repository.port.ts`
- [x] **[REFACTOR]** Unificar idioma de respuestas del API a inglés
- [x] **[PERF]** Reemplazar doble `findUnique` en `createNewUser` por `try/catch` con código Prisma `P2002`

### Frontend

- [ ] **[GIT]** Eliminar `src/node_modules` del repositorio y actualizar `.gitignore`
- [ ] **[BUG]** Reemplazar email hardcodeado `admin@admin.com` en `dashboard.component.ts`

---

## Phase 1 — Estabilización del Schema y la Base

> ✅ COMPLETED — 2026-06-08 | Backend: 16 tasks, 4 blocks, 16/16 PASS | Frontend: 6/6 tasks complete

> Dejar la API en un estado limpio y predecible antes de agregar features.

### Backend

- [x] Corregir `WorkspaceCollaborator.role` de `String` a `enum WorkspaceRole`
- [x] Agregar enum `Priority` (LOW / MEDIUM / HIGH / URGENT) para reemplazar `Int` en `Task` y `Subtasks`
- [x] Agregar modelo `Comment` con relación a `Task` y `User`
- [x] Agregar relación `Task.assignedToUser` con FK correcta a `User`
- [x] Migrar `Settings` de key-value genérico a campos tipados
- [x] Completar documentación Swagger en todos los controllers existentes
- [x] Agregar `ValidationPipe` global en `main.ts`
- [x] Configurar `class-transformer` con `excludeExtraneousValues` globalmente
- [x] Agregar rate limiting en endpoints de auth (`/login`, `/register`, `/reset-password`)

### Frontend

- [x] Refactorizar `app.component.html` (20KB) en componentes hijos
- [x] Implementar modelos de dominio: `Task`, `Workspace`, `User`, `Comment`
- [x] Implementar servicios HTTP para los endpoints existentes de la API
- [x] Implementar interceptor de auth (adjuntar JWT a requests)
- [x] Implementar guard de rutas para `/dashboard`
- [x] Conectar login/register del frontend con la API real

---

## Phase 2 — Features Core para Migración

> ✅ COMPLETED — 2026-06-08 | Backend: 18/18 tasks, 78/78 tests passing | Frontend: F0-F4 all complete (Kanban, Task Detail, Notifications, Activity Feed)

> Las features sin las cuales no se puede migrar de Monday.com.

### Backend

- [x] **Comentarios en tareas**
  - [x] Use case: `CreateCommentUseCase`
  - [x] Use case: `GetCommentsByTaskUseCase`
  - [x] Use case: `DeleteCommentUseCase`
  - [x] Port: `CommentRepository`
  - [x] Adapter: `PrismaCommentRepository`
  - [x] Controller: `Comment.controller.ts` (`POST /v1/tasks/:id/comments`, `GET /v1/tasks/:id/comments`, `DELETE /v1/comments/:id`)

- [x] **Feed de actividad funcional**
  - [x] Trigger de `ActivityLog` en create/update/delete de Task
  - [x] Trigger de `ActivityLog` en create/update/delete de Subtask
  - [x] Use case: `GetActivityByWorkspaceUseCase`
  - [x] Endpoint: `GET /v1/workspaces/:id/activity`

- [x] **Notificaciones funcionales**
  - [x] Trigger: notificación in-app al asignar una tarea
  - [x] Trigger: notificación in-app al comentar en una tarea asignada al usuario
  - [x] Trigger: email al asignar tarea (usando infraestructura de mailer existente)
  - [x] Use case: `GetUserNotificationsUseCase`
  - [x] Use case: `MarkNotificationAsReadUseCase`
  - [x] Endpoint: `GET /v1/users/me/notifications`
  - [x] Endpoint: `PATCH /v1/notifications/:id/read`

- [x] **Asignación correcta de tareas**
  - [x] Endpoint: `PATCH /v1/tasks/:id/assign` con validación de membership en workspace

### Frontend

- [x] Vista Kanban (por workspace)
  - [x] Columnas por estado: OPEN / IN_PROGRESS / COMPLETED
  - [x] Drag & drop entre columnas (Angular CDK DragDrop)
  - [x] Card de tarea con título, prioridad, asignado, fecha
- [x] Panel de detalle de tarea (sidebar deslizable)
  - [x] Ver/agregar comentarios
  - [x] Cambiar estado, prioridad, fecha, asignado
- [x] Sidebar de notificaciones
- [x] Feed de actividad por workspace

---

## Phase 3 — Analytics y Reporting

> Las features de reportes que completan la paridad con Monday.com para este equipo.

### Backend

- [ ] **Dashboard — endpoints de widgets**
  - [ ] `GET /v1/workspaces/:id/stats/summary`
    - Total tasks, completadas, en progreso, abiertas
    - % de completitud general
  - [ ] `GET /v1/workspaces/:id/stats/by-status`
    - Desglose de tareas por estado (para gráfico de dona/barras)
  - [ ] `GET /v1/workspaces/:id/stats/by-priority`
    - Desglose de tareas por prioridad
  - [ ] `GET /v1/workspaces/:id/stats/timeline`
    - Tareas creadas vs completadas por semana (últimas 8 semanas)

- [ ] **Carga de trabajo por persona**
  - [ ] `GET /v1/workspaces/:id/stats/workload`
    - Por cada miembro: tareas asignadas, completadas, en progreso, vencidas
  - [ ] `GET /v1/users/:id/stats/workload`
    - Misma info pero para un usuario específico en todos sus workspaces

- [ ] **Reportes de progreso**
  - [ ] `GET /v1/workspaces/:id/reports/progress`
    - Params: `from`, `to` (date range)
    - Devuelve: tareas completadas en el período, tiempo promedio de completitud, por usuario
  - [ ] `GET /v1/workspaces/:id/reports/overdue`
    - Tareas vencidas con días de retraso y asignado

- [ ] **Export**
  - [ ] `GET /v1/workspaces/:id/export/csv` — todas las tareas en CSV

### Frontend

- [ ] Dashboard principal con widgets
  - [ ] Widget: resumen de tareas (total, completadas, en progreso, vencidas)
  - [ ] Widget: gráfico de progreso (dona por estado)
  - [ ] Widget: tareas con due date próximo (próximos 7 días)
  - [ ] Widget: actividad reciente del workspace
- [ ] Vista de carga de trabajo por persona
  - [ ] Tabla: miembro / tareas asignadas / completadas / en progreso / vencidas
  - [ ] Barra de carga visual por persona
- [ ] Vista de reportes de progreso
  - [ ] Selector de rango de fechas
  - [ ] Gráfico de tareas completadas por semana
  - [ ] Tabla de performance por usuario

---

## Phase 4 — Features Complementarias

> Mejoran la experiencia pero no bloquean la migración.

### Backend

- [ ] Vista lista de tareas con filtros (`status`, `priority`, `assignedTo`, `dueDate`)
- [ ] Búsqueda full-text en tareas (`GET /v1/workspaces/:id/tasks/search?q=`)
- [ ] Menciones `@usuario` en comentarios (parseo + notificación)
- [ ] Reminders funcionales (job scheduler con `@nestjs/schedule`)
- [ ] `PATCH` en lugar de `PUT` para updates parciales
- [ ] Paginación en todos los endpoints de listado

### Frontend

- [ ] Vista lista de tareas con filtros y ordenamiento
- [ ] Vista calendario (tareas por fecha de vencimiento)
- [ ] Buscador global
- [ ] Perfil de usuario editable
- [ ] Settings de workspace

---

## Phase 5 — Estabilización y Deploy

### Backend

- [ ] Tests unitarios de use cases críticos (auth, tasks, comments)
- [ ] Tests de integración de los adapters Prisma
- [ ] Tests E2E de los endpoints principales
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Dockerfile y docker-compose para desarrollo local
- [ ] Pipeline CI en GitHub Actions (lint + test)
- [ ] Documentación Swagger completa y publicada

### Frontend

- [ ] Tests unitarios de servicios y componentes críticos
- [ ] Optimización de bundle (lazy loading revisado)
- [ ] Variables de entorno con `environment.ts` y `environment.prod.ts`
- [ ] Dockerfile para frontend
- [ ] Pipeline CI en GitHub Actions

---

## Milestones

| Milestone | Phases | Criterio de éxito |
|---|---|---|
| **v0.1 — Estable** | 0 + 1 | Sin bugs críticos, schema correcto, auth conectada al frontend |
| **v0.2 — MVP Migración** | 2 | Kanban funcional, comentarios, notificaciones, actividad |
| **v0.3 — Analytics** | 3 | Dashboard con widgets, reportes, carga de trabajo |
| **v0.4 — Completo** | 4 | Búsqueda, filtros, calendario, menciones |
| **v1.0 — Producción** | 5 | Tests, CI/CD, deploy |

---

## Progreso actual

```
Phase 0 — Bugs críticos:        13 / 13  ██████████  100% ✅
Phase 1 — Estabilización:       15 / 15  ██████████  100% ✅ (Backend 9/9 | Frontend 6/6)
Phase 2 — Features core:        26 / 26  ██████████  100% ✅ (Backend 18/18 | Frontend 8/8)
Phase 3 — Analytics:             0 / 18  ░░░░░░░░░░  0%
Phase 4 — Complementarias:       0 / 12  ░░░░░░░░░░  0%
Phase 5 — Deploy:                0 / 12  ░░░░░░░░░░  0%
```

---

*Ver también: [monday-vs-taskflow.md](./monday-vs-taskflow.md) | [CHANGELOG.md](./CHANGELOG.md)*
