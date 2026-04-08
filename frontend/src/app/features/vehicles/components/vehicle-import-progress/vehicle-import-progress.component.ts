import { Component, input } from '@angular/core';
import { ImportStatusResponse } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-import-progress',
  imports: [],
  templateUrl: './vehicle-import-progress.component.html',
  styleUrl: './vehicle-import-progress.component.scss'
})
export class VehicleImportProgressComponent {
  readonly data = input<ImportStatusResponse | null>(null);
  readonly polling = input(false);
}
