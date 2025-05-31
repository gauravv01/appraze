import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Lock, Save, AlertCircle, Loader, CheckCircle } from 'lucide-react';
// @ts-ignore
import { getUserProfile, updateUserProfile } from '../../database-api.js';
// @ts-ignore
import { updatePassword, getCurrentUser } from '../../auth.js';
import { supabase } from '../lib/supabase.js';

interface ProfileData {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function Settings() {
  // Profile data state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<any>>({
    full_name: '',
    organization_name: ''
  });
  const [email, setEmail] = useState<string>('');
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Fetch user profile on page load
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user email
        const userId=localStorage.getItem('userId');
        if (!userId) {
          throw new Error('Not authenticated');
        }
        const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        if (profileError) throw profileError;
        if (profile && profile.email) {
          setEmail(profile.email);
        }
        
        // Get profile data
        
        if (profile) {
          setProfile(profile);
          setProfileForm({
            name: profile.name || '',
            organization_name: profile.organization_name || ''
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, []);

  // Handle profile form input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    // Clear any previous password errors when user starts typing again
    if (passwordError) setPasswordError(null);
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setError(null);
      const userId=localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Not authenticated');
      }
      await supabase
      .from('profiles')
      .update(profileForm)
      .eq('id', userId)
      .select()
      .maybeSingle();
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...profileForm } : null);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(false);
      
      // Use the updatePassword function from auth.js which now also sends an email notification
      await updatePassword(passwordForm.newPassword);
      
      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Failed to update password. Please check your current password and try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Profile Settings Form */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                {/* Company Name */}
                <div>
                  <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organization_name"
                    name="organization_name"
                    value={profileForm.organization_name || ''}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your organization name"
                  />
                </div>
                
                {/* Email (non-editable) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Your email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  {saveSuccess && (
                    <div className="text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Changes saved successfully
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            {/* Password Form */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Update Password</h2>
              
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter new password"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                
                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{passwordError}</span>
                  </div>
                )}
                
                <div className="pt-4 flex items-center justify-between">
                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                  
                  {passwordSuccess && (
                    <div className="text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Password updated successfully
                    </div>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Settings;