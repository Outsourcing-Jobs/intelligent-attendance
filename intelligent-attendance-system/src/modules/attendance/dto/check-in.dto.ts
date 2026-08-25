import { IsNotEmpty, IsOptional, IsNumber, IsString, IsMongoId } from 'class-validator';

export class CheckInDto {
  @IsMongoId()
  @IsNotEmpty()
  classSessionId: string;

  @IsMongoId()
  @IsNotEmpty()
  courseSectionId: string;

  @IsOptional()
  @IsNumber()
  userLat?: number;

  @IsOptional()
  @IsNumber()
  userLng?: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsString()
  capturedImage?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
