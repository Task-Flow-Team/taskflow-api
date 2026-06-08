import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Updated content of the comment.',
    example: 'Updated: This task needs more clarification.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
