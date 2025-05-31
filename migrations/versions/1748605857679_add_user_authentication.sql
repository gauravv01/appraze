-- Migration: add_user_authentication
-- Created at: 2025-05-30T11:50:57.679Z

-- Write your SQL here

CREATE TABLE review_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index for better performance
CREATE INDEX idx_review_templates_user_id ON review_templates(user_id);

