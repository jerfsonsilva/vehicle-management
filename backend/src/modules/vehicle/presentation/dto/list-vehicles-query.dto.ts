import { Transform } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class ListVehiclesQueryDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsIn([10, 20, 50, 100])
  pageSize = 10;
}
