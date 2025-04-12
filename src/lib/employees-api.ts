import { supabase } from './supabase';
import { APIClient } from './api-client';

export interface Employee {
  id: string;
  user_id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  image_url?: string;
}

export class EmployeesAPI extends APIClient {
  static async createEmployee(data: Partial<Employee>) {
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return employee;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async updateEmployee(employeeId: string, updates: Partial<Employee>) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async uploadImage(employeeId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('employee-images')
        .getPublicUrl(fileName);

      await this.updateEmployee(employeeId, { image_url: publicUrl });
      return publicUrl;
    } catch (error) {
      this.handleError(error);
    }
  }
} 