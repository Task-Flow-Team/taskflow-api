# TaskFlow API — Documentación de Arquitectura

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| NestJS | v11 | Framework HTTP |
| Prisma | v5 | ORM |
| PostgreSQL | — | Base de datos principal |
| Redis | — | Blacklist de tokens + caché |
| Swagger | v11 | Documentación de API |
| Bun | — | Package manager y runtime |
| Zod | v3 | Validación adicional |
| Passport.js | — | Estrategias de auth |
| JWT | — | Tokens de autenticación |

---

## Arquitectura Hexagonal

El proyecto sigue **Hexagonal Architecture** (Ports & Adapters). El dominio no depende de ningún framework ni infraestructura.

```
src/
├── app/                          # Módulo raíz de NestJS
├── contexts/
│   ├── domain/                   # Núcleo — sin dependencias externas
│   │   ├── models/               # Entidades e interfaces de dominio
│   │   ├── repositories/         # Ports (interfaces abstractas)
│   │   └── services/             # Domain services (lógica de negocio pura)
│   │
│   ├── application/              # Casos de uso
│   │   └── usecases/
│   │       ├── auth/             # login, register, logout, verify-email, reset-password
│   │       ├── tasks/            # CRUD + queries de tareas
│   │       ├── subtasks/         # CRUD de subtareas
│   │       ├── tags/             # CRUD de tags
│   │       ├── users/            # CRUD + profile de usuarios
│   │       └── workspaces/       # CRUD + colaboradores
│   │
│   ├── infrastructure/           # Adapters — implementaciones concretas
│   │   ├── http-api/
│   │   │   └── v1/               # Controllers REST versionados
│   │   │       ├── auth/
│   │   │       ├── tasks/
│   │   │       ├── subtasks/
│   │   │       ├── tags/
│   │   │       ├── users/
│   │   │       └── workspace/
│   │   ├── repositories/         # Adapters Prisma (implementan los ports)
│   │   └── services/             # Servicios de infraestructura (mailer, etc.)
│   │
│   └── shared/                   # Código compartido entre capas
│       ├── lib/
│       │   ├── decorators/       # @User, @Roles, @Public
│       │   ├── guards/           # JwtAuthGuard, RolesGuard
│       │   ├── errors/           # Excepciones custom (AlreadyExistsException)
│       │   └── types/            # Tipos compartidos (Role enum, etc.)
│       └── prisma/               # PrismaService (singleton)
│
└── main.ts                       # Bootstrap: CORS, Swagger, Redis microservice
```

---

## Regla de dependencia

```
infrastructure  →  application  →  domain
     ↑                  ↑
  NestJS DI         Use Cases
  Controllers       (orquestan)
  Prisma adapters
```

**La dirección de dependencia siempre apunta hacia el dominio. El dominio no importa nada de infraestructura ni application.**

---

## Convenciones de nomenclatura

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Entity / Model | `{name}.entity.ts` | `user.entity.ts` |
| Repository Port | `{name}.repository.port.ts` | `user.repository.port.ts` |
| Repository Adapter | `prisma{Name}.repository.adapter.ts` | `prismaUser.repository.adapter.ts` |
| Use Case | `{action}-{entity}.use-case.ts` | `create-task.use-case.ts` |
| Controller | `{Name}.controller.ts` | `Task.controller.ts` |
| DTO | `{name}.dto.ts` | `create-task.dto.ts` |
| Module | `{name}.module.ts` | `application.module.ts` |

---

## Flujo de una request

```
HTTP Request
    ↓
Controller (infrastructure/http-api/v1)
    ↓  extrae y valida DTO
Use Case (application/usecases)
    ↓  orquesta la lógica
Repository Port (domain/repositories)  ← interfaz abstracta
    ↓  implementado por
Prisma Adapter (infrastructure/repositories)
    ↓
PostgreSQL
```

---

## Auth

### Estrategia
- **Login**: Passport `local` strategy → valida email+password → genera JWT
- **Rutas protegidas**: `JwtAuthGuard` + `@UseGuards`
- **Rutas públicas**: decorador `@Public()` que bypasea el guard global
- **Logout**: el token se agrega a una blacklist en Redis con TTL = expiración del token

