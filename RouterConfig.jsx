import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

// Import dashboard components here
// For example:
// import Dashboard from './Dashboard';
// import Employees from './Employees';
// import Reviews from './Reviews';
// import Settings from './Settings';

const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              {/* Replace with your Dashboard component */}
              <div>Dashboard Component</div>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/employees" 
          element={
            <AuthGuard>
              {/* Replace with your Employees component */}
              <div>Employees Component</div>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/reviews" 
          element={
            <AuthGuard>
              {/* Replace with your Reviews component */}
              <div>Reviews Component</div>
            </AuthGuard>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <AuthGuard>
              {/* Replace with your Settings component */}
              <div>Settings Component</div>
            </AuthGuard>
          } 
        />
        
        {/* Redirect to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterConfig; 