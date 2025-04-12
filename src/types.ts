// Employee type definition
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Review type definition
export interface Review {
  id: string;
  user_id: string;
  employee_id: string;
  employee?: Employee;
  template_id?: string;
  title: string;
  review_type: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Archived';
  progress: number;
  due_date?: string;
  content?: string;
  strengths?: string;
  improvements?: string;
  overall_rating?: number;
  tone_preference?: string;
  additional_comments?: string;
  created_at: string;
  updated_at: string;
  fieldValues?: ReviewFieldValue[];
}

// Review Field
export interface ReviewField {
  id: string;
  template_id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox';
  options?: any;
  required: boolean;
  order_position: number;
  created_at?: string;
}

// Review Field Value
export interface ReviewFieldValue {
  id: string;
  review_id: string;
  field_id: string;
  field?: ReviewField;
  value: string;
  created_at?: string;
  updated_at?: string;
}

// Review Template
export interface Template {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  fields?: ReviewField[];
}

// Declare modules for JS files to prevent TypeScript errors
declare module '../../auth.js';
declare module '../../database-api.js'; 