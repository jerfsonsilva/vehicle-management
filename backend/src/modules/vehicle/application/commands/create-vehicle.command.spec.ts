import { CreateVehicleCommand } from './create-vehicle.command';

describe('CreateVehicleCommand', () => {
  it('should allow property assignment', () => {
    const command = new CreateVehicleCommand();
    command.licensePlate = 'ABC1D23';
    command.chassis = '9BWZZZ377VT004251';
    command.registrationNumber = '12345678901';
    command.model = 'Onix';
    command.brand = 'Chevrolet';
    command.year = 2022;

    expect(command).toEqual({
      licensePlate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });
  });
});
