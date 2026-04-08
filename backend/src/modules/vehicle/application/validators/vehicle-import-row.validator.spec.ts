import { rowToVehicleImportPayload } from './vehicle-import-row.validator';

describe('rowToVehicleImportPayload', () => {
  it('returns payload for a valid row', () => {
    const result = rowToVehicleImportPayload({
      licensePlate: 'ABC1D23',
      chassis: '1HGBH41JXMN109186',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });

    expect(result).toEqual({
      licensePlate: 'ABC1D23',
      chassis: '1HGBH41JXMN109186',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });
  });

  it('returns null for invalid year', () => {
    const result = rowToVehicleImportPayload({
      licensePlate: 'ABC1D23',
      chassis: '1HGBH41JXMN109186',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 'invalid',
    });

    expect(result).toBeNull();
  });

  it('returns null for invalid license plate', () => {
    const result = rowToVehicleImportPayload({
      licensePlate: 'INVALID',
      chassis: '1HGBH41JXMN109186',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });

    expect(result).toBeNull();
  });
});
