import { supabase } from './supabase';
import { APIClient } from './api-client';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  company_name?: string;
  role: 'admin' | 'member';
}

export class ProfileAPI extends APIClient {
  static async getProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async uploadAvatar(userId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await this.updateProfile(userId, { avatar_url: publicUrl });
      return publicUrl;
    } catch (error) {
      this.handleError(error);
    }
  }
} 