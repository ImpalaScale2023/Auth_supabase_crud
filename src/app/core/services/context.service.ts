import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private empresaId?: string;
  private sucursalId?: string;

  constructor() {
    this.loadFromStorage();
  }

  // Guardar contexto seleccionado
  setContext(empresaId: string, sucursalId: string) {
    this.empresaId = empresaId;
    this.sucursalId = sucursalId;
    localStorage.setItem('contexto', JSON.stringify({ empresaId, sucursalId }));
  }

  // Cargar del localStorage (ej. al recargar página)
  loadFromStorage() {
    const ctx = localStorage.getItem('contexto');
    if (ctx) {
      const { empresaId, sucursalId } = JSON.parse(ctx);
      this.empresaId = empresaId;
      this.sucursalId = sucursalId;
    }
  }

  getEmpresaId(): string | undefined {
    return this.empresaId;
  }

  getSucursalId(): string | undefined {
    return this.sucursalId;
  }

  clearContext() {
    this.empresaId = undefined;
    this.sucursalId = undefined;
    localStorage.removeItem('contexto');
  }
}
