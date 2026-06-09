# TaskFlow — Roadmap

> Objetivo: reemplazar Monday.com para un equipo de 2 desarrolladores.
> Stack: NestJS + Prisma + PostgreSQL + Redis (API) | Angular 18 + Tailwind (Web)
> Última actualización: 2026-06-08

---

## Fases

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4a → Phase 4b → Phase 5 → Phase 6 → Phase 7 → Phase 8
Bugs      Schema    Features  Analytics  Core        Avanzadas  Tests     Deploy    Fix        Polish
críticos  y base    core      y reportes complem.    complem.   fase-4b   & CI      desvíos    UX
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

> ✅ COMPLETED — 2026-06-08 | Backend: summary/overdue endpoints, WorkspaceSummaryDto, OverdueTaskDto, prismaAnalytics adapter | Frontend: AnalyticsPageComponent, WorkloadWidget (bar chart), ProgressChart (line chart), StatsWidget, ng2-charts integration

> Las features de reportes que completan la paridad con Monday.com para este equipo.

### Backend

- [x] **Dashboard — endpoints de widgets**
  - [x] `GET /v1/workspaces/:id/stats/summary`
    - Total tasks, completadas, en progreso, abiertas
    - % de completitud general
  - [x] `GET /v1/workspaces/:id/stats/by-status`
    - Desglose de tareas por estado (para gráfico de dona/barras)
  - [x] `GET /v1/workspaces/:id/stats/by-priority`
    - Desglose de tareas por prioridad
  - [x] `GET /v1/workspaces/:id/stats/timeline`
    - Tareas creadas vs completadas por semana (últimas 8 semanas)

- [x] **Carga de trabajo por persona**
  - [x] `GET /v1/workspaces/:id/stats/workload`
    - Por cada miembro: tareas asignadas, completadas, en progreso, vencidas
  - [x] `GET /v1/users/:id/stats/workload`
    - Misma info pero para un usuario específico en todos sus workspaces

- [x] **Reportes de progreso**
  - [x] `GET /v1/workspaces/:id/reports/progress`
    - Params: `from`, `to` (date range)
    - Devuelve: tareas completadas en el período, tiempo promedio de completitud, por usuario
  - [x] `GET /v1/workspaces/:id/reports/overdue`
    - Tareas vencidas con días de retraso y asignado

- [x] **Export**
  - [x] `GET /v1/workspaces/:id/export/csv` — todas las tareas en CSV

### Frontend

- [x] Dashboard principal con widgets
  - [x] Widget: resumen de tareas (total, completadas, en progreso, vencidas) — `StatsWidget`
  - [x] Widget: gráfico de progreso (dona por estado) — `ProgressChart` (line chart, ng2-charts)
  - [x] Widget: tareas con due date próximo (próximos 7 días)
  - [x] Widget: actividad reciente del workspace
- [x] Vista de carga de trabajo por persona — `WorkloadWidget` (bar chart, ng2-charts)
  - [x] Tabla: miembro / tareas asignadas / completadas / en progreso / vencidas
  - [x] Barra de carga visual por persona
- [x] Vista de reportes de progreso
  - [x] Selector de rango de fechas
  - [x] Gráfico de tareas completadas por semana
  - [x] Tabla de performance por usuario

---

## Phase 4a — Features Complementarias (Core)

> ✅ COMPLETED — 2026-06-08 | PATCH verb fix, task filtering, cursor pagination, full-text search, user profile, workspace settings

> Mejoran la experiencia básica de uso.

### Backend

- [x] `PATCH` en lugar de `PUT` para updates parciales en tareas
- [x] Vista lista de tareas con filtros (`status`, `priority`, `assignedTo`, `dueDate`)
- [x] Paginación cursor-based en todos los endpoints de listado
- [x] Búsqueda full-text en tareas (`GET /v1/workspaces/:id/tasks/search?q=`)
- [x] Perfil de usuario — `GET /PATCH /v1/users/me`
- [x] Settings de workspace — `GET /PATCH /v1/workspaces/:id/settings`

---

## Phase 4b — Features Complementarias (Avanzadas)

> ✅ COMPLETED — 2026-06-08 | CSV export, @mentions (MentionAutocompleteDirective + MentionHighlightPipe + backend), Calendar View (MatCalendar + dateClass), Reminders (schema migration, hexagonal context, cron job)

> Features avanzadas que completan la paridad con Monday.com.

### Backend

- [x] Export CSV (`GET /v1/workspaces/:id/export/csv`) — `ExportTasksCsvUseCase`
- [x] Menciones `@usuario` en comentarios — parseo + notificación al mencionado
- [x] Reminders funcionales
  - [x] Schema migration — modelo `Reminder` en Prisma
  - [x] Hexagonal context — `CreateReminderUseCase`, `DeleteReminderUseCase`, port + adapter
  - [x] Cron job con `@nestjs/schedule` — envío de notificaciones al vencer

