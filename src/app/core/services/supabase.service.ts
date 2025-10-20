import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
 //public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  //private recoveryKey = 'supabase_recovery_mode';
  //private readyResolver!: (v: void) => void;
  //1private readyPromise: Promise<void>;

  constructor() {
    // Create client without schema configuration to avoid TypeScript errors
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    // promesa que se resuelve cuando el primer evento llega
    //this.readyPromise = new Promise(res => (this.readyResolver = res));

    // Listen to auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
      // if (event === 'PASSWORD_RECOVERY') {
      //   console.log('🧩 Modo recuperación de contraseña activado',event);
      //   localStorage.setItem(this.recoveryKey, 'true');
      // }else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      //   console.log('🚪 Modo recuperación desactivado',event);
      //   localStorage.removeItem(this.recoveryKey);
      // }
      // 👇 resolvemos la promesa la primera vez que llegue cualquier evento
       // 👇 Resolver solo al recibir cualquier evento válido
    // if (this.readyResolver) {
    //   this.readyResolver();
    //   //this.readyResolver = ;
    // }
    });

    // Initialize current user
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
    
  }

  // Observa el estado de autenticación
  // onAuthStateChange(callback: (event: AuthChangeEvent, session: any) => void) {
  //   this.supabase.auth.onAuthStateChange(callback);
  // }

  //  isPasswordRecovery(): boolean {
  //    if (localStorage.getItem(this.recoveryKey) === 'true') {
  //       //localStorage.removeItem(this.recoveryKey);
  //       return true;
  //    };
  //    return false;
  //   }

  // // Esperar a que el servicio esté listo
  // async waitUntilReady(): Promise<void> {
  //   await this.readyPromise;
  // }  

  get client(): SupabaseClient {
    return this.supabase;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Auth methods
  async signUp(email: string, password: string, displayName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    //localStorage.removeItem(this.recoveryKey);
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    //localStorage.removeItem(this.recoveryKey);
    if (error) throw error;
  }

 
}
