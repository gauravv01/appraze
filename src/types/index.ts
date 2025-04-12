// Team related types
export interface Team {
  id: string;
  name: string;
  slug: string;
  plan_id: string;
  subscription_id?: string;
  subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
  subscription_period_end?: Date;
  stripe_customer_id?: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  invited_by: string;
  created_at: Date;
  updated_at: Date;
}

// Subscription related types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  created_at: Date;
  updated_at: Date;
}

export interface UsageLog {
  id: string;
  team_id: string;
  feature: string;
  quantity: number;
  created_at: Date;
}

// Review related types
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

// Employee related types
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
  created_at: Date;
  updated_at: Date;
}

// Profile related types
export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  company_name?: string;
  role: 'admin' | 'member';
  stripe_customer_id?: string;
  created_at: Date;
  updated_at: Date;
} 