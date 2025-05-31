import React, { useState, useEffect,useLayoutEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logo from '../../../assets/images/APPRAZE.svg';


export default function ResetPassword() {
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const type = searchParams.get('type');


 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [token, setToken] = useState<string | null>(null);
 const [formData, setFormData] = useState({
   password: '',
   confirmPassword: ''
 });


 useLayoutEffect(() => {
   const url = new URL(window.location.href);
   const token = url.searchParams.get('token');
   console.log('token', token);
   setToken(token);
 }, []);


//   useEffect(() => {
//     // Verify the token is present
//     if (!token ) {
//       setError('Invalid or expired reset link. Please request a new password reset.');
//     }
//   }, [token, type]);


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsLoading(true);
   setError(null);
   setSuccess(null);


   try {
     // Validate passwords match
     if (formData.password !== formData.confirmPassword) {
       setError('Passwords do not match');
       return;
     }


     // Validate password strength
     if (formData.password.length < 6) {
       setError('Password must be at least 6 characters long');
       return;
     }


     const { error } = await supabase.auth.updateUser({
       password: formData.password
     });


     if (error) throw error;


     setSuccess('Password has been reset successfully');
     // Redirect to login after 2 seconds
     setTimeout(() => {
       navigate('/auth/login');
     }, 2000);


   } catch (err) {
     setError(err instanceof Error ? err.message : 'An error occurred while resetting password');
   } finally {
     setIsLoading(false);
   }
 };


 return (
   <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
     <div className="sm:mx-auto sm:w-full sm:max-w-md">
       <div className="flex justify-center mb-4">
         <img src={logo} alt="Appraze" className="h-20 w-20 text-teal-600" />
       </div>
       <h2 className="text-center text-4xl font-semibold tracking-tight text-navy-900 mb-2">
         Reset your password
       </h2>
       <p className="text-center text-md text-gray-600 mb-2">
         Enter your new password below
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


         {success && (
           <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
             <CheckCircle className="w-5 h-5 mr-2" />
             {success}
           </div>
         )}


         <form className="space-y-6" onSubmit={handleSubmit}>
           <div>
             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
               New Password
             </label>
             <div className="mt-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Lock className="h-5 w-5 text-teal-400" />
               </div>
               <input
                 id="password"
                 name="password"
                 type="password"
                 required
                 value={formData.password}
                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                 className="appearance-none block w-full pl-10 px-3 py-3 border border-teal-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                 placeholder="Enter new password"
               />
             </div>
           </div>


           <div>
             <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
               Confirm New Password
             </label>
             <div className="mt-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Lock className="h-5 w-5 text-teal-400" />
               </div>
               <input
                 id="confirmPassword"
                 name="confirmPassword"
                 type="password"
                 required
                 value={formData.confirmPassword}
                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                 className="appearance-none block w-full pl-10 px-3 py-3 border border-teal-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                 placeholder="Confirm new password"
               />
             </div>
           </div>


           <div>
             <button
               type="submit"
               disabled={isLoading }
               className="w-full flex justify-center py-3 px-4 rounded-full font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-colors"
             >
               {isLoading ? (
                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 'Reset Password'
               )}
             </button>
           </div>
         </form>
       </div>
     </div>
   </div>
 );
}
