import { VehicleImportStatRepository } from '../../domain/repositories/vehicle-import-stat.repository';
import { CreateVehicleUseCase } from './create-vehicle.usecase';
import { ProcessVehicleImportMessageUseCase } from './process-vehicle-import-message.usecase';

describe('ProcessVehicleImportMessageUseCase', () => {
  let useCase: ProcessVehicleImportMessageUseCase;
  let createVehicle: jest.Mocked<CreateVehicleUseCase>;
  let statsRepository: jest.Mocked<VehicleImportStatRepository>;

  beforeEach(() => {
    createVehicle = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateVehicleUseCase>;
    statsRepository = {
      findByUtcDay: jest.fn(),
      incrementSuccessForUtcDay: jest.fn(),
      incrementFailureForUtcDay: jest.fn(),
    };
    useCase = new ProcessVehicleImportMessageUseCase(
      createVehicle,
      statsRepository,
    );
  });

  it('creates vehicle and increments success count for valid message', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const body = JSON.stringify({
      licensePlate: 'ABC1D23',
      chassis: '1HGBH41JXMN109186',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });

    const result = await useCase.execute(body, now);

    expect(result).toBe(true);
    expect(createVehicle.execute).toHaveBeenCalledTimes(1);
    expect(statsRepository.incrementSuccessForUtcDay).toHaveBeenCalledWith(now);
    expect(statsRepository.incrementFailureForUtcDay).not.toHaveBeenCalled();
  });

  it('increments failure count when message is invalid', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');

    const result = await useCase.execute('{"invalid":true}', now);

    expect(result).toBe(false);
    expect(createVehicle.execute).not.toHaveBeenCalled();
    expect(statsRepository.incrementFailureForUtcDay).toHaveBeenCalledWith(now);
    expect(statsRepository.incrementSuccessForUtcDay).not.toHaveBeenCalled();
  });
});
