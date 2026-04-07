import { VehicleEntity } from './vehicle.entity';

describe('VehicleEntity', () => {
  it('should create entity with expected properties', () => {
    const entity = new VehicleEntity(
      'id-1',
      'ABC1D23',
      '9BWZZZ377VT004251',
      '12345678901',
      'Onix',
      'Chevrolet',
      2022,
    );

    expect(entity.id).toBe('id-1');
    expect(entity.licensePlate).toBe('ABC1D23');
    expect(entity.chassis).toBe('9BWZZZ377VT004251');
    expect(entity.registrationNumber).toBe('12345678901');
    expect(entity.model).toBe('Onix');
    expect(entity.brand).toBe('Chevrolet');
    expect(entity.year).toBe(2022);
  });
});
