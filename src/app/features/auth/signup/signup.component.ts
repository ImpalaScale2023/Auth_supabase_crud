import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

interface SignUpForm {
  email: FormControl<null|string>,
  password: FormControl<null|string>,
  confirmPassword: FormControl<null|string>,
  displayName: FormControl<null|string>,
  diplayLastName: FormControl<null|string>,
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule  ],
  templateUrl: './signup.component.html'
})

export class SignupComponent {
    
  //email = '';
  //password = '';
  //confirmPassword = signal<string>('');
  //displayName = '';
  //diplayLastName = '';
  loading = signal<boolean>(false);
  error = signal<string>('');
  showPassword =  signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  passwordErrors: string[] = [];

  private _formBuilder = inject(FormBuilder);
  private _autService =  inject(AuthService);
  // constructor(
  //   private authService: AuthService,
  //   private router: Router
  // ) {}
  signForm = this._formBuilder.group<SignUpForm>({
      email: this._formBuilder.control(null, [
        Validators.required, Validators.email
      ]),
      password: this._formBuilder.control(null, [
        Validators.required,
      ]),
      displayName: this._formBuilder.control(null, [
        Validators.required,
      ]),
      diplayLastName: this._formBuilder.control(null, [
        Validators.required,
      ]),
      confirmPassword: this._formBuilder.control(null, [
        Validators.required,
      ]), 

  });

  validatePasswordStrength() {
    if (!this.signForm.value.password) {
      this.passwordErrors = [];
      return;
    }

    const validation = this._autService.validatePassword(this.signForm.value.password);
    this.passwordErrors = validation.errors;
  }

  async onSubmit() {
    //if (!this.email || !this.password || !this.displayName) {
    if (this.signForm.invalid) {
      this.error.set('Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.signForm.value.password !== this.signForm.value.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    const validation = this._autService.validatePassword(this.signForm.value.password!);
    if (!validation.valid) {
      this.error.set('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this._autService.signUp({
        email: this.signForm.value.email!,
        password: this.signForm.value.password!,
        displayName: this.signForm.value.displayName!,
        displayLastName: this.signForm.value.diplayLastName!,
        //phone: this.phone || undefined
      });
    } catch (err: any) {
      this.error.set( err.message || 'Error al registrar usuario');
    } finally {
      this.loading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
