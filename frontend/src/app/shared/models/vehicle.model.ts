export interface Vehicle {
  id: string;
  licensePlate: string;
  chassis: string;
  registrationNumber: string;
  model: string;
  brand: string;
  year: number;
}

export interface VehiclePayload {
  licensePlate: string;
  chassis: string;
  registrationNumber: string;
  model: string;
  brand: string;
  year: number;
}
