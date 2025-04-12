import { supabase } from './supabase';

export class APIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export class APIClient {
  protected static handleError<T>(error: unknown): T {
    console.error('API Error:', error);
    throw new APIError(
      (error as any)?.code || 'UNKNOWN_ERROR',
      (error as any)?.message || 'An unexpected error occurred'
    );
  }

  protected static checkAuth() {
    const session = supabase.auth.getSession();
    if (!session) {
      throw new APIError('UNAUTHORIZED', 'User is not authenticated');
    }
  }
} 