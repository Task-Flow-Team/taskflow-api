import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorador para obtener el usuario o una propiedad específica desde el payload del token
export const User = createParamDecorator(
  (data: 'userId' | 'email' | undefined, ctx: ExecutionContext) => {
    // Obtener la solicitud desde el contexto
    const request = ctx.switchToHttp().getRequest();

    // Si no hay información de usuario en la solicitud, lanzar un error
    if (!request.user) {
      throw new Error('No se encontró información del usuario en la solicitud');
    }

    // Si 'data' está definido, devolver esa propiedad específica
    if (data) {
      return request.user[data];
    }

    // Si no se especifica 'data', devolver to.do el objeto del payload
    return request.user;
  },
);

/**
 * ## Descripción del Decorador `@User`
 *
 * Este decorador se utiliza para acceder a la información contenida en el payload
 * del token JWT que ha sido procesado por el guard de autenticación (`JwtAuthGuard`).
 *
 * ### Uso General
 * - Este decorador puede ser usado en los controladores para obtener:
 *   - To.do el objeto del payload del token.
 *   - Propiedades específicas como `userId` o `email`.
 *
 * ### Parámetros
 * - **`data`** *(opcional)*: Una propiedad específica del payload (`userId` o `email`).
 *   - Si se pasa, el decorador devuelve el valor de esa propiedad.
 *   - Si no se pasa, el decorador devuelve to.do el objeto del payload.
 *
 * ### Ejemplos
 * #### Obtener el Objeto Completo del Payload
 * ```typescript
 * @Get('profile')
 * async getProfile(@User() user): Promise<any> {
 *   console.log(user);
 *   return user; // Devuelve el payload completo
 * }
 * ```
 * **Salida del Payload:**
 * ```json
 * {
 *   "userId": "4e34f762-64af-4cce-95be-b3ad0d0651f0",
 *   "email": "usuario@ejemplo.com",
 *   "iat": 1737348753,
 *   "exp": 1737370353
 * }
 * ```
 *
 * #### Obtener Solo el `userId`
 * ```typescript
 * @Get('profile/id')
 * async getUserId(@User('userId') userId: string): Promise<any> {
 *   console.log(userId);
 *   return userId; // Devuelve solo el userId
 * }
 * ```
 * **Salida:**
 * ```json
 * "4e34f762-64af-4cce-95be-b3ad0d0651f0"
 * ```
 *
 * ### Notas
 * - Este decorador depende de que el guard de autenticación (`JwtAuthGuard`) haya
 *   procesado correctamente el token y adjuntado la información del payload al
 *   objeto `request.user`.
 * - Si el token es inválido o el guard no procesa correctamente la autenticación,
 *   este decorador lanzará un error indicando que no se encontró información del usuario.
 */


