import { IsOptional, IsNumber, IsBoolean, IsArray, IsString, Min } from 'class-validator';

export class UpdateAttendanceConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  gracePeriodMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateThresholdMinutes?: number;

  @IsOptional()
  @IsBoolean()
  allowSelfCheckIn?: boolean;

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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
