import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { AuthService } from '../services/auth.service';
import { AuthChangeEvent } from '@supabase/supabase-js';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.currentUser) {
    return true;
  }

  router.navigate(['/auth/signin']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

   
  if (!supabase.currentUser) {
    return true;
  }

  //router.navigate(['/dashboard']);
  return false;
};

export const recoveryAuthGuard: CanActivateFn = async (route, state) => {

  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // Return a promise that resolves to a boolean
  return new Promise<boolean>((resolve) => {
    // Listen for auth state changes
    const { data: { subscription } } = supabaseService.supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        // Nos desuscribimos inmediatamente después de la primera comprobación
        if (subscription) {
          subscription.unsubscribe();
        }
        // Check if the event indicates password recovery
        if (event === 'PASSWORD_RECOVERY' && session) {
          resolve(true); // Allow access
        } else {
          // Redirect to login or home if not in the password recovery state
          router.navigate(['/auth/sigin']);
          resolve(false); // Deny access
        }
      }
    );
  });
};