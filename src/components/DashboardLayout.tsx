import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Layout, FileText, Users, Settings, Menu, CreditCard, UserPlus ,LogOut} from 'lucide-react';
import logo from '../../assets/images/APPRAZE.svg';

const sidebarItems = [
  { icon: <Layout className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FileText className="w-5 h-5" />, label: 'Reviews', path: '/dashboard/reviews' },
  { icon: <Users className="w-5 h-5" />, label: 'Employees', path: '/dashboard/employees' },
  { icon: <UserPlus className="w-5 h-5" />, label: 'Team Members', path: '/dashboard/team' },
  { icon: <CreditCard className="w-5 h-5" />, label: 'Billing', path: '/dashboard/billing' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' }
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30 h-[100vh]
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
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg mb-1 ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
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
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;