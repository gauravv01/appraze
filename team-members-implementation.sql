-- Team Members Implementation for PerformAI
-- This script adds the necessary tables, functions, and policies for the team members feature

-- =====================
-- Update existing tables
-- =====================

-- Add organization_id to profiles table
ALTER TABLE profiles ADD COLUMN organization_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'admin';

-- Create index for organization lookup
CREATE INDEX idx_profiles_organization ON profiles(organization_id);

-- =====================
-- Create new tables
-- =====================

-- Create the team_members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  status TEXT NOT NULL DEFAULT 'invited', -- 'active', 'invited', or 'inactive'
  invite_token UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Connected after invitation acceptance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Create indexes for team_members table
CREATE INDEX idx_team_members_organization ON team_members(organization_id);
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_invite_token ON team_members(invite_token);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- =====================
-- Create RLS policies
-- =====================

-- Team members access policies
CREATE POLICY "Team members are visible to users in the same organization"
  ON team_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Allow admins to manage team members in their organization
CREATE POLICY "Admins can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND organization_id = organization_id
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update team members in their organization"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND organization_id = team_members.organization_id
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete team members in their organization"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND organization_id = team_members.organization_id
      AND role = 'admin'
    )
  );

-- =====================
-- Create functions
-- =====================

-- Function to process a team invitation acceptance
CREATE OR REPLACE FUNCTION process_team_invitation(token UUID)
RETURNS JSON AS $$
DECLARE
  invitation RECORD;
  current_user_id UUID;
  current_email TEXT;
  result JSON;
BEGIN
  -- Get the current user
  SELECT auth.uid() INTO current_user_id;
  
  -- Get the current user's email
  SELECT email INTO current_email FROM auth.users WHERE id = current_user_id;
  
  -- Get the invitation details
  SELECT * INTO invitation FROM team_members 
  WHERE invite_token = token AND status = 'invited';
  
  IF invitation IS NULL THEN
    -- Invitation not found or already used
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Invitation not found or already accepted'
    );
  END IF;
  
  -- Check if emails match (optional, can be removed for flexibility)
  IF invitation.email != current_email THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'This invitation was sent to a different email address'
    );
  END IF;
  
  -- Update the team member record
  UPDATE team_members SET
    user_id = current_user_id,
    status = 'active',
    invite_token = NULL,
    updated_at = NOW()
  WHERE id = invitation.id;
  
  -- Ensure the user's profile has the correct organization_id
  UPDATE profiles SET
    organization_id = invitation.organization_id,
    role = invitation.role,
    updated_at = NOW()
  WHERE id = current_user_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Invitation accepted successfully',
    'organizationId', invitation.organization_id,
    'role', invitation.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is part of an organization
CREATE OR REPLACE FUNCTION is_organization_member(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_org_id UUID;
BEGIN
  -- Get the user's organization ID
  SELECT organization_id INTO user_org_id 
  FROM profiles 
  WHERE id = auth.uid();
  
  -- Check if the IDs match
  RETURN user_org_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- Create triggers
-- =====================

-- Trigger to update timestamp on team_members table
CREATE TRIGGER update_team_members_timestamp
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp(); 