import { IsNotEmpty, IsOptional, IsNumber, IsString, IsDateString, Min, Max, IsArray, IsBoolean } from 'class-validator';

export class CreateClassSessionDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(15)
  startPeriod: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  numPeriods: number;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  lecturerId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedPublicIps?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  allowedRadiusMeters?: number;

  @IsOptional()
  @IsBoolean()
  requireWifiCheck?: boolean;

  @IsOptional()
  @IsBoolean()
  requireLocationCheck?: boolean;
}
