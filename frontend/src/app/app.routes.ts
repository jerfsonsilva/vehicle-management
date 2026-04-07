import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/vehicles/pages/vehicles.page').then(
        (m) => m.VehiclesPage
      )
  },
  { path: '**', redirectTo: '' }
];
