import { Component } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { ContextInterceptor } from './core/interceptors/context.interceptor';
import { AppNavComponent } from './shared/components/nav/nav.component';
import { AppHeaderComponent } from "./shared/components/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNavComponent, AppHeaderComponent],
  templateUrl: './app.component.html',
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ContextInterceptor,
      multi: true
    }
  ],
})
export class AppComponent {}
