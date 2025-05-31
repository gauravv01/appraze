import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logo from '../../../assets/images/APPRAZE.svg';


export default function Login() {
 const navigate = useNavigate();
 const location = useLocation();
 const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';


 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [formData, setFormData] = useState({
   email: '',
   password: ''
 });


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsLoading(true);
   setError(null);


   try {
     const {data, error } = await supabase.auth.signInWithPassword({
       email: formData.email,
       password: formData.password
     });


     if (error) throw error;
     localStorage.setItem('userId', data.user.id);
     navigate(from);
   } catch (err) {
     setError(err instanceof Error ? err.message : 'An error occurred during login');
   } finally {
     setIsLoading(false);
   }
 };


 return (
   <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
     <div className="sm:mx-auto sm:w-full sm:max-w-md">
       <div className="flex justify-center mb-4">
         <Link to="/" className="flex items-center">
           <img src={logo} alt="Appraze" className="h-20 w-20 text-teal-600" />
         </Link>
       </div>
       <h2 className="text-center text-4xl font-semibold tracking-tight text-navy-900 mb-2">
         Sign in to your account
       </h2>
       <p className="text-center text-md text-gray-600 mb-2">
         Or{' '}
         <Link to="/auth/signup" className="font-medium text-teal-600 hover:text-teal-500">
           create a new account
         </Link>
       </p>
     </div>


     <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
       <div className="bg-white/80 py-10 px-8 shadow-xl border border-teal-100 rounded-2xl sm:px-10">
         {error && (
           <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
             <AlertCircle className="w-5 h-5 mr-2" />
             {error}
           </div>
         )}


         <form className="space-y-6" onSubmit={handleSubmit}>
           <div>
             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
               Email address
             </label>
             <div className="mt-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Mail className="h-5 w-5 text-teal-400" />
               </div>
               <input
                 id="email"
                 name="email"
                 type="email"
                 autoComplete="email"
                 required
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 className="appearance-none block w-full pl-10 px-3 py-3 border border-teal-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                 placeholder="Enter your email"
               />
             </div>
           </div>


           <div>
             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
               Password
             </label>
             <div className="mt-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Lock className="h-5 w-5 text-teal-400" />
               </div>
               <input
                 id="password"
                 name="password"
                 type="password"
                 autoComplete="current-password"
                 required
                 value={formData.password}
                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 className="appearance-none block w-full pl-10 px-3 py-3 border border-teal-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                 placeholder="Enter your password"
               />
             </div>
           </div>


           <div className="flex items-center justify-between">
             <div className="text-sm">
               <Link to="/auth/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
                 Forgot your password?
               </Link>
             </div>
           </div>


           <div>
             <button
               type="submit"
               disabled={isLoading}
               className="w-full flex justify-center py-3 px-4 rounded-full font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-colors"
             >
               {isLoading ? (
                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 'Sign in'
               )}
             </button>
           </div>
         </form>
       </div>
     </div>
   </div>
 );
}
