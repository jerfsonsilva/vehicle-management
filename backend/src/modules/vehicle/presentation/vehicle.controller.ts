import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateVehicleCommand } from '../application/commands/create-vehicle.command';
import { GetVehicleQuery } from '../application/queries/get-vehicle.query';
import { CreateVehicleUseCase } from '../application/use-cases/create-vehicle.usecase';
import { DeleteVehicleUseCase } from '../application/use-cases/delete-vehicle.usecase';
import {
  UpdateVehicleCommand,
  UpdateVehicleUseCase,
} from '../application/use-cases/update-vehicle.usecase';
import { GetVehicleUseCase } from '../application/use-cases/get-vehicle.usecase';
import { ListVehiclesUseCase } from '../application/use-cases/list-vehicles.usecase';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly listVehiclesUseCase: ListVehiclesUseCase,
    private readonly getVehicleUseCase: GetVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateVehicleDto) {
    const command: CreateVehicleCommand = {
      licensePlate: dto.licensePlate,
      chassis: dto.chassis,
      registrationNumber: dto.registrationNumber,
      model: dto.model,
      brand: dto.brand,
      year: dto.year,
    };
    return this.createVehicleUseCase.execute(command);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.getVehicleUseCase.execute(new GetVehicleQuery(id));
  }

  @Get()
  async findAll(@Query() query: ListVehiclesQueryDto) {
    return this.listVehiclesUseCase.execute({
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    const command: UpdateVehicleCommand = {
      id,
      licensePlate: dto.licensePlate,
      chassis: dto.chassis,
      registrationNumber: dto.registrationNumber,
      model: dto.model,
      brand: dto.brand,
      year: dto.year,
    };
    return this.updateVehicleUseCase.execute(command);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteVehicleUseCase.execute(id);
    return { success: true };
  }
}
