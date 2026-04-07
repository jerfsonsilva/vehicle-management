export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
}

export interface VehiclePayload {
  plate: string;
  model: string;
  brand: string;
  year: number;
}
