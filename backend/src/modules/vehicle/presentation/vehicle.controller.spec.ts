import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { CreateVehicleUseCase } from '../application/use-cases/create-vehicle.usecase';
import { GetVehicleUseCase } from '../application/use-cases/get-vehicle.usecase';
import { UpdateVehicleUseCase } from '../application/use-cases/update-vehicle.usecase';
import { DeleteVehicleUseCase } from '../application/use-cases/delete-vehicle.usecase';
import { ListVehiclesUseCase } from '../application/use-cases/list-vehicles.usecase';

describe('VehicleController', () => {
  let controller: VehicleController;
  let createUseCase: { execute: jest.Mock };
  let listUseCase: { execute: jest.Mock };
  let getUseCase: { execute: jest.Mock };
  let updateUseCase: { execute: jest.Mock };
  let deleteUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    createUseCase = { execute: jest.fn() };
    listUseCase = { execute: jest.fn() };
    getUseCase = { execute: jest.fn() };
    updateUseCase = { execute: jest.fn() };
    deleteUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        { provide: CreateVehicleUseCase, useValue: createUseCase },
        { provide: ListVehiclesUseCase, useValue: listUseCase },
        { provide: GetVehicleUseCase, useValue: getUseCase },
        { provide: UpdateVehicleUseCase, useValue: updateUseCase },
        { provide: DeleteVehicleUseCase, useValue: deleteUseCase },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  it('should delegate create to CreateVehicleUseCase', async () => {
    createUseCase.execute.mockResolvedValue({ id: 'id-1' });
    const dto = {
      licensePlate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    };

    await controller.create(dto);

    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findById to GetVehicleUseCase', async () => {
    getUseCase.execute.mockResolvedValue({ id: 'id-1' });

    await controller.findById('id-1');

    expect(getUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'id-1' }),
    );
  });

  it('should delegate findAll to ListVehiclesUseCase', async () => {
    listUseCase.execute.mockResolvedValue([]);

    await controller.findAll();

    expect(listUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should delegate update to UpdateVehicleUseCase', async () => {
    updateUseCase.execute.mockResolvedValue({ id: 'id-1' });
    const dto = { model: 'Onix LT', year: 2023 };

    await controller.update('id-1', dto);

    expect(updateUseCase.execute).toHaveBeenCalledWith({
      id: 'id-1',
      licensePlate: undefined,
      chassis: undefined,
      registrationNumber: undefined,
      model: 'Onix LT',
      brand: undefined,
      year: 2023,
    });
  });

  it('should delegate delete to DeleteVehicleUseCase', async () => {
    deleteUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.remove('id-1');

    expect(deleteUseCase.execute).toHaveBeenCalledWith('id-1');
    expect(result).toEqual({ success: true });
  });
});