### JWT Payload
```typescript
{
  userId: string,  // UUID del usuario
  email: string,
  iat: number,
  exp: number
}
```

### Guards y decoradores
| Decorador/Guard | Uso |
|---|---|
| `@Public()` | Marca un endpoint como público (sin auth) |
| `@User('userId')` | Extrae el userId del JWT del request |
| `@Roles('ADMIN')` | Restringe acceso por rol |
| `JwtAuthGuard` | Verifica JWT + blacklist Redis |

---

## Base de datos

### Modelos principales
| Modelo | Descripción |
|---|---|
| `User` | Usuario del sistema con roles |
| `Workspace` | Espacio de trabajo del usuario |
| `Task` | Tarea dentro de un workspace |
| `Subtasks` | Subtarea de una tarea |
| `WorkspaceCollaborator` | Relación muchos-a-muchos User-Workspace |
| `Tags` / `TaskTags` | Tags asignados a tareas |
| `Reminders` | Recordatorios de tareas |
| `Notifications` | Notificaciones in-app |
| `ActivityLogs` | Registro de actividad por workspace |
| `Settings` | Configuraciones por usuario |
| `VerificationToken` | Tokens de verificación de email |
| `Session` / `Account` | Compatibilidad NextAuth (si aplica) |

### Enums
```prisma
enum Role    { ADMIN USER }
enum Status  { OPEN IN_PROGRESS COMPLETED }
```

---

## Variables de entorno requeridas

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow
JWT_SECRET=your-secret-here
REDIS_URL=redis://user:password@localhost:6379

# Mailer
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=

# Mailjet (alternativo)
MAILJET_API_KEY=
MAILJET_SECRET_KEY=
```

---

## Endpoints disponibles (v0.0.1)

### Auth — `/v1/auth`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Login con email + password |
| POST | `/register` | Registro de nuevo usuario |
| POST | `/logout` | Logout (invalida JWT en Redis) |
| POST | `/verify-email` | Envía email de verificación |
| GET | `/verify-email?token=` | Confirma verificación |
| POST | `/resend-email` | Reenvía email de verificación |
| POST | `/reset-password` | Envía email de reset |
| POST | `/reset-password/confirm` | Confirma reset con token + nueva contraseña |

### Tasks — `/v1/tasks` (requiere JWT)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/` | Crear tarea |
| GET | `/` | Todas las tareas (ADMIN only) |
| GET | `/:id` | Tarea por ID |
| GET | `/assigned-to/:userId` | Tareas asignadas a un usuario |
| GET | `/created-by/:userId` | Tareas creadas por un usuario |
| GET | `/of/:userId` | Todas las tareas de un usuario |
| GET | `/workspace/:workspaceId` | Tareas de un workspace |
| PUT | `/:id` | Actualizar tarea |
| DELETE | `/:id` | Eliminar tarea |

### Workspaces — `/v1/workspaces` (requiere JWT)
### Users — `/v1/users` (requiere JWT)
### Subtasks — `/v1/subtasks` (requiere JWT)
### Tags — `/v1/tags` (requiere JWT)

> Documentación completa: `http://localhost:3000/api/docs`

---

## Cómo agregar un nuevo feature (checklist)

1. **Domain**: agregar entidad en `domain/models/{name}.entity.ts`
2. **Domain**: agregar port en `domain/repositories/{name}.repository.port.ts`
3. **Application**: crear use case en `application/usecases/{domain}/{action}.use-case.ts`
4. **Infrastructure**: implementar adapter en `infrastructure/repositories/prisma{Name}.repository.adapter.ts`
5. **Infrastructure**: crear controller en `infrastructure/http-api/v1/{domain}/{Name}.controller.ts`
6. **Infrastructure**: crear DTOs en `infrastructure/http-api/v1/{domain}/dtos/`
7. **Module**: registrar en `application.module.ts` e `infrastructure.module.ts`
8. **Schema**: agregar modelo en `prisma/schema.prisma` y correr migración
9. **Swagger**: decorar controller y DTOs con `@ApiOperation`, `@ApiResponse`, `@ApiProperty`
10. **Tests**: agregar test unitario del use case y test de integración del adapter

---

*Ver también: [ROADMAP.md](../ROADMAP.md) | [CHANGELOG.md](../CHANGELOG.md)*
