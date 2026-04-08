import { InternalServerErrorException } from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { ListVehiclesUseCase } from './list-vehicles.usecase';

describe('ListVehiclesUseCase', () => {
  let useCase: ListVehiclesUseCase;
  let repository: jest.Mocked<VehicleRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ListVehiclesUseCase(repository);
  });

  it('should return list of vehicles', async () => {
    const vehicles = [
      new VehicleEntity(
        'id-1',
        'ABC1D23',
        '9BWZZZ377VT004251',
        '12345678901',
        'Onix',
        'Chevrolet',
        2022,
      ),
    ];
    repository.findAll.mockResolvedValue({ items: vehicles, total: 1 });

    const result = await useCase.execute({ page: 1, pageSize: 10 });

    expect(repository.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    expect(result).toEqual({
      items: vehicles,
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('should throw internal server error on unexpected failure', async () => {
    repository.findAll.mockRejectedValue(new Error('db down'));

    await expect(
      useCase.execute({ page: 1, pageSize: 10 }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
