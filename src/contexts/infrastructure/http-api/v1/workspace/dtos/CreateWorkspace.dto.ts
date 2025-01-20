import { Workspace } from "@/contexts/domain/models";
import { IsString, IsOptional, IsNotEmpty, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWorkspaceDto implements Partial<Workspace> {
    @ApiProperty({
        description: "Nombre del espacio de trabajo. Debe tener al menos 5 caracteres.",
        example: "Proyecto Alpha",
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    name: string;

    @ApiPropertyOptional({
        description: "Descripción opcional del espacio de trabajo. Debe tener al menos 5 caracteres.",
        example: "Espacio dedicado al desarrollo del proyecto Alpha.",
    })
    @IsString()
    @IsOptional()
    @MinLength(5)
    description: string;
}
