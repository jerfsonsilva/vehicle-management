import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i, {
    message: 'licensePlate must be in a valid format',
  })
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @Length(17, 17)
  chassis?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{11}$/, {
    message: 'registrationNumber must have 11 digits',
  })
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;
}
