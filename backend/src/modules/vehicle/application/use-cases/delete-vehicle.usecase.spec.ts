import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DeleteVehicleUseCase } from './delete-vehicle.usecase';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

describe('DeleteVehicleUseCase', () => {
  let useCase: DeleteVehicleUseCase;
  let repository: jest.Mocked<VehicleRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteVehicleUseCase(repository);
  });

  it('should delete vehicle successfully', async () => {
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute('id-1');

    expect(repository.delete).toHaveBeenCalledWith('id-1');
  });

  it('should preserve not found exception', async () => {
    repository.delete.mockRejectedValue(new NotFoundException('Vehicle not found'));

    await expect(useCase.execute('id-404')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw internal server error on unexpected failure', async () => {
    repository.delete.mockRejectedValue(new Error('db down'));

    await expect(useCase.execute('id-1')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
