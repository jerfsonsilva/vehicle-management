import { MODULE_METADATA } from '@nestjs/common/constants';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.usecase';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.usecase';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.usecase';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.usecase';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.usecase';
import { VehicleRepository } from './domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from './infra/database/prisma-vehicle.repository';
import { VehicleController } from './presentation/vehicle.controller';
import { VehicleModule } from './vehicle.module';

describe('VehicleModule', () => {
  it('should register controller and providers', () => {
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, VehicleModule);
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, VehicleModule);

    expect(controllers).toEqual([VehicleController]);
    expect(providers).toEqual([
      PrismaService,
      CreateVehicleUseCase,
      ListVehiclesUseCase,
      GetVehicleUseCase,
      UpdateVehicleUseCase,
      DeleteVehicleUseCase,
      {
        provide: VehicleRepository,
        useClass: PrismaVehicleRepository,
      },
    ]);
  });
});
