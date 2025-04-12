import { APIClient } from './api-client';

interface ReviewGenerationParams {
  employeeName: string;
  position: string;
  template: any;
  content: Record<string, any>;
}

export class OpenAIAPI extends APIClient {
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private static readonly MODEL = import.meta.env.VITE_OPENAI_MODEL;

  static async generateReview(params: ReviewGenerationParams): Promise<string> {
    try {
      if (!this.API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: this.MODEL || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert HR professional writing a performance review.'
            },
            {
              role: 'user',
              content: this.constructPrompt(params)
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      this.handleError(error);
      return '';
    }
  }

  private static constructPrompt(params: ReviewGenerationParams): string {
    return `Please write a professional performance review for:
      Employee: ${params.employeeName}
      Position: ${params.position}
      
      Based on the following information:
      ${JSON.stringify(params.content, null, 2)}
      
      Follow this template:
      ${JSON.stringify(params.template, null, 2)}`;
  }
} 