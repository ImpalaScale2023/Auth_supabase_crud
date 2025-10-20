import { Routes } from '@angular/router';
import { authGuard, guestGuard, recoveryAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'signin',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/signin/signin.component').then(m => m.SigninComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'reset-password',
        canActivate:[recoveryAuthGuard],
        loadComponent: () => import('./features/auth/reset/reset.component').then(m => m.ResetComponent)
      },
      {
        path:'**',
        redirectTo:'/signin'
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'companies',
    canActivate: [authGuard],
    loadComponent: () => import('./features/companies/companies.component').then(m => m.CompaniesComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: '**',
    redirectTo: '/auth/signin'
  }
];
