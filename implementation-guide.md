# Supabase Implementation Guide for PerformAI

This guide will walk you through implementing the PerformAI database schema in Supabase and configuring authentication.

## 1. Setting Up Supabase Project

### Create a New Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign in or create an account
2. Click "New Project" and follow the prompts to create a new project
3. Make note of your project URL and API keys (found in Project Settings → API)

## 2. Implementing the Database Schema

### Run the SQL Script

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-implementation.sql` into the SQL editor
3. Click "Run" to execute the script
4. Verify that all the tables, functions, triggers, and policies were created successfully by checking the Database section

### Potential Issues and Troubleshooting

- If you encounter an error about existing types, you may need to drop them first with `DROP TYPE IF EXISTS employee_status CASCADE;` etc.
- If you get an error about a function not existing, make sure you're creating the functions before the triggers that use them
- Ensure you execute the entire script at once to maintain the proper order of dependencies

## 3. Configure Authentication

### Enable Email Authentication

1. Go to Authentication → Providers in your Supabase dashboard
2. Ensure Email provider is enabled
3. Configure settings:
   - For development, you can disable "Confirm email" for easier testing
   - For production, enable "Confirm email" for security

### Configure Email Templates

1. Go to Authentication → Email Templates
2. Customize the following templates:
   - Confirmation Email
   - Magic Link Email
   - Reset Password Email
   - Change Email Address Email

### Set Up Redirect URLs

1. Go to Authentication → URL Configuration
2. Add your application's URLs:
   - Site URL: `https://yourdomain.com` (or `http://localhost:5173` for development)
   - Redirect URLs: 
     - `https://yourdomain.com/auth/callback`
     - `https://yourdomain.com/reset-password`
     - (For development: `http://localhost:5173/auth/callback`, `http://localhost:5173/reset-password`)

### Configure CORS

1. Go to Project Settings → API
2. Add your origin URLs in the CORS section:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

## 4. Create React Auth Utilities

Create a file called `auth.js` (or `auth.ts` for TypeScript) with the following utilities:

```javascript
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign Up
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });
  
  if (error) throw error;
  return data;
};

// Sign In
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

// Sign Out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Password Reset
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
};

// Update Password
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
};

// Get Current User
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Auth State Change Listener
export const subscribeToAuthChanges = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session)
  );
  
  return subscription;
};
```

## 5. Implement AuthGuard Component

Create an `AuthGuard.jsx` (or `AuthGuard.tsx` for TypeScript) component:

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './auth';

const AuthGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (!session) {
        navigate('/auth/login', { replace: true });
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (!session) navigate('/auth/login', { replace: true });
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }
  
  return isAuthenticated ? children : null;
};

export default AuthGuard;
```

## 6. Testing the Implementation

### Test User Authentication

1. Test the sign-up flow:
   - Create a new user with email and password
   - Confirm that the user is successfully created in the Auth → Users section
   - Verify that a profile and user_settings record was automatically created

2. Test sign-in and protected routes:
   - Sign in with the created user
   - Verify you can access protected routes
   - Try accessing a protected route without authentication to ensure the redirect works

### Test Data Operations

For each table, test the basic CRUD operations to ensure the Row Level Security policies are working correctly:

1. Employees:
   - Create a new employee for the logged-in user
   - Verify you can read, update, and delete the employee

2. Review Templates:
   - Create a new review template
   - Add fields to the template

3. Reviews:
   - Create a review using an employee and template
   - Add field values to the review

## 7. Common Issues and Solutions

### Missing Environment Variables

Make sure your `.env` file includes these variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### RLS Policy Issues

If you're getting "no permission" errors when accessing data:
1. Check that RLS is enabled on the tables
2. Verify the policies are correctly written
3. Confirm the user is authenticated
4. Check the user's ID matches the records' user_id values

### Trigger Not Firing

If the profile creation trigger isn't working:
1. Verify the function and trigger exist in the database
2. Check for errors in the function
3. Ensure the function is marked as SECURITY DEFINER
4. Try manually inserting a profile to see if there are other issues

## 8. Next Steps

After successfully implementing the database schema and authentication:

1. Implement basic CRUD operations for each entity
2. Set up API endpoints for the review generation functionality
3. Implement the subscription and billing system
4. Build out the UI components
5. Test thoroughly across different scenarios 