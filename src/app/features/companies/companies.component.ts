import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2">Gestión de Empresas</h1>
            <p class="text-textSecondary">Administra empresas y sucursales</p>
          </div>
          <button (click)="goBack()" class="btn btn-outline">
            ← Volver al Dashboard
          </button>
        </div>
        
        <div class="card text-center py-12">
          <svg class="w-16 h-16 text-primary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h2 class="text-xl font-bold mb-2">Módulo de Empresas</h2>
          <p class="text-textSecondary">Funcionalidad en desarrollo</p>
        </div>
      </div>
    </div>
  `
})
export class CompaniesComponent {
  constructor(private router: Router) {}
  
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
