// context.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextService } from '../services/context.service';


@Injectable()
export class ContextInterceptor implements HttpInterceptor {
  constructor(private context: ContextService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const empresaId = this.context.getEmpresaId();
    const sucursalId = this.context.getSucursalId();

    if (empresaId && sucursalId) {
      const cloned = req.clone({
        setHeaders: {
          'X-Empresa-ID': empresaId,
          'X-Sucursal-ID': sucursalId,
        },
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
