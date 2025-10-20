import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AppUser, UserMembership, MembershipRole, Role, UserRoleView } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private supabase: SupabaseService) {}

  async getUsers(): Promise<AppUser[]> {
    const { data, error } = await this.supabase.client
      .from('app_users')
      .select('*')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('display_name');

    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string): Promise<AppUser | null> {
    const { data, error } = await this.supabase.client
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
    const { data, error } = await this.supabase.client
      .from('app_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('app_users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Memberships
  async getUserMemberships(userId: string): Promise<UserMembership[]> {
    const { data, error } = await this.supabase.client
      .from('user_memberships')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async createMembership(membership: Partial<UserMembership>): Promise<UserMembership> {
    const { data, error } = await this.supabase.client
      .from('user_memberships')
      .insert(membership)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMembership(id: string, updates: Partial<UserMembership>): Promise<UserMembership> {
    const { data, error } = await this.supabase.client
      .from('user_memberships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMembership(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('user_memberships')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    const { data, error } = await this.supabase.client
      .from('roles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getMembershipRoles(membershipId: string): Promise<MembershipRole[]> {
    const { data, error } = await this.supabase.client
      .from('membership_roles')
      .select('*')
      .eq('membership_id', membershipId)
      .is('revoked_at', null);

    if (error) throw error;
    return data || [];
  }

  async assignRole(membershipId: string, roleId: string, grantedBy?: string): Promise<MembershipRole> {
    const { data, error } = await this.supabase.client
      .from('membership_roles')
      .insert({
        membership_id: membershipId,
        role_id: roleId,
        granted_by: grantedBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async revokeRole(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('membership_roles')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async getUserRoles(userId: string): Promise<UserRoleView[]> {
    const { data, error } = await this.supabase.client
      .from('vw_user_roles')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null);

    if (error) throw error;
    return data || [];
  }
}
