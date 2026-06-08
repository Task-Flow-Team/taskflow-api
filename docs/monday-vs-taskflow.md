# Monday.com vs TaskFlow — Comparación Real

> Contexto: equipo de 2 desarrolladores. Objetivo: reemplazar Monday.com con TaskFlow.
> Última actualización: 2026-06-07

---

## Gestión de tareas core

| Feature | Monday.com | TaskFlow (actual) | Prioridad |
|---|---|---|---|
| Crear/editar/eliminar tareas | ✅ | ✅ | — |
| Subtareas | ✅ | ✅ | — |
| Estado (open/in progress/done) | ✅ Customizable | ✅ Fijo (3 estados) | 🟡 Medio |
| Prioridad | ✅ Labels custom | ⚠️ Entero sin semántica | 🟡 Medio |
| Fecha de vencimiento | ✅ | ✅ | — |
| Asignación de responsable | ✅ | ⚠️ Campo sin FK real en DB | 🔴 Crítico |
| Comentarios en tareas | ✅ | ❌ No existe | 🔴 Crítico |
| Adjuntar archivos | ✅ | ❌ No existe | 🟡 Medio |
| Campos custom por proyecto | ✅ | ❌ No existe | 🟢 Bajo |
| Dependencias entre tareas | ✅ | ❌ No existe | 🟢 Bajo |
| Tareas recurrentes | ✅ | ❌ No existe | 🟢 Bajo |

---

## Vistas

| Feature | Monday.com | TaskFlow (actual) | Prioridad |
|---|---|---|---|
| Vista tablero (Kanban) | ✅ | ❌ | 🔴 Crítico |
| Vista lista | ✅ | ❌ | 🟠 Alto |
| Vista Gantt / Timeline | ✅ | ❌ | 🟢 Bajo |
| Vista calendario | ✅ | ❌ | 🟡 Medio |
| Vista formulario (intake) | ✅ | ❌ | 🟢 Bajo |

---

## Colaboración

| Feature | Monday.com | TaskFlow (actual) | Prioridad |
|---|---|---|---|
| Workspaces | ✅ | ✅ | — |
| Invitar colaboradores | ✅ | ✅ Modelo existe | 🟠 Alto |
| Roles por workspace | ✅ Custom | ⚠️ Solo String sin enum | 🟡 Medio |
| Menciones `@usuario` | ✅ | ❌ | 🟡 Medio |
| Updates / feed de actividad | ✅ | ⚠️ Modelo existe, sin UI | 🟡 Medio |
| Tiempo real (WebSockets) | ✅ | ❌ | 🟢 Bajo (equipo de 2) |
| Guest access (externos) | ✅ | ❌ | 🟢 Bajo |

---

## Notificaciones y automatización

| Feature | Monday.com | TaskFlow (actual) | Prioridad |
|---|---|---|---|
| Notificaciones in-app | ✅ | ⚠️ Modelo existe, sin lógica | 🟠 Alto |
| Notificaciones por email | ✅ | ⚠️ Infraestructura existe, sin triggers | 🟠 Alto |
| Reminders | ✅ | ⚠️ Modelo en DB, sin lógica | 🟡 Medio |
| Automations (if X then Y) | ✅ Motor completo | ❌ | 🟢 Bajo |
| Integraciones (Slack, GitHub…) | ✅ 200+ | ❌ | 🟢 Bajo |

---

## Analytics y reporting

| Feature | Monday.com | TaskFlow (actual) | Prioridad |
|---|---|---|---|
| Dashboard con widgets | ✅ | ❌ No existe | 🔴 Crítico |
| Reportes de progreso | ✅ | ❌ No existe | 🔴 Crítico |
| Carga de trabajo por persona | ✅ | ❌ No existe | 🔴 Crítico |
| Time tracking | ✅ | ❌ | 🟢 Bajo |
| Exportar a Excel/CSV | ✅ | ❌ | 🟡 Medio |

---

## Infraestructura y auth

| Feature | Monday.com | TaskFlow (actual) | Prioridad |
|---|---|---|---|
| Auth JWT | ✅ | ✅ | — |
| Logout con blacklist | ✅ | ✅ | — |
| Verificación de email | ✅ | ✅ | — |
| Reset de password | ✅ | ✅ | — |
| 2FA | ✅ | ❌ | 🟢 Bajo |
| SSO / OAuth | ✅ | ❌ | 🟢 Bajo |
| Mobile app | ✅ iOS + Android | ❌ | 🟢 Bajo |
| API pública documentada | ✅ | ⚠️ Swagger existe, incompleto | 🟡 Medio |

---

## Estado actual vs objetivo

```
Monday.com:    ████████████████████  100%
TaskFlow hoy:  ████░░░░░░░░░░░░░░░░   ~20%
TaskFlow meta: ████████████░░░░░░░░   ~60% (suficiente para reemplazar Monday)
```

---

## Features prioritarias para reemplazar Monday (equipo de 2 devs)

Estas son las features que realmente bloquean la migración, ordenadas por impacto:

### Bloqueantes (sin estas no hay migración posible)
1. **Comentarios en tareas** — comunicación asíncrona entre los 2 devs
2. **Kanban view** — flujo de trabajo visual
3. **Dashboard con widgets** — visibilidad del estado del proyecto
4. **Reportes de progreso** — tareas completadas vs pendientes por sprint/semana
5. **Carga de trabajo por persona** — quién tiene qué y cuánto

### Importantes (degradan la experiencia sin ellas)
6. **Notificaciones funcionales** — in-app + email
7. **Feed de actividad** — qué cambió y cuándo
8. **Asignación real de responsable** — FK correcta en DB

### Nice to have (pueden esperar)
9. Vista lista
10. Vista calendario
11. Menciones `@usuario`
12. Reminders funcionales
13. Export CSV

---

## Bugs críticos a resolver antes del SDD

> Detectados en code review del 2026-06-07

| Bug | Archivo | Impacto |
|---|---|---|
| `await` faltante en `deleteUser` | `prismaUser.repository.adapter.ts` | El usuario nunca se elimina |
| `await` faltante en `updateTask` | `Task.controller.ts` | Responde con una Promise, no la tarea |
| IDOR en endpoints de tareas | `Task.controller.ts` | Cualquier usuario ve tareas de otro |
| `src/node_modules` en git | `taskflow-web` | Repo corrupto |
| `assignedTo` sin FK en Prisma | `schema.prisma` | Integridad referencial rota |
| `Task` sin `@id` en Prisma | `schema.prisma` | Comportamiento inesperado del ORM |

---

*Generado durante code review inicial — Task-Flow-Team*
