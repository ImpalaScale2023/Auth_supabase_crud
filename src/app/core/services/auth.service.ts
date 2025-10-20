import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { AppUser } from '../models/database.types';
import { AuthChangeEvent, Session, } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  displayLastName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //private currentSession: Session | null = null;
  //private isRecoveryMode = false;
  //private recoveryKey = 'supabase_recovery_mode';

  private _supabaseClient =  inject(SupabaseService);
  private _router = inject(Router);

  constructor( ) {  }

   async session(){
        return await this._supabaseClient.client.auth.getSession();
    }
 

  async signUp(data: SignUpData): Promise<void> {
    try {
      // 1. Create auth user
      const authResult = await this._supabaseClient.signUp(
        data.email,
        data.password,
        data.displayName
      );

      if (!authResult.user) {
        throw new Error('Failed to create user');
      }

      // 2. Create app_user record (now in public schema)
      const { error: userError } = await this._supabaseClient.client
        .from('app_users')
        .insert({
          auth_id: authResult.user.id,
          email: data.email,
          display_name: data.displayName,
          display_lastname: data.displayLastName,
          //phone: data.phone,
          is_active: false
        });
      if (userError) throw userError;

      // Auto sign in after successful registration
      await this.signIn(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.message || 'Error during sign up');
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const ret = await this._supabaseClient.signIn(email, password);
      //console.log(ret); 
      this._router.navigateByUrl('/dashboard');
    } catch (error: any) {
      throw new Error(error.message || 'Error during sign in');
    }
  }

  async signOut(): Promise<void> {
    try {
      await this._supabaseClient.signOut();
      this._router.navigate(['/auth/signin']);
    } catch (error: any) {
      throw new Error(error.message || 'Error during sign out');
    }
  }

  async getCurrentAppUser(): Promise<AppUser | null> {
    const user = this._supabaseClient.currentUser;
    if (!user) return null;
    //console.log('CurrentUser', user);

    const { data, error } = await this._supabaseClient.client
      .from('app_users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  isAuthenticated(): boolean {
    return this._supabaseClient.currentUser !== null;
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

   // ✅ Enviar link para resetear contraseña
  async sendResetPasswordEmail(email: string){
    console.log(email);
    const redirectTo = `${window.location.origin}/auth/reset-password`; // La URL a la que volverá el usuario
    console.log(redirectTo);
    const resp = await this._supabaseClient.client.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });
    console.log(resp);
  }  


  // ✅ Cambiar contraseña (usando token del enlace)
  async updatePassword(newPassword: string) {
    const { data, error } = await this._supabaseClient.client.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  }
}
