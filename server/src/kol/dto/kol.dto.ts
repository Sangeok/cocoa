import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateKolDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
  telegram?: string;

  @IsOptional()
  @IsUrl()
  youtube?: string;

  @IsOptional()
  @IsUrl()
  x?: string;

  @IsNumber()
  followers: number;

  @IsString()
  image: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsString()
  selfIntroduction: string;
}

export class UpdateKolDto extends CreateKolDto {
  @IsOptional()
  name: string;

  @IsOptional()
  followers: number;

  @IsOptional()
  image: string;

  @IsOptional()
  keywords: string[];

  @IsOptional()
  selfIntroduction: string;
}
