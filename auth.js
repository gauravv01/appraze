import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail } from './src/lib/sendgrid';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for development if credentials are missing
const createMockClient = () => {
  console.warn('Using mock Supabase client. Authentication will not work properly.');
  return {
    auth: {
      signUp: () => Promise.resolve({ user: { id: 'mock-user-id' }, error: null }),
      signInWithPassword: () => Promise.resolve({ user: { id: 'mock-user-id' }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      updateUser: () => Promise.resolve({ user: { id: 'mock-user-id' }, error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: 'mock-user-id' } }, error: null }),
      onAuthStateChange: (callback) => {
        callback('SIGNED_IN', { user: { id: 'mock-user-id' } });
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: {}, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.resolve({ data: [{}], error: null }),
      update: () => ({
        eq: () => Promise.resolve({ data: [{}], error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      }),
      upsert: () => Promise.resolve({ data: [{}], error: null })
    })
  };
};

// Create the client (real or mock)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// =====================
// AUTHENTICATION FUNCTIONS
// =====================

/**
 * Sign up a new user with email and password
 */
export const signUp = async ({ email, password, ...metadata }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });

  if (error) throw error;
  
  // Send welcome email
  try {
    await sendWelcomeEmail(email, metadata.name || 'User');
  } catch (emailError) {
    console.error('Error sending welcome email:', emailError);
    // Continue with sign up even if email fails
  }
  
  return data;
};

/**
 * Sign in a user with email and password
 */
export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Request a password reset for a user
 */
export const resetPassword = async (email) => {
  const resetLink = `${window.location.origin}/reset-password`;
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetLink
  });

  if (error) throw error;
  
  // Send password reset email
  try {
    await sendPasswordResetEmail(email, resetLink);
  } catch (emailError) {
    console.error('Error sending password reset email:', emailError);
    // Continue with password reset even if email fails
  }
  
  return data;
};

/**
 * Update a user's password (after reset)
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  
  // Get current user's email
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData && userData.user && userData.user.email) {
      await sendPasswordChangedEmail(userData.user.email);
    }
  } catch (emailError) {
    console.error('Error sending password changed email:', emailError);
    // Continue with password update even if email fails
  }
  
  return data;
};

/**
 * Get the currently logged in user
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}; 