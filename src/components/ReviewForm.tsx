import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, Download, Copy, Pencil, Loader, UserPlus, File, Save, ChevronLeft } from 'lucide-react';
import { Employee, Template } from '../types';
import { generateReview } from '../lib/openai';
import { generatePDF, generateWord } from '../lib/document-utils';
import MarkdownRenderer from './MarkdownRenderer';
import { sendReviewCompletionEmail } from '../lib/sendgrid';

interface ReviewFormProps {
  onClose?: () => void;
}

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'constructive', label: 'Constructive' },
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'direct', label: 'Direct' }
];

const ratingOptions = [
  { value: '5', label: 'Exceptional' },
  { value: '4', label: 'Exceeds Expectations' },
  { value: '3', label: 'Meets Expectations' },
  { value: '2', label: 'Needs Improvement' },
  { value: '1', label: 'Unsatisfactory' }
];

export default function ReviewForm({ onClose }: ReviewFormProps) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    templateId: '',
    reviewPeriod: '',
    reviewType: 'Annual Review',
    reviewDate: new Date().toISOString().split('T')[0],
    strengths: '',
    improvements: '',
    overallRating: '',
    tonePreference: 'professional',
    reviewerName: '',
    additionalComments: ''
  });

  // Fetch employees from Supabase
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setLoadingEmployees(true);
        const user = localStorage.getItem('userId');
        if (!user) {
          throw new Error('User not found');
        }
        const {data:profileData}=await supabase
        .from('profiles')
        .select('*')
        .eq('id', user)
        .order('name').single();
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('organization_id', profileData.organization_id)
          .order('name');
        
        if (error) throw error;
        setEmployees(data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    }
    
    fetchEmployees();
  }, []);
  
  // Fetch review templates from Supabase
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoadingTemplates(true);
        const { data, error } = await supabase
          .from('review_templates')
          .select('id, name')
          .order('name')
          .maybeSingle();
        
        if (error) throw error;
        setTemplates((data || []) as Template[]);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoadingTemplates(false);
      }
    }
    
    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId) {
      alert('Please select an employee for this review');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Find the selected employee
      const employee = employees.find(emp => emp.id === formData.employeeId);
      if (!employee) {
        throw new Error('Selected employee not found');
      }
      
      setCurrentEmployee(employee);
      
      // Create the review in Supabase
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const reviewData = {
        employee_id: formData.employeeId,
        template_id: formData.templateId || null,
        title: `${employee.name} - ${formData.reviewPeriod}`,
        review_type: formData.reviewType,
        status: 'In Progress',
        progress: 50,
        due_date: formData.reviewDate,
        strengths: formData.strengths,
        improvements: formData.improvements,
        overall_rating: formData.overallRating ? parseInt(formData.overallRating) : null,
        tone_preference: formData.tonePreference,
        additional_comments: formData.additionalComments,
        user_id: user.user.id
      };
      
      // Create the initial review record
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const reviewId = data[0].id;
        setCurrentReviewId(reviewId);
        
        try {
          // Call OpenAI to generate the review
          const generatedContent = await generateReview({
            employee,
            reviewPeriod: formData.reviewPeriod,
            reviewerName: formData.reviewerName,
            strengths: formData.strengths,
            improvements: formData.improvements,
            overallRating: formData.overallRating,
            tonePreference: formData.tonePreference,
            additionalComments: formData.additionalComments
          });
          
          setGeneratedReview(generatedContent);
          
          // Update the review with the generated content
          await supabase
            .from('reviews')
            .update({
              content: generatedContent,
              status: 'Completed',
              progress: 100
            })
            .eq('id', reviewId);
            
          // Send email notification if we have the current user's email
          try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.email) {
              await sendReviewCompletionEmail(
                userData.user.email,
                employee.name,
                formData.reviewPeriod,
                reviewId
              );
            }
          } catch (emailError) {
            console.error('Error sending review completion email:', emailError);
            // Continue even if email fails
          }
          
        } catch (genError) {
          console.error('Error generating review:', genError);
          setError('Failed to generate review with AI. Please try again or check your API key.');
          
          // Update the review status to reflect the error
          await supabase
            .from('reviews')
            .update({ status: 'Draft', progress: 10 })
            .eq('id', reviewId);
        }
      }
    } catch (err) {
      console.error('Error creating review:', err);
      setError('Failed to create review. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    if (generatedReview) {
      navigator.clipboard.writeText(generatedReview);
    }
  };

  const downloadReviewAsPDF = () => {
    if (generatedReview && currentEmployee) {
      generatePDF(
        generatedReview,
        currentEmployee,
        formData.reviewPeriod,
        formData.reviewerName
      );
    }
  };

  const downloadReviewAsWord = () => {
    if (generatedReview && currentEmployee) {
      generateWord(
        generatedReview,
        currentEmployee,
        formData.reviewPeriod,
        formData.reviewerName
      );
    }
  };

  const saveReview = async () => {
    if (!currentReviewId || !generatedReview || !currentEmployee) return;
    
    try {
      setIsSaving(true);
      
      // Update the review with the content
      const { error } = await supabase
        .from('reviews')
        .update({
          content: generatedReview,
          status: 'Completed',
          progress: 100
        })
        .eq('id', currentReviewId);
      
      if (error) throw error;
      
      // Send email notification if we have the current user's email
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email) {
          await sendReviewCompletionEmail(
            userData.user.email,
            currentEmployee.name,
            formData.reviewPeriod,
            currentReviewId
          );
        }
      } catch (emailError) {
        console.error('Error sending review completion email:', emailError);
        // Continue with saving the review even if email fails
      }
      
      setSaveSuccess(true);
      
      // Redirect to the review detail page after a short delay
      setTimeout(() => {
        navigate(`/dashboard/reviews/${currentReviewId}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error saving review:', err);
      setError('Failed to save the review. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // For PDF download button, use File icon with a PDF label
  const FilePdf = () => (
    <div className="relative">
      <File className="w-5 h-5" />
      <span className="absolute bottom-0 right-0 text-xs font-bold">PDF</span>
    </div>
  );

  // For Word download button, use File icon with a DOC label
  const FileWord = () => (
    <div className="relative">
      <File className="w-5 h-5" />
      <span className="absolute bottom-0 right-0 text-xs font-bold">DOC</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Generate Performance Review</h2>
        <FileText className="w-6 h-6 text-indigo-600" />
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Generating Review</h3>
          <p className="text-gray-600 text-center max-w-sm">
            We're crafting a professional review based on your inputs. This may take a minute...
          </p>
        </div>
      ) : !generatedReview ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee*
            </label>
            {loadingEmployees ? (
              <div className="flex items-center space-x-2 h-10">
                <Loader className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="text-gray-500">Loading employees...</span>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex items-center justify-between h-10 bg-gray-50 rounded-lg p-3 text-gray-500">
                <span>No employees found</span>
                <button
                  type="button"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                  onClick={() => navigate('/dashboard/employees')}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add Employee
                </button>
              </div>
            ) : (
              <select
                id="employeeId"
                name="employeeId"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">
                Review Template (Optional)
              </label>
              <select
                id="templateId"
                name="templateId"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.templateId}
                onChange={handleInputChange}
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reviewPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                Review Period
              </label>
              <input
                type="text"
                id="reviewPeriod"
                name="reviewPeriod"
                required
                placeholder="e.g., Q1 2025"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.reviewPeriod}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="reviewDate" className="block text-sm font-medium text-gray-700 mb-1">
                Review Date
              </label>
              <input
                type="date"
                id="reviewDate"
                name="reviewDate"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.reviewDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label htmlFor="reviewType" className="block text-sm font-medium text-gray-700 mb-1">
                Review Type
              </label>
              <input
                type="text"
                id="reviewType"
                name="reviewType"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.reviewType}
                onChange={handleInputChange}
                placeholder="e.g., Annual Review, Quarterly Check-in"
              />
            </div>
          </div>

          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-1">
              Strengths/Achievements
            </label>
            <textarea
              id="strengths"
              name="strengths"
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.strengths}
              placeholder="e.g., 'Consistently meets deadlines and delivers high-quality work'&#10;'Improved team efficiency by streamlining internal processes'&#10;'Demonstrated strong leadership during project delivery'"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-1">
              Areas for Improvement
            </label>
            <textarea
              id="improvements"
              name="improvements"
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.improvements}
              placeholder="e.g., 'Needs to improve stakeholder communication'&#10;'Could take more initiative during team discussions'&#10;'Should focus on developing technical documentation skills'"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Comments
            </label>
            <textarea
              id="additionalComments"
              name="additionalComments"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={formData.additionalComments}
              placeholder="Add any additional context, specific examples, or other relevant information that should be considered in the review"
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="overallRating" className="block text-sm font-medium text-gray-700 mb-1">
                Overall Rating (Optional)
              </label>
              <select
                id="overallRating"
                name="overallRating"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.overallRating}
                onChange={handleInputChange}
              >
                <option value="">Select a rating</option>
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tonePreference" className="block text-sm font-medium text-gray-700 mb-1">
                Tone Preference
              </label>
              <select
                id="tonePreference"
                name="tonePreference"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={formData.tonePreference}
                onChange={handleInputChange}
              >
                {toneOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 mb-1">
                Reviewer Name
              </label>
              <input
                type="text"
                id="reviewerName"
                name="reviewerName"
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your full name"
                value={formData.reviewerName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isGenerating || loadingEmployees || employees.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Review'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Generated Review</h3>
            <div className="flex space-x-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button 
                onClick={downloadReviewAsPDF}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Download as PDF"
              >
                <FilePdf />
              </button>
              <button 
                onClick={downloadReviewAsWord}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Download as Word document"
              >
                <FileWord />
              </button>
              <button 
                onClick={() => setGeneratedReview(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Edit review inputs"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 overflow-auto max-h-[500px]">
            <MarkdownRenderer content={generatedReview} />
          </div>
          
          <div className="flex justify-between space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setGeneratedReview(null)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Edit
            </button>
            
            <button
              onClick={saveReview}
              disabled={isSaving || saveSuccess}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-4 h-4 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved Successfully
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Review
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}