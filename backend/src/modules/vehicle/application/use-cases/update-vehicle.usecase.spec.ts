import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateVehicleUseCase } from './update-vehicle.usecase';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';

describe('UpdateVehicleUseCase', () => {
  let useCase: UpdateVehicleUseCase;
  let repository: jest.Mocked<VehicleRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateVehicleUseCase(repository);
  });

  it('should update vehicle successfully', async () => {
    const current = new VehicleEntity(
      'id-1',
      'ABC1D23',
      '9BWZZZ377VT004251',
      '12345678901',
      'Onix',
      'Chevrolet',
      2022,
    );
    const updated = new VehicleEntity(
      'id-1',
      'ABC1D23',
      '9BWZZZ377VT004251',
      '12345678901',
      'Onix LT',
      'Chevrolet',
      2023,
    );
    repository.findById.mockResolvedValue(current);
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute({
      id: 'id-1',
      model: 'Onix LT',
      year: 2023,
    });

    expect(repository.findById).toHaveBeenCalledWith('id-1');
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'id-1',
        model: 'Onix LT',
        year: 2023,
      }),
    );
    expect(result).toBe(updated);
  });

  it('should throw not found when vehicle does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'id-404' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw internal server error on unexpected failure', async () => {
    repository.findById.mockRejectedValue(new Error('db down'));

    await expect(useCase.execute({ id: 'id-1' })).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
