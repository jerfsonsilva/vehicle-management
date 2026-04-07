import {
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i, {
    message: 'licensePlate must be in a valid format',
  })
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  @Length(17, 17)
  chassis: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{11}$/, {
    message: 'registrationNumber must have 11 digits',
  })
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;
}
