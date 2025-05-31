import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Brain,
  Layout,
  FileText,
  Users,
  Settings,
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  Menu,
  CreditCard,
  UserPlus,
  LogOut
} from 'lucide-react';
import logo from '../../assets/images/APPRAZE.svg';

interface ReviewTemplate {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

const sidebarItems = [
  { icon: <Layout className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reviews', path: '/dashboard/reviews' },
  { icon: <Users className="w-5 h-5" />, label: 'Employees', path: '/dashboard/employees' },
  { icon: <UserPlus className="w-5 h-5" />, label: 'Team Members', path: '/dashboard/team' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'Billing', path: '/dashboard/billing' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' }
];

function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [reviewTemplates, setReviewTemplates] = useState<ReviewTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch review templates from Supabase
  useEffect(() => {
    async function fetchReviewTemplates() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('review_templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReviewTemplates(data || []);
      } catch (err) {
        setError('Failed to fetch review templates');
        console.error('Error fetching templates:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReviewTemplates();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-white border-r
      `}>
          <Link to="/" className="flex items-center justify-center">
          <img src={logo} alt="Apprai.io" className="h-24 w-24 text-primary-600" />
          </Link>
        <nav className="p-4">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg mb-1"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div onClick={() => {
          navigate('/auth/login');
          localStorage.removeItem('userId');
          setIsMobileMenuOpen(false);
        }} className="text-gray-600 hover:bg-gray-50 p-4 flex items-center space-x-2 absolute bottom-0 w-full hover:text-primary-600 cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 ml-8 lg:ml-0">Dashboard</h1>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                className="p-4 bg-white rounded-lg border hover:border-primary-500 transition-colors"
                onClick={() => navigate('/dashboard/reviews')}
              >
                <PlusCircle className="w-6 h-6 text-primary-600 mb-2" />
                <h3 className="font-medium">New Review</h3>
                <p className="text-sm text-gray-500">Create a new performance review</p>
              </button>
              <button
                className="p-4 bg-white rounded-lg border hover:border-primary-500 transition-colors"
                onClick={() => navigate('/dashboard/employees')}
              >
                <Users className="w-6 h-6 text-primary-600 mb-2" />
                <h3 className="font-medium">Team</h3>
                <p className="text-sm text-gray-500">View team members</p>
              </button>
            </div>
          </div>

          {/* Recent Reviews */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : reviewTemplates.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No review templates found. Create your first template to get started.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviewTemplates.map((template) => (
                      <tr key={template.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            template.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            template.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {template.status || 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(template.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-500">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;