export type VehicleImportQueueRuntimeStatus = {
  visible: number;
  inFlight: number;
};

export abstract class VehicleImportQueueMonitor {
  abstract getRuntimeStatus(): Promise<VehicleImportQueueRuntimeStatus>;
}
