import { VehicleImportQueuePayload } from '../../domain/ports/vehicle-import.queue';
import {
  VEHICLE_CHASSIS_LENGTH,
  VEHICLE_LICENSE_PLATE_REGEX,
  VEHICLE_REGISTRATION_NUMBER_REGEX,
  VEHICLE_YEAR_MAX,
  VEHICLE_YEAR_MIN,
} from '../../domain/constants/vehicle-field-patterns';

function cellString(val: unknown): string {
  if (typeof val === 'string') {
    return val.trim();
  }
  if (typeof val === 'number' && Number.isFinite(val)) {
    return String(val).trim();
  }
  return '';
}

function parseYear(yearRaw: unknown): number | null {
  if (typeof yearRaw === 'number' && Number.isFinite(yearRaw)) {
    return Math.trunc(yearRaw);
  }
  if (typeof yearRaw === 'string') {
    const parsed = parseInt(yearRaw.trim(), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function isValidYear(year: number): boolean {
  return (
    Number.isInteger(year) &&
    year >= VEHICLE_YEAR_MIN &&
    year <= VEHICLE_YEAR_MAX
  );
}

function isValidLicensePlate(licensePlate: string): boolean {
  return (
    Boolean(licensePlate) && VEHICLE_LICENSE_PLATE_REGEX.test(licensePlate)
  );
}

function isValidChassis(chassis: string): boolean {
  return chassis.length === VEHICLE_CHASSIS_LENGTH;
}

function isValidRegistrationNumber(registrationNumber: string): boolean {
  return (
    Boolean(registrationNumber) &&
    VEHICLE_REGISTRATION_NUMBER_REGEX.test(registrationNumber)
  );
}

function isValidModel(model: string): boolean {
  return Boolean(model);
}

function isValidBrand(brand: string): boolean {
  return Boolean(brand);
}

export function rowToVehicleImportPayload(
  row: Record<string, unknown>,
): VehicleImportQueuePayload | null {
  const licensePlate = cellString(row.licensePlate);
  const chassis = cellString(row.chassis);
  const registrationNumber = cellString(row.registrationNumber);
  const model = cellString(row.model);
  const brand = cellString(row.brand);

  const year = parseYear(row.year);
  if (year === null) {
    return null;
  }

  if (
    !isValidLicensePlate(licensePlate) ||
    !isValidChassis(chassis) ||
    !isValidRegistrationNumber(registrationNumber) ||
    !isValidModel(model) ||
    !isValidBrand(brand) ||
    !isValidYear(year)
  ) {
    return null;
  }

  return {
    licensePlate,
    chassis,
    registrationNumber,
    model,
    brand,
    year,
  };
}
