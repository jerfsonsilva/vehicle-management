import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Vehicle } from '../../../../shared/models/vehicle.model';

@Component({
  selector: 'app-vehicle-list',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent {
  readonly vehicles = input.required<Vehicle[]>();
  readonly edit = output<Vehicle>();
  readonly remove = output<Vehicle>();
}
