import { MODULE_METADATA } from '@nestjs/common/constants';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EnqueueVehicleImportFromCsvUseCase } from './application/use-cases/enqueue-vehicle-import-from-csv.usecase';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.usecase';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.usecase';
import { GetVehicleImportDailyStatusUseCase } from './application/use-cases/get-vehicle-import-daily-status.usecase';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.usecase';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.usecase';
import { ProcessVehicleImportMessageUseCase } from './application/use-cases/process-vehicle-import-message.usecase';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.usecase';
import { VehicleImportQueue } from './domain/ports/vehicle-import.queue';
import { VehicleImportStatRepository } from './domain/repositories/vehicle-import-stat.repository';
import { VehicleRepository } from './domain/repositories/vehicle.repository';
import { PrismaVehicleImportStatRepository } from './infra/database/prisma-vehicle-import-stat.repository';
import { PrismaVehicleRepository } from './infra/database/prisma-vehicle.repository';
import { SqsVehicleImportQueue } from './infra/sqs/sqs-vehicle-import.queue';
import { VehicleImportController } from './presentation/vehicle-import.controller';
import { VehicleController } from './presentation/vehicle.controller';
import { VehicleModule } from './vehicle.module';

describe('VehicleModule', () => {
  it('should register controller and providers', () => {
    const controllers = Reflect.getMetadata(
      MODULE_METADATA.CONTROLLERS,
      VehicleModule,
    ) as unknown[];
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      VehicleModule,
    ) as unknown[];

    expect(controllers).toEqual([VehicleController, VehicleImportController]);
    expect(providers).toEqual([
      PrismaService,
      CreateVehicleUseCase,
      ListVehiclesUseCase,
      GetVehicleUseCase,
      UpdateVehicleUseCase,
      DeleteVehicleUseCase,
      EnqueueVehicleImportFromCsvUseCase,
      ProcessVehicleImportMessageUseCase,
      GetVehicleImportDailyStatusUseCase,
      {
        provide: VehicleRepository,
        useClass: PrismaVehicleRepository,
      },
      {
        provide: VehicleImportQueue,
        useClass: SqsVehicleImportQueue,
      },
      {
        provide: VehicleImportStatRepository,
        useClass: PrismaVehicleImportStatRepository,
      },
    ]);
  });
});
