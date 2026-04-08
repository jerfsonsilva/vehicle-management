import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, filter, switchMap } from 'rxjs';
import { PageShellComponent } from '../../../shared/ui/page-shell/page-shell.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { Vehicle, VehiclePayload } from '../../../shared/models/vehicle.model';
import { VehicleImportProgressComponent } from '../components/vehicle-import-progress/vehicle-import-progress.component';
import { VehicleFormModalComponent } from '../components/vehicle-form-modal/vehicle-form-modal.component';
import { VehicleUploadCsvModalComponent } from '../components/vehicle-upload-csv-modal/vehicle-upload-csv-modal.component';
import { VehicleListComponent } from '../components/vehicle-list/vehicle-list.component';
import {
  ImportStatusResponse,
  UploadCsvResult,
  VehicleService
} from '../services/vehicle.service';
import { VehiclesStore } from '../state/vehicles.store';

@Component({
  selector: 'app-vehicles-page',
  imports: [
    PageShellComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    VehicleImportProgressComponent,
    VehicleListComponent
  ],
  providers: [VehiclesStore],
  templateUrl: './vehicles.page.html',
  styleUrl: './vehicles.page.scss'
})
export class VehiclesPage implements OnInit, OnDestroy {
  private static readonly IMPORT_POLL_START_DELAY_MS = 3000;
  readonly store = inject(VehiclesStore);
  readonly importStatus = signal<ImportStatusResponse | null>(null);
  readonly importPolling = signal(false);
  private readonly vehicleService = inject(VehicleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private importStatusSubscription: Subscription | null = null;
  private pollStartTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private uploadCompleted = false;
  private importFlowFinished = false;
  private pendingTerminalStatus: ImportStatusResponse | null = null;

  ngOnInit(): void {
    this.store.loadVehicles();
  }

  ngOnDestroy(): void {
    this.stopImportPolling();
  }

  setPageSize(value: unknown) {
    const size = Number(value);
    if (Number.isFinite(size)) {
      this.store.setPageSize(size);
    }
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

  openImportCsvModal() {
    this.dialog
      .open(VehicleUploadCsvModalComponent, { width: '560px' })
      .afterClosed()
      .pipe(filter((file): file is File => !!file))
      .subscribe({
        next: (file) => {
          this.startCsvImportFlow(file);
        },
        error: () => {
          this.stopImportPolling();
        }
      });
  }

  private startCsvImportFlow(file: File) {
    this.stopImportPolling();
    this.prepareImportUiState();
    this.schedulePollingStart();
    this.sendCsvFile(file);
  }

  private prepareImportUiState() {
    this.uploadCompleted = false;
    this.importFlowFinished = false;
    this.pendingTerminalStatus = null;
    this.importPolling.set(true);
    this.importStatus.set({
      status: 'processing',
      successCount: this.importStatus()?.successCount ?? 0,
      failureCount: this.importStatus()?.failureCount ?? 0,
      day: this.importStatus()?.day ?? new Date().toISOString().slice(0, 10)
    });
  }

  private schedulePollingStart() {
    if (this.pollStartTimeoutId) {
      clearTimeout(this.pollStartTimeoutId);
    }
    this.pollStartTimeoutId = setTimeout(() => {
      this.startImportPolling();
      this.pollStartTimeoutId = null;
    }, VehiclesPage.IMPORT_POLL_START_DELAY_MS);
  }

  private sendCsvFile(file: File) {
    this.vehicleService.uploadCsv(file).subscribe({
      next: (result: UploadCsvResult) => this.handleUploadSuccess(result),
      error: () => this.finishImportFlow()
    });
  }

  private handleUploadSuccess(result: UploadCsvResult) {
    this.uploadCompleted = true;
    this.snackBar.open(
      `Importação iniciada. Enfileirados: ${result.queuedCount}. Rejeitados: ${result.rejectedRowCount}.`,
      'Fechar',
      { duration: 3500 }
    );
    if (this.pendingTerminalStatus) {
      this.finishImportFlow(this.pendingTerminalStatus);
    }
  }

  private startImportPolling() {
    this.importStatusSubscription?.unsubscribe();
    this.importStatusSubscription = null;
    this.importPolling.set(true);
    this.importStatusSubscription = this.vehicleService.pollImportStatus().subscribe({
      next: (status) => {
        this.importStatus.set(status);

        if (status.status === 'processing') {
          return;
        }

        if (status.status === 'completed') {
          this.finishImportFlow(status);
          return;
        }

        if (this.uploadCompleted) {
          this.finishImportFlow(status);
          return;
        }

        this.pendingTerminalStatus = status;
      },
      error: () => {
        this.finishImportFlow();
      }
    });
  }

  private finishImportFlow(status?: ImportStatusResponse) {
    if (status) {
      this.importStatus.set(status);
    }
    if (this.importFlowFinished) {
      return;
    }
    this.importFlowFinished = true;
    this.stopImportPolling();
    this.store.loadVehicles();
  }

  private stopImportPolling() {
    if (this.pollStartTimeoutId) {
      clearTimeout(this.pollStartTimeoutId);
      this.pollStartTimeoutId = null;
    }
    this.importStatusSubscription?.unsubscribe();
    this.importStatusSubscription = null;
    this.importPolling.set(false);
    this.uploadCompleted = false;
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
