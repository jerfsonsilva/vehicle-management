import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GetVehicleUseCase } from './get-vehicle.usecase';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { GetVehicleQuery } from '../queries/get-vehicle.query';

describe('GetVehicleUseCase', () => {
  let useCase: GetVehicleUseCase;
  let repository: jest.Mocked<VehicleRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetVehicleUseCase(repository);
  });

  it('should return vehicle when found', async () => {
    const vehicle = new VehicleEntity(
      'id-1',
      'ABC1D23',
      '9BWZZZ377VT004251',
      '12345678901',
      'Onix',
      'Chevrolet',
      2022,
    );
    repository.findById.mockResolvedValue(vehicle);

    const result = await useCase.execute(new GetVehicleQuery('id-1'));

    expect(repository.findById).toHaveBeenCalledWith('id-1');
    expect(result).toBe(vehicle);
  });

  it('should throw not found when vehicle does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(new GetVehicleQuery('id-404'))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw internal server error on unexpected failure', async () => {
    repository.findById.mockRejectedValue(new Error('db down'));

    await expect(useCase.execute(new GetVehicleQuery('id-1'))).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
