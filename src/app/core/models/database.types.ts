export interface Company {
  id: string;
  name: string;
  identifier?: string;
  logo_url?: string;
  description: string;
  email: string;
  phone: string;
  metadata?: any;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  address?: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions?: any[];
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  auth_id?: string;
  email?: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  company_id: string;
  branch_id?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MembershipRole {
  id: string;
  membership_id: string;
  role_id: string;
  granted_by?: string;
  granted_at: string;
  revoked_at?: string;
}

export interface UserRoleView {
  user_id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  company_id: string;
  company_name?: string;
  company_logo?: string;
  branch_id?: string;
  branch_name?: string;
  role_id: string;
  role_name: string;
  role_slug: string;
  granted_at: string;
  revoked_at?: string;
}
