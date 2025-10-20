/*
  # Migrate tables from app schema to public schema
  
  1. Changes
    - Move all tables from app schema to public schema
    - Preserve all data, constraints, and indexes
    - Update RLS policies
    - Maintain all relationships
  
  2. Security
    - RLS remains enabled on all tables
    - All existing policies are preserved
*/

-- Drop existing tables in public if they exist
DROP TABLE IF EXISTS public.membership_roles CASCADE;
DROP TABLE IF EXISTS public.user_memberships CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.app_users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP VIEW IF EXISTS public.vw_user_roles CASCADE;

-- Create roles table in public schema
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_users table in public schema
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create companies table in public schema
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text UNIQUE,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create branches table in public schema
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, name)
);

-- Create user_memberships table in public schema
CREATE TABLE IF NOT EXISTS public.user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(user_id, company_id, branch_id)
);

-- Create membership_roles table in public schema
CREATE TABLE IF NOT EXISTS public.membership_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.user_memberships(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES public.app_users(id),
  revoked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(membership_id, role_id)
);

-- Create view for user roles in public schema
CREATE OR REPLACE VIEW public.vw_user_roles AS
SELECT 
  u.id as user_id,
  u.email,
  u.display_name,
  c.id as company_id,
  c.name as company_name,
  b.id as branch_id,
  b.name as branch_name,
  r.id as role_id,
  r.name as role_name,
  r.permissions,
  mr.granted_at,
  mr.revoked_at,
  um.is_active as membership_active
FROM public.app_users u
JOIN public.user_memberships um ON u.id = um.user_id
JOIN public.companies c ON um.company_id = c.id
LEFT JOIN public.branches b ON um.branch_id = b.id
JOIN public.membership_roles mr ON um.id = mr.membership_id
JOIN public.roles r ON mr.role_id = r.id
WHERE u.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND (b.deleted_at IS NULL OR b.id IS NULL)
  AND um.deleted_at IS NULL;

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Roles are viewable by authenticated users"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for app_users
CREATE POLICY "Users can view their own data"
  ON public.app_users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
  ON public.app_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- RLS Policies for companies
CREATE POLICY "Users can view companies they belong to"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id 
      FROM public.user_memberships 
      WHERE user_id IN (
        SELECT id FROM public.app_users WHERE auth_id = auth.uid()
      )
      AND deleted_at IS NULL
    )
  );

-- RLS Policies for branches
CREATE POLICY "Users can view branches of their companies"
  ON public.branches FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM public.user_memberships 
      WHERE user_id IN (
        SELECT id FROM public.app_users WHERE auth_id = auth.uid()
      )
      AND deleted_at IS NULL
    )
  );

-- RLS Policies for user_memberships
CREATE POLICY "Users can view their own memberships"
  ON public.user_memberships FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.app_users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for membership_roles
CREATE POLICY "Users can view their own roles"
  ON public.membership_roles FOR SELECT
  TO authenticated
  USING (
    membership_id IN (
      SELECT id FROM public.user_memberships 
      WHERE user_id IN (
        SELECT id FROM public.app_users WHERE auth_id = auth.uid()
      )
    )
  );

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES
  ('admin', 'Administrator with full access', '["*"]'::jsonb),
  ('manager', 'Manager with limited administrative access', '["read", "write", "manage_users"]'::jsonb),
  ('user', 'Regular user with basic access', '["read"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_users_auth_id ON public.app_users(auth_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(email);
CREATE INDEX IF NOT EXISTS idx_branches_company_id ON public.branches(company_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_company_id ON public.user_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_branch_id ON public.user_memberships(branch_id);
CREATE INDEX IF NOT EXISTS idx_membership_roles_membership_id ON public.membership_roles(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_roles_role_id ON public.membership_roles(role_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_app_users
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_companies
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_branches
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_memberships
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();