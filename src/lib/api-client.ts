import { supabase } from './supabase';

export class APIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export class APIClient {
  protected static async handleError(error: any) {
    console.error('API Error:', error);
    throw new APIError(
      error.code || 'UNKNOWN_ERROR',
      error.message || 'An unexpected error occurred'
    );
  }

  protected static checkAuth() {
    const session = supabase.auth.getSession();
    if (!session) {
      throw new APIError('UNAUTHORIZED', 'User is not authenticated');
    }
  }
} 