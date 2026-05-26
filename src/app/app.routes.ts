import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./views/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'inventory',
    loadComponent: () => import('./views/inventory/inventory').then(m => m.InventoryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'loans',
    loadComponent: () => import('./views/loans/loans').then(m => m.LoansComponent),
    canActivate: [authGuard],
  },
  {
    path: 'neighbors',
    loadComponent: () => import('./views/neighbors/neighbors').then(m => m.NeighborsComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
