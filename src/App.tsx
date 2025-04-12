import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Reviews from './pages/Reviews';
import ReviewDetail from './pages/ReviewDetail';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import TeamMembers from './pages/TeamMembers';
import InvitePage from './pages/InvitePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/dashboard/reviews" element={<AuthGuard><Reviews /></AuthGuard>} />
        <Route path="/dashboard/reviews/:reviewId" element={<AuthGuard><ReviewDetail /></AuthGuard>} />
        <Route path="/dashboard/employees" element={<AuthGuard><Employees /></AuthGuard>} />
        <Route path="/dashboard/team" element={<AuthGuard><TeamMembers /></AuthGuard>} />
        <Route path="/dashboard/billing" element={<AuthGuard><Billing /></AuthGuard>} />
        <Route path="/dashboard/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        <Route path="/invite" element={<InvitePage />} />
      </Routes>
    </Router>
  );
}

export default App;