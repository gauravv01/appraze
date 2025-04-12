import { supabase } from './auth';

// =====================
// EMPLOYEES API
// =====================

/**
 * Fetch all employees for the current user
 */
export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

/**
 * Get a single employee by ID
 */
export const getEmployee = async (id) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Create a new employee
 */
export const createEmployee = async (employeeData) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select();
  
  if (error) throw error;
  return data[0];
};

/**
 * Update an employee
 */
export const updateEmployee = async (id, updates) => {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id) => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// =====================
// REVIEW TEMPLATES API
// =====================

/**
 * Fetch all review templates for the current user
 */
export const getReviewTemplates = async () => {
  const { data, error } = await supabase
    .from('review_templates')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

/**
 * Get a single review template by ID, including its fields
 */
export const getReviewTemplate = async (id) => {
  // Get the template
  const { data: template, error: templateError } = await supabase
    .from('review_templates')
    .select('*')
    .eq('id', id)
    .single();
  
  if (templateError) throw templateError;
  
  // Get the template fields
  const { data: fields, error: fieldsError } = await supabase
    .from('review_fields')
    .select('*')
    .eq('template_id', id)
    .order('order_position');
  
  if (fieldsError) throw fieldsError;
  
  // Combine template and fields
  return { ...template, fields };
};

/**
 * Create a new review template
 */
export const createReviewTemplate = async (templateData) => {
  const { fields, ...templateInfo } = templateData;
  
  // Create the template first
  const { data: newTemplate, error: templateError } = await supabase
    .from('review_templates')
    .insert([templateInfo])
    .select();
  
  if (templateError) throw templateError;
  
  // If there are fields, create them with the new template ID
  if (fields && fields.length > 0) {
    const fieldsWithTemplateId = fields.map(field => ({
      ...field,
      template_id: newTemplate[0].id
    }));
    
    const { error: fieldsError } = await supabase
      .from('review_fields')
      .insert(fieldsWithTemplateId);
    
    if (fieldsError) throw fieldsError;
  }
  
  // Return the full template with its ID
  return newTemplate[0];
};

/**
 * Update a review template
 */
export const updateReviewTemplate = async (id, updates) => {
  const { fields, ...templateUpdates } = updates;
  
  // Update the template
  const { data: updatedTemplate, error: templateError } = await supabase
    .from('review_templates')
    .update(templateUpdates)
    .eq('id', id)
    .select();
  
  if (templateError) throw templateError;
  
  // If fields are provided, handle field updates
  if (fields) {
    // For simplicity, we'll delete all existing fields and create new ones
    // In a real app, you might want a more sophisticated approach to update only changed fields
    const { error: deleteError } = await supabase
      .from('review_fields')
      .delete()
      .eq('template_id', id);
    
    if (deleteError) throw deleteError;
    
    // Create new fields
    if (fields.length > 0) {
      const fieldsWithTemplateId = fields.map(field => ({
        ...field,
        template_id: id
      }));
      
      const { error: insertError } = await supabase
        .from('review_fields')
        .insert(fieldsWithTemplateId);
      
      if (insertError) throw insertError;
    }
  }
  
  // Return the updated template
  return updatedTemplate[0];
};

/**
 * Delete a review template
 */
export const deleteReviewTemplate = async (id) => {
  // Note: Fields will be automatically deleted due to CASCADE constraint
  const { error } = await supabase
    .from('review_templates')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// =====================
// REVIEWS API
// =====================

/**
 * Fetch all reviews for the current user
 */
export const getReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      employee:employees(id, name, position)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

/**
 * Get a single review by ID, including its field values
 */
export const getReview = async (id) => {
  // Get the review with employee info
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select(`
      *,
      employee:employees(id, name, position, department)
    `)
    .eq('id', id)
    .single();
  
  if (reviewError) throw reviewError;
  
  // Get the field values
  const { data: fieldValues, error: valuesError } = await supabase
    .from('review_field_values')
    .select(`
      *,
      field:review_fields(*)
    `)
    .eq('review_id', id);
  
  if (valuesError) throw valuesError;
  
  // Combine review and field values
  return { ...review, fieldValues };
};

/**
 * Create a new review
 */
export const createReview = async (reviewData) => {
  const { fieldValues, ...reviewInfo } = reviewData;
  
  // Create the review first
  const { data: newReview, error: reviewError } = await supabase
    .from('reviews')
    .insert([reviewInfo])
    .select();
  
  if (reviewError) throw reviewError;
  
  // If there are field values, create them with the new review ID
  if (fieldValues && fieldValues.length > 0) {
    const valuesWithReviewId = fieldValues.map(value => ({
      ...value,
      review_id: newReview[0].id
    }));
    
    const { error: valuesError } = await supabase
      .from('review_field_values')
      .insert(valuesWithReviewId);
    
    if (valuesError) throw valuesError;
  }
  
  // Return the new review with its ID
  return newReview[0];
};

/**
 * Update a review
 */
export const updateReview = async (id, updates) => {
  const { fieldValues, ...reviewUpdates } = updates;
  
  // Update the review
  const { data: updatedReview, error: reviewError } = await supabase
    .from('reviews')
    .update(reviewUpdates)
    .eq('id', id)
    .select();
  
  if (reviewError) throw reviewError;
  
  // If field values are provided, update them
  if (fieldValues) {
    // For each field value, upsert (update if exists, insert if not)
    for (const value of fieldValues) {
      const { field_id, value: fieldValue } = value;
      
      const { error: upsertError } = await supabase
        .from('review_field_values')
        .upsert({
          review_id: id,
          field_id,
          value: fieldValue
        }, {
          onConflict: 'review_id,field_id'
        });
      
      if (upsertError) throw upsertError;
    }
  }
  
  // Return the updated review
  return updatedReview[0];
};

/**
 * Delete a review
 */
export const deleteReview = async (id) => {
  // Note: Field values will be automatically deleted due to CASCADE constraint
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

/**
 * Update a review with generated content
 */
export const saveGeneratedReview = async (id, content) => {
  // Update the review with the content
  const { data: updatedReview, error: reviewError } = await supabase
    .from('reviews')
    .update({
      content: content,
      status: 'Completed',
      progress: 100
    })
    .eq('id', id)
    .select();
  
  if (reviewError) throw reviewError;
  
  return updatedReview[0];
};

// =====================
// USER SETTINGS API
// =====================

/**
 * Get user settings for the current user
 */
export const getUserSettings = async () => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows returned
  
  return data || null;
};

/**
 * Update user settings
 */
export const updateUserSettings = async (updates) => {
  const { data: settings } = await getUserSettings();
  
  // If settings exist, update them
  if (settings) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', settings.user_id)
      .select();
    
    if (error) throw error;
    return data[0];
  } 
  // If no settings exist, create them
  else {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('user_settings')
      .insert([{ user_id: user.id, ...updates }])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};

// =====================
// USER PROFILE API
// =====================

/**
 * Get profile for the current user
 */
export const getUserProfile = async () => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows returned
  
  return data || null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.user.id)
    .select();
  
  if (error) throw error;
  return data[0];
}; 