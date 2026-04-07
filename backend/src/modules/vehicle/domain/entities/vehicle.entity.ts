export class VehicleEntity {
  constructor(
    public readonly id: string,
    public readonly licensePlate: string,
    public readonly chassis: string,
    public readonly registrationNumber: string,
    public readonly model: string,
    public readonly brand: string,
    public readonly year: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
