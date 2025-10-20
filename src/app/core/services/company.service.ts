import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Company, Branch } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
   private _supabaseClient =  inject(SupabaseService);

  constructor() {}

  async getCompanies(): Promise<Company[]> {
    
    if (!this._supabaseClient.isAuthenticated()) return[];
    
    const { data, error } = await this._supabaseClient.client
      .from('companies')
      .select('*')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getCompanyById(id: string): Promise<Company | null> {
    const { data, error } = await this._supabaseClient.client
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const { data, error } = await this._supabaseClient.client
      .from('companies')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await this._supabaseClient.client
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompany(id: string): Promise<void> {
    const { error } = await this._supabaseClient.client
      .from('companies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async getBranchesByCompany(companyId: string): Promise<Branch[]> {
    const { data, error } = await this._supabaseClient.client
      .from('branches')
      .select('*')
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createBranch(branch: Partial<Branch>): Promise<Branch> {
    const { data, error } = await this._supabaseClient.client
      .from('branches')
      .insert(branch)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch> {
    const { data, error } = await this._supabaseClient.client
      .from('branches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBranch(id: string): Promise<void> {
    const { error } = await this._supabaseClient.client
      .from('branches')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
