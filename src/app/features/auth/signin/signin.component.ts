import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { setTimeout } from 'timers/promises';

interface ResetForm {
  resetEmail: FormControl<null|string>
}

interface SignInForm {
  email: FormControl<null|string>,
  password: FormControl<null|string>
}

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule  ],
  templateUrl: './signin.component.html'
})
export class SigninComponent {

  //email = '';
  //password = '';
  loading = false;
  error = '';
  showPassword = false;

  // Modal variables
  showResetModal = false;
  //resetEmail = '';
  loadingReset = false;
  resetSuccess = '';
  resetError = '';

  // constructor(
  //   private authService: AuthService,
  //   private router: Router
  // ) {}
  private _formBuilder = inject(FormBuilder);
  private _autService =  inject(AuthService);
  //private _router = inject(Router);

  resetForm = this._formBuilder.group<ResetForm>({
        resetEmail: this._formBuilder.control(null, [
          Validators.required, Validators.email
        ]), 
    });

  signForm = this._formBuilder.group<SignInForm>({
        email: this._formBuilder.control(null, [
          Validators.required, Validators.email
        ]),
        password: this._formBuilder.control(null, [
          Validators.required,
        ]) 
      });  

  async onSubmit() {
    if (!this.signForm.value.email || !this.signForm.value.password) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this._autService.signIn(this.signForm.value.email, this.signForm.value.password);
    } catch (err: any) {
      this.error = err.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
      
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openResetModal(){
      this.showResetModal = true;
  }

  closeResetModal() {
    this.showResetModal = false;
    this.resetForm.value.resetEmail = '';
    this.resetError = '';
    this.resetSuccess = '';
  }

  async sendResetLink() {

    if (this.resetForm.invalid) {
      this.resetError= 'Por favor ingresar Correo';
      return;
    }

    this.loadingReset = true;
    this.resetError = '';
    this.resetSuccess = '';

    try {
      await this._autService.sendResetPasswordEmail(this.resetForm.value.resetEmail!);
      this.resetSuccess = 'Se ha enviado un enlace de recuperación a tu correo.';
    } catch (err: any) {
      this.resetError = err.message;
    } finally {
      this.loadingReset = false;
      //this._router.navigateByUrl('/signin'); //al path inicial
      
      
    }
  }
}
