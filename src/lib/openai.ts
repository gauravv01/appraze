import { Employee } from '../types';

// Types for OpenAI API
interface OpenAICompletionRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ReviewGenerationParams {
  employee: Employee;
  reviewPeriod: string;
  reviewerName: string;
  strengths: string;
  improvements: string;
  overallRating?: string;
  tonePreference: string;
  additionalComments?: string;
}

/**
 * Call OpenAI's API
 */
export const callOpenAI = async (request: OpenAICompletionRequest): Promise<string> => {
  // Use environment variables for OpenAI API key
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not defined in environment variables');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data: OpenAICompletionResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

/**
 * Generate a performance review using OpenAI's API
 */
export const generateReview = async (params: ReviewGenerationParams): Promise<string> => {
  const {
    employee,
    reviewPeriod,
    reviewerName,
    strengths,
    improvements,
    overallRating,
    tonePreference,
    additionalComments,
  } = params;

  // Format the strengths and improvements from multiline text
  const strengthsList = strengths
    .split('\n')
    .filter(item => item.trim())
    .map(item => `- ${item.trim()}`);
  
  const improvementsList = improvements
    .split('\n')
    .filter(item => item.trim())
    .map(item => `- ${item.trim()}`);

  // Get the rating label if provided
  let ratingLabel = '';
  if (overallRating) {
    switch (overallRating) {
      case '5': ratingLabel = 'Exceptional'; break;
      case '4': ratingLabel = 'Exceeds Expectations'; break;
      case '3': ratingLabel = 'Meets Expectations'; break;
      case '2': ratingLabel = 'Needs Improvement'; break;
      case '1': ratingLabel = 'Unsatisfactory'; break;
      default: ratingLabel = '';
    }
  }

  // Create the fixed prompt with dynamically filled employee details
  const systemPrompt = `You are acting as an elite-level HR consultant with over 30 years of experience, holding senior roles in renowned global organizations (similar caliber to Deloitte, Google, McKinsey). You specialize in producing structured, insightful, unbiased, and highly professional employee performance reviews that significantly improve workplace clarity, fairness, productivity, and overall employee growth.

Your expertise includes deep understanding of:
• Employee psychology and motivational language
• Effective, unbiased, constructive feedback
• Modern HR best practices aligned with global standards (researched from leading platforms like Leapsome, Lattice, Zavvy, Betterworks, and Culture Amp)
• Precise, natural, human-sounding language free from generic buzzwords, clichés, corporate jargon, or repetitive robotic phrases.

The organization requesting your expertise (Appraze.io) serves SMBs (20-500 employees) that lack comprehensive HR tech or processes and typically experience:
• Stress and frustration during performance-review periods due to tight timelines
• Delays or procrastination by managers writing reviews manually
• Concerns around biased or inconsistent feedback damaging workplace morale and productivity
• Lost productivity due to time-consuming review-writing
• Inability to clearly articulate nuanced employee performance feedback

Your task is to write a complete, highly polished performance review using ONLY the manager-provided inputs, without adding or hallucinating any external details. Your review must address clearly identified HR industry pain points, specifically:
• Reducing manager workload (by expanding brief notes into full reviews)
• Delivering unbiased, fair, and actionable employee feedback
• Ensuring the review content sounds completely human-written, authentic, and natural (so the client never suspects an AI tool was involved)`;

  // Create the user prompt with structured instructions
  const userPrompt = `
🎯 INSTRUCTIONS FOR GENERATING THE PERFORMANCE REVIEW

Step 1: Review Employee & Manager Input (Inputs provided by user):

Employee Name: ${employee.name}
Role/Job Title: ${employee.position}
Department: ${employee.department}
Review Period: ${reviewPeriod}
Manager's Name: ${reviewerName}

Strengths & Achievements: 
${strengthsList.join('\n')}

Areas for Improvement: 
${improvementsList.join('\n')}

Tone Preference: ${tonePreference}
${ratingLabel ? `Overall Performance Rating: ${ratingLabel}` : ''}
${additionalComments ? `Additional Context:\n${additionalComments}` : ''}

Step 2: Generate Structured Review Sections (Adapt structure based on manager inputs provided.)

📌 Opening & Context (~50-70 words)
• Briefly summarize the review period clearly and contextually
• Set the stage with overall observations about employee's general contribution and role importance

✅ Strengths & Achievements (~100-150 words)
• Rephrase manager's provided notes clearly and naturally, ensuring the review is personalized and genuinely reflective of the employee's specific contributions
• Provide examples and context (without adding external assumptions or details)
• Avoid generic phrases (no "great team player," "hard worker," etc., without explicit context)

🔄 Constructive Areas for Improvement (~80-120 words)
• Frame improvement points in clear, actionable language
• Suggest behavior-focused improvements, avoid personal criticism
• Use supportive language that encourages growth rather than criticism

📊 Overall Assessment (optional, 20-40 words, if rating provided)
• Summarize the provided overall rating briefly, positively reinforcing the feedback from above sections
• Clearly match the tone and content to the provided overall rating (if any)

Step 3: Apply Tone Precisely & Consistently:

Always write in the specified tone:
• Professional & Constructive (default): Formal yet empathetic, authoritative yet supportive, precise yet approachable
• Other tones (Friendly, Direct, Formal, Encouraging) as specified by user inputs

Step 4: Review Criteria Checklist (Self-review before submission):
• ✅ Content fully matches provided inputs without extra assumptions or hallucinations
• ✅ No generic, cliché, robotic, or AI-sounding language included
• ✅ All feedback unbiased, actionable, and specifically targeted
• ✅ Length: precisely between 250–400 words
• ✅ Feels fully human-written (indistinguishable from a real senior manager or HR professional)
• ✅ Does not mention AI-generation at all (never reveal AI-assistance or processing method)

Format your response in Markdown.
`;

  // Call the OpenAI API
  const request: OpenAICompletionRequest = {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  return await callOpenAI(request);
}; 