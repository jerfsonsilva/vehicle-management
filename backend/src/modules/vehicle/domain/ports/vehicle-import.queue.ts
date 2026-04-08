export type VehicleImportQueuePayload = {
  licensePlate: string;
  chassis: string;
  registrationNumber: string;
  model: string;
  brand: string;
  year: number;
};

export abstract class VehicleImportQueue {
  abstract enqueue(payload: VehicleImportQueuePayload): Promise<void>;
}
