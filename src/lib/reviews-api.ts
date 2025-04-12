import { supabase } from './supabase';
import { APIClient } from './api-client';
import { OpenAIAPI } from './openai-api';

export interface Review {
  id: string;
  employee_id: string;
  reviewer_id: string;
  template_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  content: Record<string, any>;
  feedback: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export class ReviewsAPI extends APIClient {
  static async createReview(data: Partial<Review>) {
    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return review;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getReview(reviewId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          employee:employees(*),
          template:review_templates(*)
        `)
        .eq('id', reviewId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async updateReview(reviewId: string, updates: Partial<Review>) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async generateAIReview(reviewId: string) {
    try {
      const review = await this.getReview(reviewId);
      const aiContent = await OpenAIAPI.generateReview({
        employeeName: review.employee.name,
        position: review.employee.position,
        template: review.template,
        content: review.content
      });

      return this.updateReview(reviewId, {
        content: { ...review.content, ai_generated: aiContent }
      });
    } catch (error) {
      this.handleError(error);
    }
  }
} 