export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  organization_id?: string;
  role: 'admin' | 'member';
  stripe_customer_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due' | null;
  subscription_period_end?: string;
  last_payment_status?: 'succeeded' | 'failed' | null;
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  team_id: string;
  employee_id: string;
  reviewer_id: string;
  review_period: string;
  status: 'draft' | 'published' | 'archived';
  content: any;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  invite_token: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
} 