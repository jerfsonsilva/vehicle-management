import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.usecase';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.usecase';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.usecase';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.usecase';
import { VehicleDomainService } from './domain/services/vehicle-domain.service';
import { VehicleRepository } from './domain/repositories/vehicle.repository';
import { PrismaVehicleRepository } from './infra/database/prisma-vehicle.repository';
import { VehicleController } from './presentation/vehicle.controller';

@Module({
  controllers: [VehicleController],
  providers: [
    PrismaService,
    VehicleDomainService,
    CreateVehicleUseCase,
    GetVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    {
      provide: VehicleRepository,
      useClass: PrismaVehicleRepository,
    },
  ],
})
export class VehicleModule {}
