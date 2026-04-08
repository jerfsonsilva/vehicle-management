import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EnqueueVehicleImportFromCsvUseCase } from '../application/use-cases/enqueue-vehicle-import-from-csv.usecase';
import { GetVehicleImportDailyStatusUseCase } from '../application/use-cases/get-vehicle-import-daily-status.usecase';
import { ImportStatusQueryDto } from './dto/import-status-query.dto';

@Controller('vehicles')
export class VehicleImportController {
  constructor(
    private readonly enqueueVehicleImportFromCsv: EnqueueVehicleImportFromCsvUseCase,
    private readonly getVehicleImportDailyStatus: GetVehicleImportDailyStatusUseCase,
  ) {}

  @Post('import/csv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async importCsv(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('CSV file is required (field name: file)');
    }
    const name = file.originalname?.toLowerCase() ?? '';
    const mime = file.mimetype ?? '';
    const looksCsv =
      mime === 'text/csv' ||
      mime === 'application/vnd.ms-excel' ||
      name.endsWith('.csv');
    if (!looksCsv) {
      throw new BadRequestException('File must be a CSV');
    }
    return this.enqueueVehicleImportFromCsv.execute(file.buffer);
  }

  @Get('import/status')
  async importStatus(@Query() query: ImportStatusQueryDto) {
    return this.getVehicleImportDailyStatus.execute(query.date);
  }
}
