import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  Clock,
  Pencil,
  Trash,
  AlertTriangle,
  CheckCircle,
  Loader,
  XCircle,
  Download,
  Copy,
  File,
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { generatePDF, generateWord } from '../lib/document-utils';

interface Review {
  id: string;
  employee_id: string;
  template_id: string;
  review_date: string;
  status: string;
  content?: string;
  created_at: string;
  updated_at: string;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
    email: string;
  } | null;
  template: {
    id: string;
    name: string;
    description: string;
  } | null;
  fieldValues?: {
    id: string;
    field_id: string;
    value: string;
    field: {
      id: string;
      name: string;
      description: string;
      field_type: string;
      required: boolean;
    };
  }[];
}

export default function ReviewDetail() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function fetchReviewDetails() {
      if (!reviewId) return;

      try {
        setIsLoading(true);
        
        // Fetch the review with related data
   

        // Fetch review field values
        const { data: fieldValues, error: fieldValuesError } = await supabase
          .from('reviews')
          .select(`*`)
          .eq('id', reviewId).maybeSingle();

        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select(`*`)
          .eq('id', fieldValues?.employee_id)
          .single();
        
        if (fieldValuesError) throw fieldValuesError;
        console.log(fieldValues,employee);
        // Combine data
        setReview({
          ...fieldValues,
          employee: employee || null,
          template: fieldValues.template?.[0] || null,
          fieldValues: fieldValues.fieldValues || []
        });
        
      } catch (err) {
        console.error('Error fetching review details:', err);
        setError('Failed to load review details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviewDetails();
  }, [reviewId]);

  const handleDeleteReview = async () => {
    if (!reviewId) return;
    
    try {
      setIsDeleting(true);
      
      // Delete field values first (if any)
      await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      // Then delete the review
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      
      if (error) throw error;
      
      // Navigate back to reviews list
      navigate('/dashboard/reviews');
      
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!reviewId) return;
    
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);
      
      if (error) throw error;
      
      // Update local state
      if (review) {
        setReview({
          ...review,
          status: newStatus
        });
      }
      
    } catch (err) {
      console.error('Error updating review status:', err);
      alert('Failed to update review status. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // For PDF download button, use File icon with a PDF label


  // For Word download button, use File icon with a DOC label


  const copyToClipboard = () => {
    if (review?.content) {
      navigator.clipboard.writeText(review.content);
    }
    toast.success('Copied to clipboard');
  };

  const downloadReviewAsPDF = () => {
    if (review?.content && review.employee) {
      generatePDF(
        review.content,
        {
          id: review.employee.id,
          name: review.employee.name,
          position: review.employee.position,
          department: review.employee.department,
          email: review.employee.email,
          status: 'Active', // Default status
          image_url: undefined
        },
        formatDate(review.review_date),
        'HR Manager' // Default reviewer name
      );
    }
  };

  const downloadReviewAsWord = () => {
    if (review?.content && review.employee) {
      generateWord(
        review.content,
        {
          id: review.employee.id,
          name: review.employee.name,
          position: review.employee.position,
          department: review.employee.department,
          email: review.employee.email,
          status: 'Active', // Default status
          image_url: undefined
        },
        formatDate(review.review_date),
        'HR Manager' // Default reviewer name
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading review details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !review) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg flex items-center">
            <XCircle className="w-6 h-6 mr-3" />
            <div>
              <h2 className="font-semibold text-lg">Error</h2>
              <p>{error || 'Review not found'}</p>
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/dashboard/reviews')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> 
              Back to Reviews
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/dashboard/reviews')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> 
              Back to Reviews
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Review Details</h1>
          </div>
          
          <div className="flex items-center gap-2">
        
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-4 py-2 border border-transparent bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{review.employee?.name || 'Unknown Employee'}</h2>
              <p className="text-gray-600">{review.template?.name || 'Custom Review'}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                review.status === 'Completed' ? 'bg-green-100 text-green-800' :
                review.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {review.status}
              </span>
              <div className="mt-2 text-sm text-gray-500">
                {review.status !== 'Completed' && (
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => handleStatusChange('In Progress')}
                      className={`text-xs px-2 py-1 rounded ${
                        review.status === 'In Progress' 
                          ? 'bg-yellow-200 text-yellow-800 cursor-default' 
                          : 'bg-gray-100 hover:bg-yellow-100'
                      }`}
                      disabled={review.status === 'In Progress'}
                    >
                      Mark In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange('Completed')}
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-green-100"
                    >
                      Mark Complete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start">
              <User className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{review.employee?.position || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Building className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{review.employee?.department || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Review Date</p>
                <p className="font-medium">{formatDate(review.review_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Review content */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Review Content</h3>
            
            {review.content && (
              <div className="flex space-x-2">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 text-[#008080] hover:text-[#008080]  rounded "
                  title="Copy to clipboard"
                >
                  <Copy className="w-[40px] h-[40px]" />
                </button>
             
                <button 
                  onClick={downloadReviewAsPDF}
                  className="p-2 text-[#008080] hover:text-[#008080]  rounded "
                  title="Download as PDF"
                >
                  <div className="relative">
                  <File className="w-[40px] h-[40px]" />
                  <span className="text-[10px] absolute bottom-[10px] right-[9px]">PDF</span>
                  </div>
                </button>
{/*              
                <button 
                  onClick={downloadReviewAsWord}
                  className="p-2 text-[#008080] hover:text-[#008080]  rounded "
                  title="Download as Word document"
                >
<div className="relative">
                    <File className="w-[40px] h-[40px]" />
                    <span className="text-[10px] absolute bottom-[10px] right-[9px]">DOC</span>
                </div>
                </button> */}
              </div>
            )}
          </div>
          
          {review.content ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 overflow-auto max-h-[600px]">
              <MarkdownRenderer content={review.content} />
            </div>
          ) : review.fieldValues && review.fieldValues.length > 0 ? (
            <div className="space-y-6">
              {review.fieldValues.map(item => (
                <div key={item.id} className="border-b pb-4">
                  <h4 className="font-medium mb-1">{item.field.name}</h4>
                  {item.field.description && (
                    <p className="text-sm text-gray-500 mb-2">{item.field.description}</p>
                  )}
                  <div className="bg-gray-50 p-3 rounded">
                    <p>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No review content available.</p>
          )}
        </div>

        {/* Review metadata */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(review.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(review.updated_at)}</p>
              </div>
            </div>
            
            {review.template && (
              <div className="flex items-start md:col-span-2">
                <FileText className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Review Template</p>
                  <p className="font-medium">{review.template.name}</p>
                  {review.template.description && (
                    <p className="text-sm text-gray-500 mt-1">{review.template.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Delete Review</h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center min-w-[80px]"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 