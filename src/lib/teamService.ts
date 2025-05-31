import { supabase } from './supabase';
import { APIClient, APIError } from './api-client';

// Define interfaces
export interface Team {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  organization_id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'inactive';
  user_id?: string;
  invite_token?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  invite_token: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch team members for the current user's organization
 */

export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    // Step 1: Get current authenticated user
    const userId=localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Not authenticated');
    }


    // Step 2: Fetch user profile (to get organization_id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return [];
    }

    let organizationId = profile?.organization_id;

    // Step 3: Create organization if not exists
    if (!organizationId) {
      organizationId = crypto?.randomUUID?.() ?? self.crypto.randomUUID();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          organization_id: organizationId,
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to assign new organization:', updateError);
        return [];
      }

      // Nothing else to fetch, this user is the first
      return [];
    }

    // Step 4: Fetch team members in the organization
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (membersError) {
      console.error('Failed to fetch team members:', membersError);
      return [];
    }

    return members || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
};


/**
 * Invite a new team member
 */
export const inviteTeamMember = async (
  email: string, 
  name: string, 
  role: 'admin' | 'member'
): Promise<TeamMember> => {
  try {
    // Get the current user's organization
    const userId=localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile?.organization_id) {
      throw new Error('No organization found');
    }

    // Check if the current user is an admin
    // if (profile.role !== 'admin') {
    //   throw new Error('Only admins can invite team members');
    // }

    // Check if this email is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('email', email)
      .eq('organization_id', profile.organization_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the code for "no rows returned"
      throw checkError;
    }

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new Error('This user is already a team member');
      } else if (existingMember.status === 'invited') {
        throw new Error('This email has already been invited');
      }
    }

    // Generate a unique invite token
    const inviteToken = crypto.randomUUID();

    // Create the team member record
    const { data: newMember, error: createError } = await supabase
      .from('team_members')
      .insert([
        {
          email,
          name,
          role,
          status: 'invited',
          organization_id: profile.organization_id,
          invite_token: inviteToken
        }
      ])
      .select()
      .single();

    if (createError) throw createError;
    if (!newMember) throw new Error('Failed to create team member');
    
    return newMember;
  } catch (error) {
    console.error('Error inviting team member:', error);
    throw error;
  }
};

/**
 * Resend an invitation to a team member
 */
export const resendInvitation = async (memberId: string): Promise<void> => {
  try {
    // Generate a new invite token
    const inviteToken = crypto.randomUUID();
    
    // Update the invite token
    const { error } = await supabase
      .from('team_members')
      .update({ invite_token: inviteToken, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('status', 'invited')
      .select()
      .maybeSingle();

    if (error) throw error;
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
};

/**
 * Cancel an invitation
 */
export const cancelInvitation = async (memberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('status', 'invited');

    if (error) throw error;
  } catch (error) {
    console.error('Error canceling invitation:', error);
    throw error;
  }
};

/**
 * Remove a team member (mark as inactive)
 */
export const removeTeamMember = async (memberId: string): Promise<void> => {
  try {
    // Get current user to check permissions
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user?.id) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.role !== 'admin') {
      throw new Error('Only admins can remove team members');
    }

    // Update the team member status to inactive
    const { error } = await supabase
      .from('team_members')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing team member:', error);
    throw error;
  }
};

/**
 * Accept a team invitation
 */
export const acceptInvitation = async (token: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .rpc('process_team_invitation', { token });

    if (error) throw error;
    return {
      success: true,
      message: 'Invitation accepted successfully'
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to accept invitation'
    };
  }
};

/**
 * Get the current user's profile including organization and role
 */
export const getCurrentUserProfile = async (): Promise<{
  id: string;
  email: string;
  name: string | null;
  organization_id: string;
  role: 'admin' | 'member';
}> => {
  try {
    const userId=localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id,  name, organization_id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    
    // If organization_id is missing, create one for this user
    return {
      id: profile?.id || '',
      email: profile?.email || '',
      name: profile?.name || null,
      organization_id: profile?.organization_id || '',
      role: (profile?.role as 'admin' | 'member') || 'member'
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Check if the current user is an admin
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export class TeamService extends APIClient {
  // Create a new team
  static async createTeam(name: string, userId: string): Promise<Team> {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name, slug }])
        .select()
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Failed to create team');
      
      await supabase
        .from('team_members')
        .insert([{ 
          team_id: data.id, 
          user_id: userId,
          role: 'owner'
        }]);
        
      return data;
    } catch (error) {
      return super.handleError(error);
    }
  }

  // Get team details
  static async getTeam(teamId: string): Promise<Team> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            id,
            role,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('id', teamId)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Team not found');
      
      return data;
    } catch (error) {
      return super.handleError(error);
    }
  }

  // Update team
  static async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Failed to update team');
      
      return data;
    } catch (error) {
      return super.handleError(error);
    }
  }

  // Invite member
  static async inviteMember(teamId: string, email: string, role: string): Promise<TeamInvitation> {
    try {
      const inviteToken = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('team_invitations')
        .insert([{
          team_id: teamId,
          email,
          role,
          invite_token: inviteToken,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Failed to create invitation');
      
      return data;
    } catch (error) {
      return super.handleError(error);
    }
  }

  // Accept invitation
  static async acceptInvitation(invitationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .select()
        .eq('id', invitationId)
        .single();

      if (inviteError) throw inviteError;
      if (!invitation) {
        return { success: false, message: 'Invitation not found' };
      }

      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: invitation.team_id,
          user_id: userId,
          role: invitation.role
        }]);

      if (memberError) throw memberError;

      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      return { success: true, message: 'Invitation accepted successfully' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to accept invitation'
      };
    }
  }

  // Get current user's team memberships
  static async getCurrentUserTeams(): Promise<Team[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .select('*, team_members!inner(*)')
        .eq('team_members.user_id', user.id);

      if (error) throw error;
      return (data || []) as Team[];
    } catch (error) {
      return super.handleError(error);
    }
  }
} 