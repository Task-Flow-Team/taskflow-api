import { IsString, IsOptional, IsEnum, IsInt, IsDateString, IsUUID } from 'class-validator';
import { TaskStatus } from '@/contexts/shared/lib/types';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la tarea.',
    example: 'Actualizar la API de autenticación',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción de la tarea.',
    example: 'Actualizar el flujo de autenticación para manejar múltiples roles.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nuevo estado de la tarea. Puede ser "OPEN", "IN_PROGRESS" o "COMPLETED".',
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Nueva prioridad de la tarea. Valor numérico que indica la importancia.',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({
    description: 'Nueva fecha límite de la tarea en formato ISO 8601.',
    example: '2025-02-15T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  due_date?: Date;

  @ApiPropertyOptional({
    description: 'Nuevo UUID del usuario asignado a la tarea.',
    example: '550e8400-e29b-41d4-a716-446655440333',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
