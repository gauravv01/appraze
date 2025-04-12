import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Mail, UserPlus, Check, X, AlertCircle, Search, Trash, Edit, Loader } from 'lucide-react';
import { sendTeamInviteEmail } from '../lib/sendgrid';
import { 
  fetchTeamMembers, 
  inviteTeamMember, 
  resendInvitation as resendTeamInvitation, 
  cancelInvitation,
  removeTeamMember,
  getCurrentUserProfile,
  type TeamMember
} from '../lib/teamService';

interface InviteFormData {
  email: string;
  name: string;
  role: 'admin' | 'member';
}

// Define error type for better error handling
interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export default function TeamMembers() {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteFormData, setInviteFormData] = useState<InviteFormData>({
    email: '',
    name: '',
    role: 'member'
  });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ 
    id: string; 
    email: string; 
    name: string | null; 
    role: 'admin' | 'member';
    organization_id: string;
  } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTeamMembers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // loadTeamMembers is defined within the component and only depends on state variables

  useEffect(() => {
    // Set a timeout to stop loading if it takes too long
    // This prevents infinite loading states
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Loading timed out. Please try refreshing the page.');
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  const fetchCurrentUser = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setCurrentUser(profile);
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Don't show loading state if we failed to get current user
      setIsLoading(false);
      setError('Failed to fetch user data. Please try refreshing the page.');
    }
  };

  const loadTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const teamMembers = await fetchTeamMembers();
      
      // Include current user if they're not in the team_members table yet
      const isCurrentUserIncluded = teamMembers.some(
        member => currentUser && member.email === currentUser.email
      );
      
      if (currentUser && !isCurrentUserIncluded) {
        // Add current user to the members list
        const currentUserAsMember: TeamMember = {
          id: currentUser.id,
          organization_id: currentUser.organization_id,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setMembers([currentUserAsMember, ...teamMembers]);
      } else {
        setMembers(teamMembers);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      // Don't show error if it's just that no members exist yet
      if (currentUser) {
        // Add current user to members if we have their info
        const currentUserAsMember: TeamMember = {
          id: currentUser.id,
          organization_id: currentUser.organization_id,
          email: currentUser.email,
          name: currentUser.name,
          role: 'admin', // Default to admin for the creator
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setMembers([currentUserAsMember]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteFormData.email || !inviteFormData.name) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsInviting(true);
    setError(null);
    
    try {
      if (!currentUser) {
        throw new Error('Missing user information');
      }

      // Create the team member using the service
      const newMember = await inviteTeamMember(
        inviteFormData.email,
        inviteFormData.name,
        inviteFormData.role
      );
      
      // Send the invitation email
      const inviteUrl = `${window.location.origin}/invite?token=${newMember.invite_token}`;
      
      await sendTeamInviteEmail(
        inviteFormData.email,
        inviteFormData.name,
        currentUser.email,
        currentUser.name || 'A team member',
        inviteUrl
      );
      
      // Update UI
      setMembers(prev => [newMember, ...prev]);
      
      setInviteSuccess(true);
      setInviteFormData({
        email: '',
        name: '',
        role: 'member'
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInviteForm(false);
      }, 3000);
      
    } catch (err: unknown) {
      console.error('Error inviting team member:', err);
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (member: TeamMember) => {
    if (member.status !== 'invited') return;
    
    try {
      await resendTeamInvitation(member.id);
      
      // Get user info to send email
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Generate invite URL (in real app, you'd get this from the backend)
      const inviteUrl = `${window.location.origin}/invite?token=${member.invite_token || crypto.randomUUID()}`;
      
      // Send the invitation email
      await sendTeamInviteEmail(
        member.email,
        member.name || member.email,
        currentUser.email,
        currentUser.name || 'A team member',
        inviteUrl
      );
      
      setError(null);
      alert('Invitation resent successfully');
      
    } catch (err: unknown) {
      console.error('Error resending invitation:', err);
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to resend invitation. Please try again.');
    }
  };

  const handleCancelInvite = async (memberId: string) => {
    try {
      await cancelInvitation(memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
      setError(null);
    } catch (err: unknown) {
      console.error('Error canceling invitation:', err);
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to cancel invitation. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string, memberRole: string) => {
    // Only admins can remove members, and admins cannot remove other admins
    if (currentUser?.role !== 'admin') {
      setError('You do not have permission to remove team members.');
      return;
    }
    
    if (memberRole === 'admin' && currentUser.role === 'admin') {
      setError('You cannot remove other administrators.');
      return;
    }
    
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await removeTeamMember(memberId);
      
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, status: 'inactive' } : member
      ));
      
      setError(null);
      
    } catch (err: unknown) {
      console.error('Error removing team member:', err);
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to remove team member. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter members based on search term
  const filteredMembers = members.filter((member: TeamMember) => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current user is admin for permissions
  const isAdmin = currentUser?.role === 'admin';

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h1>
          <p className="text-gray-600">Manage your team and invite new members to collaborate</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Team Member
          </button>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-white rounded-lg border p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Invite New Team Member</h2>
              <button onClick={() => setShowInviteForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {inviteSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <span>Invitation sent successfully!</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="colleague@example.com"
                  value={inviteFormData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Smith"
                  value={inviteFormData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={inviteFormData.role}
                  onChange={handleInputChange}
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {isInviting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error State */}
        {error && !showInviteForm && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Team Members Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Users className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-6">Invite your colleagues to collaborate with you</p>
            <button 
              onClick={() => setShowInviteForm(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite your first team member
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name & Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member: TeamMember) => (
                    <tr key={member.id} className={member.status === 'inactive' ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name || 'No name'}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                            {member.email === currentUser?.email && (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.status === 'active' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : member.status === 'invited' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Invited
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {member.status === 'invited' ? (
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleResendInvite(member)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Resend Invitation"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleCancelInvite(member.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Invitation"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : member.status === 'active' ? (
                          <div className="flex justify-end space-x-2">
                            {/* Only show edit/remove for admin users, and don't allow removing other admins */}
                            {isAdmin && member.email !== currentUser?.email && (
                              <>
                                <button 
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Edit Member"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {member.role !== 'admin' && (
                                  <button 
                                    onClick={() => handleRemoveMember(member.id, member.role)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Remove Member"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">No actions</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 