import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ReviewForm from '../components/ReviewForm';
import { supabase } from '../lib/supabase';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react';

interface Review {
  id: string;
  employee_id: string;
  review_date: string;
  status: string;
  employee: {
    id: string;
    name: string;
    position: string;
  } | null;
  template_id: string;
  template: {
    name: string;
  } | null;
}

function Reviews() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewReview, setShowNewReview] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch reviews from Supabase
  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            employee_id,
            review_date,
            status,
            template_id,
            employee:employees(id, name, position),
            template:review_templates(name)
          `)
          .order('review_date', { ascending: false });
        
        if (error) throw error;
        setReviews(data || []);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // Don't set error message here anymore
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReviews();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Navigate to review details
  const handleViewDetails = (reviewId: string) => {
    navigate(`/dashboard/reviews/${reviewId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Reviews</h1>
          <p className="text-gray-600">Manage and track employee performance reviews</p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            onClick={() => setShowNewReview(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Review
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* New Review Form */}
        {showNewReview ? (
          <div className="mb-8">
            <ReviewForm onClose={() => setShowNewReview(false)} />
          </div>
        ) : null}

        {/* Loading and error states */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <FileText className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No performance reviews yet</h3>
            <p className="text-gray-500 mb-6">Add your first performance review to get started with employee assessments.</p>
            <button 
              onClick={() => setShowNewReview(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a new performance review
            </button>
          </div>
        ) : (
          /* Review Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border p-4 hover:border-indigo-500 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{review.employee?.name || 'Unknown Employee'}</h3>
                    <p className="text-sm text-gray-500">{review.template?.name || 'Custom Review'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    review.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    review.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {review.status || 'Draft'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Due: {formatDate(review.review_date)}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {review.employee?.position || 'No position'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <button 
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    onClick={() => handleViewDetails(review.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Reviews;