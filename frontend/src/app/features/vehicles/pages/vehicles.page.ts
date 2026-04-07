import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, switchMap } from 'rxjs';
import { PageShellComponent } from '../../../shared/ui/page-shell/page-shell.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { Vehicle, VehiclePayload } from '../../../shared/models/vehicle.model';
import { VehicleFormModalComponent } from '../components/vehicle-form-modal/vehicle-form-modal.component';
import { VehicleListComponent } from '../components/vehicle-list/vehicle-list.component';
import { VehicleService } from '../services/vehicle.service';
import { VehiclesStore } from '../state/vehicles.store';

@Component({
  selector: 'app-vehicles-page',
  imports: [
    PageShellComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    VehicleListComponent
  ],
  providers: [VehiclesStore],
  templateUrl: './vehicles.page.html',
  styleUrl: './vehicles.page.scss'
})
export class VehiclesPage implements OnInit {
  readonly store = inject(VehiclesStore);
  private readonly vehicleService = inject(VehicleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.store.loadVehicles();
  }

  openCreateModal() {
    this.dialog
      .open(VehicleFormModalComponent, { width: '620px' })
      .afterClosed()
      .pipe(
        filter((payload): payload is VehiclePayload => !!payload),
        switchMap((payload) => this.vehicleService.create(payload))
      )
      .subscribe(() => {
        this.snackBar.open('Veículo cadastrado.', 'Fechar', { duration: 2500 });
        this.store.loadVehicles();
      });
  }

  openEditModal(vehicle: Vehicle) {
    this.dialog
      .open(VehicleFormModalComponent, {
        width: '620px',
        data: { vehicle }
      })
      .afterClosed()
      .pipe(
        filter((payload): payload is VehiclePayload => !!payload),
        switchMap((payload) => this.vehicleService.update(vehicle.id, payload))
      )
      .subscribe(() => {
        this.snackBar.open('Veículo atualizado.', 'Fechar', { duration: 2500 });
        this.store.loadVehicles();
      });
  }

  confirmDelete(vehicle: Vehicle) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Excluir veículo',
          message: `Deseja excluir ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})?`,
          confirmLabel: 'Excluir'
        }
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.vehicleService.delete(vehicle.id))
      )
      .subscribe(() => {
        this.snackBar.open('Veículo excluído.', 'Fechar', { duration: 2500 });
        this.store.loadVehicles();
      });
  }
}
