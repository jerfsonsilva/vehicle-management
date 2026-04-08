export type VehicleImportDailyStatSnapshot = {
  successCount: number;
  failureCount: number;
};

export abstract class VehicleImportStatRepository {
  abstract findByUtcDay(
    day: Date,
  ): Promise<VehicleImportDailyStatSnapshot | null>;

  abstract incrementSuccessForUtcDay(day: Date): Promise<void>;

  abstract incrementFailureForUtcDay(day: Date): Promise<void>;
}