### Frontend

- [x] `MentionAutocompleteDirective` — autocomplete de `@usuario` en comentarios
- [x] `MentionHighlightPipe` — resaltado visual de menciones en texto renderizado
- [x] Vista calendario — `MatCalendar` + `dateClass` para marcar fechas con tareas
- [x] Formulario de reminder en `TaskDetailPanel`

---

## Phase 5 — Tests (fase-4b)

> ✅ 100% DONE — 2026-06-08

- [x] `ExportTasksCsvUseCase` unit test
  - [x] Campos nulos se renderizan como string vacío
  - [x] Valores con comas se envuelven en comillas (comma escaping)
- [x] `CreateCommentUseCase` tests actualizados
  - [x] `@mention` resuelto correctamente
  - [x] Auto-mención (self-mention) se omite sin error
  - [x] Username inexistente (ghost) no rompe el flujo
- [x] `CreateReminderUseCase` unit test
- [x] `DeleteReminderUseCase` unit test
- [x] `CalendarViewComponent` unit test
  - [x] `dateClass` retorna `'has-tasks'` para fechas con tareas asignadas

---

## Phase 6 — Deploy & CI

> ✅ 100% DONE — 2026-06-08

### Backend

- [x] Dockerfile para `taskflow-api` (Node 20, multi-stage build)
- [x] `prisma migrate deploy` integrado en el pipeline CI/CD
- [x] Health check endpoint (`GET /health`)
- [x] Variables de entorno documentadas en `.env.example`

### Frontend

- [x] Dockerfile para `taskflow-web` (build + nginx serve)

### Infra

- [x] `docker-compose.yml` — api + web + postgres
- [x] GitHub Actions workflow: lint + test on PR
- [x] GitHub Actions workflow: build + push Docker images on merge to main

---

## Phase 7 — Fix Desvíos Verify

> ✅ 100% DONE — 2026-06-08

- [x] **I-3 (MEDIUM)** `CalendarViewComponent` — consumir el signal compartido de tareas del workspace en lugar de hacer su propio HTTP call
- [x] **I-5 (LOW)** `DELETE /v1/reminders/:id` — cambiar respuesta de HTTP 200 a 204 No Content
- [x] **I-1 (LOW)** Alineación de URL del CSV export (opcional — breaking change, evaluar si conviene)
- [x] **I-4 (LOW)** `reminder_id` UUID vs Int (cosmético, schema-breaking — evaluar si conviene)

---

## Phase 8 — Polish UX

> ✅ 100% DONE — 2026-06-08

- [x] Loading skeletons en Kanban, Analytics y Calendar mientras cargan los datos
- [x] Empty states con mensajes útiles (sin tareas, sin workspace seleccionado, etc.)
- [x] Error states — toast notifications para API calls fallidas
- [x] Layout responsive para mobile — sidebar colapsable, scroll horizontal en Kanban
- [x] Keyboard shortcuts — nueva tarea (`N`), búsqueda (`/`), cerrar panel (`Esc`)
- [x] Optimistic updates para cambios de estado en drag & drop del Kanban

---

## Milestones

| Milestone | Phases | Criterio de éxito |
|---|---|---|
| **v0.1 — Estable** | 0 + 1 | Sin bugs críticos, schema correcto, auth conectada al frontend |
| **v0.2 — MVP Migración** | 2 | Kanban funcional, comentarios, notificaciones, actividad |
| **v0.3 — Analytics** | 3 | Dashboard con widgets, reportes, carga de trabajo |
| **v0.4 — Completo** | 4a + 4b | Búsqueda, filtros, calendario, menciones, reminders, export CSV |
| **v1.0 — Producción** | 5 + 6 + 7 + 8 | Tests, CI/CD, deploy, desvíos cerrados, polish UX |

---

## Progreso actual

```
Phase 0  — Bugs críticos:        13 / 13  ██████████  100% ✅
Phase 1  — Estabilización:       15 / 15  ██████████  100% ✅ (Backend 9/9 | Frontend 6/6)
Phase 2  — Features core:        26 / 26  ██████████  100% ✅ (Backend 18/18 | Frontend 8/8)
Phase 3  — Analytics:            18 / 18  ██████████  100% ✅ (Backend + Frontend)
Phase 4a — Complementarias core:  6 /  6  ██████████  100% ✅
Phase 4b — Complementarias avz.:  7 /  7  ██████████  100% ✅
Phase 5  — Tests fase-4b:         9 /  9  ██████████  100% ✅
Phase 6  — Deploy & CI:           8 /  8  ██████████  100% ✅
Phase 7  — Fix desvíos verify:    4 /  4  ██████████  100% ✅
Phase 8  — Polish UX:             6 /  6  ██████████  100% ✅
```

---

*Ver también: [monday-vs-taskflow.md](./monday-vs-taskflow.md) | [CHANGELOG.md](./CHANGELOG.md)*
