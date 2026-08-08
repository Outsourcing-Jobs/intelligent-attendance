import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  eventType: string;

  @IsString()
  @IsNotEmpty()
  titleTemplate: string;

  @IsString()
  @IsNotEmpty()
  bodyTemplate: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(['firebase', 'socket'], { each: true })
  channels?: string[];

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
