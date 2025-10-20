import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

interface updatePassForm {
  newPassword: FormControl<null|string>,
  confirmPassword: FormControl<null|string>,
}

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './reset.component.html'
})
export class ResetComponent {
  // newPassword = '';
  // confirmPassword = '';
  successMsg = '';
  errorMsg = signal('');
  showPassword =  signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  loading = false;
  passwordErrors: string[] = [];

  private _formBuilder = inject(FormBuilder);
  private _autService =  inject(AuthService);

  updateForm = this._formBuilder.group<updatePassForm>({
        newPassword: this._formBuilder.control(null, [
          Validators.required,
        ]),
        confirmPassword: this._formBuilder.control(null, [
          Validators.required,
        ]), 
    });

  async updatePassword(){
    if (this.updateForm.invalid) {
      this.errorMsg.set('Por favor complete todos los campos obligatorios');
      return;
    }

     if (this.updateForm.value.newPassword !== this.updateForm.value.confirmPassword) {
      this.errorMsg.set('Las contraseñas no coinciden');
      return;
    }

    const validation = this._autService.validatePassword(this.updateForm.value.confirmPassword!);
    if (!validation.valid) {
      this.errorMsg.set('La contraseña no cumple con los requisitos de seguridad');
      return;
    }
    console.log(this.updateForm.value.newPassword);

    try {
      this.loading = true;
      await this._autService.updatePassword(this.updateForm.value.newPassword!);
      this.successMsg = 'Tu contraseña se actualizó correctamente.';
    } catch (error: any) {
      this.errorMsg = error.message;
    } finally {
      this.loading = false;
      this.errorMsg.set('');
    }
  }

  validatePasswordStrength() {
    if (!this.updateForm.value.newPassword) {
      this.passwordErrors = [];
      return;
    }

    const validation = this._autService.validatePassword(this.updateForm.value.newPassword);
    this.passwordErrors = validation.errors;
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
