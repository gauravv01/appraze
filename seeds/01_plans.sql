-- Seed subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, features, limits) 
VALUES 
  ('free', 'Free', 'Basic features for small teams', 0, 0, 
   '{"ai_reviews": true, "basic_templates": true}',
   '{"employees": 5, "reviews_per_month": 10, "storage_gb": 1}'),
  
  ('pro', 'Professional', 'Advanced features for growing teams', 2900, 29900, 
   '{"ai_reviews": true, "advanced_templates": true, "custom_branding": true, "priority_support": true}',
   '{"employees": 50, "reviews_per_month": 100, "storage_gb": 10}'),
  
  ('enterprise', 'Enterprise', 'Full features for large organizations', 9900, 99900,
   '{"ai_reviews": true, "advanced_templates": true, "custom_branding": true, "priority_support": true, "api_access": true, "sso": true}',
   '{"employees": -1, "reviews_per_month": -1, "storage_gb": 100}'); 