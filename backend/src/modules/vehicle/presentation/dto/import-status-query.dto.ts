import { IsOptional, Matches } from 'class-validator';

export class ImportStatusQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be YYYY-MM-DD (UTC day boundary)',
  })
  date?: string;
}
