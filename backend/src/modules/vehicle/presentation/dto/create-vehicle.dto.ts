import {
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {
  VEHICLE_CHASSIS_LENGTH,
  VEHICLE_LICENSE_PLATE_REGEX,
  VEHICLE_REGISTRATION_NUMBER_REGEX,
  VEHICLE_YEAR_MAX,
  VEHICLE_YEAR_MIN,
} from '../../domain/constants/vehicle-field-patterns';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(VEHICLE_LICENSE_PLATE_REGEX, {
    message: 'licensePlate must be in a valid format',
  })
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  @Length(VEHICLE_CHASSIS_LENGTH, VEHICLE_CHASSIS_LENGTH)
  chassis: string;

  @IsString()
  @IsNotEmpty()
  @Matches(VEHICLE_REGISTRATION_NUMBER_REGEX, {
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
  @Min(VEHICLE_YEAR_MIN)
  @Max(VEHICLE_YEAR_MAX)
  year: number;
}
