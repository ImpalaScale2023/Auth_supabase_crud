import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
            <p class="text-textSecondary">Administra usuarios, membresías y roles</p>
          </div>
          <button (click)="goBack()" class="btn btn-outline">
            ← Volver al Dashboard
          </button>
        </div>
        
        <div class="card text-center py-12">
          <svg class="w-16 h-16 text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <h2 class="text-xl font-bold mb-2">Módulo de Usuarios</h2>
          <p class="text-textSecondary">Funcionalidad en desarrollo</p>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {
  constructor(private router: Router) {}
  
  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
