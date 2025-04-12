# PerformAI Authentication and Database Implementation

This document provides a guide on how to use the authentication and database utilities implemented for the PerformAI application.

## Table of Contents
- [Overview](#overview)
- [Authentication System](#authentication-system)
- [Database API Utilities](#database-api-utilities)
- [Component Usage Examples](#component-usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The PerformAI application uses Supabase for authentication and database operations. The implementation includes:

1. User authentication (sign-up, sign-in, password reset)
2. Protected routes via AuthGuard
3. Database API utilities for CRUD operations on employees, reviews, templates, and settings
4. Mock functionality for development without Supabase credentials

## Authentication System

The authentication system is implemented in the `auth.js` file. It exports the Supabase client and several helper functions for authentication operations.

### Key Authentication Functions

- `signUp({ email, password, ...metadata })` - Register a new user
- `signIn({ email, password })` - Authenticate a user
- `signOut()` - Log out the current user
- `resetPassword(email)` - Request a password reset for a user
- `updatePassword(newPassword)` - Change a user's password after reset
- `getCurrentUser()` - Get the currently authenticated user
- `onAuthStateChange(callback)` - Subscribe to authentication state changes

### Authentication Components

- `Login.jsx` - Sign-in form
- `SignUp.jsx` - Registration form
- `ForgotPassword.jsx` - Request password reset
- `ResetPassword.jsx` - Set new password after reset
- `AuthGuard.jsx` - Protect routes from unauthenticated access

### Route Configuration

The `RouterConfig.jsx` file sets up the application routes, including public routes (login, signup) and protected routes (dashboard, employees, reviews, settings).

## Database API Utilities

The database API utilities are implemented in the `database-api.js` file. These functions handle CRUD operations for the main entities in the application.

### Employees API

```javascript
// Get all employees
const employees = await getEmployees();

// Get a single employee
const employee = await getEmployee(employeeId);

// Create a new employee
const newEmployee = await createEmployee({
  name: 'John Doe',
  position: 'Software Engineer',
  department: 'Engineering',
  hire_date: '2023-01-15',
  status: 'active'
});

// Update an employee
const updatedEmployee = await updateEmployee(employeeId, {
  position: 'Senior Software Engineer'
});

// Delete an employee
await deleteEmployee(employeeId);
```

### Review Templates API

```javascript
// Get all templates
const templates = await getReviewTemplates();

// Get a template with its fields
const template = await getReviewTemplate(templateId);

// Create a template with fields
const newTemplate = await createReviewTemplate({
  name: 'Performance Review 2023',
  description: 'Annual performance evaluation',
  fields: [
    {
      name: 'Overall Performance',
      description: 'Rate overall performance',
      field_type: 'rating',
      required: true,
      order_position: 1
    },
    {
      name: 'Strengths',
      description: 'Key strengths observed',
      field_type: 'text',
      required: true,
      order_position: 2
    }
  ]
});

// Update a template and its fields
const updatedTemplate = await updateReviewTemplate(templateId, {
  name: 'Updated Performance Review 2023',
  fields: [
    /* updated fields array */
  ]
});

// Delete a template
await deleteReviewTemplate(templateId);
```

### Reviews API

```javascript
// Get all reviews
const reviews = await getReviews();

// Get a review with its field values
const review = await getReview(reviewId);

// Create a new review
const newReview = await createReview({
  employee_id: employeeId,
  template_id: templateId,
  review_date: '2023-06-15',
  status: 'draft',
  fieldValues: [
    {
      field_id: fieldId1,
      value: '4'
    },
    {
      field_id: fieldId2,
      value: 'Excellent communication skills'
    }
  ]
});

// Update a review
const updatedReview = await updateReview(reviewId, {
  status: 'completed',
  fieldValues: [
    /* updated field values */
  ]
});

// Delete a review
await deleteReview(reviewId);
```

### User Settings API

```javascript
// Get user settings
const settings = await getUserSettings();

// Update user settings
const updatedSettings = await updateUserSettings({
  notification_preferences: {
    email: true,
    in_app: true
  },
  theme: 'dark'
});
```

## Component Usage Examples

### Authentication in Components

```jsx
import { useState } from 'react';
import { signIn } from './auth';

const MyLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
      // Handle successful login
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Using Database API in Components

```jsx
import { useState, useEffect } from 'react';
import { getEmployees, createEmployee } from './database-api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  const handleAddEmployee = async (employeeData) => {
    try {
      const newEmployee = await createEmployee(employeeData);
      setEmployees([...employees, newEmployee]);
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Render employees */}
      {/* Add employee form */}
    </div>
  );
};
```

## Configuration

### Environment Variables

The authentication system requires the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These should be stored in a `.env` file at the root of your project.

### Development Mode

The application includes a mock client for development when Supabase credentials are not available. This allows for testing without a Supabase account.

To use the mock client, simply omit the environment variables. The `auth.js` file will automatically fallback to the mock client.

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure your Supabase URL and anon key are correct. Check that you have enabled email authentication in your Supabase project settings.

2. **Database access errors**: Verify that your Row Level Security (RLS) policies are correctly set up. Each table should have appropriate policies to ensure users can only access their own data.

3. **Missing data**: If data appears to be missing, check your database queries and ensure you're correctly filtering by user ID.

4. **Password reset not working**: Confirm that you have configured the correct redirect URLs in your Supabase project settings.

### Development Tips

1. Enable console logging in the auth and database functions to debug issues.

2. Use the Supabase dashboard to monitor authentication events and database operations.

3. Test authentication flows thoroughly, including edge cases like expired sessions and invalid credentials.

4. Implement error handling consistently across all components that interact with the authentication and database systems. 