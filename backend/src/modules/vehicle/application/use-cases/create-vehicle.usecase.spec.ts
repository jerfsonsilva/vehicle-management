import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateVehicleUseCase } from './create-vehicle.usecase';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';

describe('CreateVehicleUseCase', () => {
  let useCase: CreateVehicleUseCase;
  let repository: jest.Mocked<VehicleRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateVehicleUseCase(repository);
  });

  it('should create vehicle successfully', async () => {
    const created = new VehicleEntity(
      'id-1',
      'ABC1D23',
      '9BWZZZ377VT004251',
      '12345678901',
      'Onix',
      'Chevrolet',
      2022,
    );
    repository.create.mockResolvedValue(created);

    const result = await useCase.execute({
      licensePlate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        licensePlate: 'ABC1D23',
        chassis: '9BWZZZ377VT004251',
        registrationNumber: '12345678901',
        model: 'Onix',
        brand: 'Chevrolet',
        year: 2022,
      }),
    );
    expect(result).toBe(created);
  });

  it('should throw internal server error on unexpected failure', async () => {
    repository.create.mockRejectedValue(new Error('db down'));

    await expect(
      useCase.execute({
        licensePlate: 'ABC1D23',
        chassis: '9BWZZZ377VT004251',
        registrationNumber: '12345678901',
        model: 'Onix',
        brand: 'Chevrolet',
        year: 2022,
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('should preserve conflict exception for duplicated data', async () => {
    repository.create.mockRejectedValue(
      new ConflictException('Duplicate value'),
    );

    await expect(
      useCase.execute({
        licensePlate: 'ABC1D23',
        chassis: '9BWZZZ377VT004251',
        registrationNumber: '12345678901',
        model: 'Onix',
        brand: 'Chevrolet',
        year: 2022,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
