import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logo from '../../../assets/images/APPRAZE.svg';


export default function ForgotPassword() {
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);
 const [email, setEmail] = useState('');


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setIsLoading(true);
   setError(null);


   try {
     const { error } = await supabase.auth.resetPasswordForEmail(email, {
       redirectTo: `${window.location.origin}/auth/reset-password`,
     });


     if (error) throw error;
     setSuccess(true);
   } catch (err) {
     setError(err instanceof Error ? err.message : 'An error occurred');
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
         Reset your password
       </h2>
       <p className="text-center text-md text-gray-600 mb-2">
         Or{' '}
         <Link to="/auth/login" className="font-medium text-teal-600 hover:text-teal-500">
           return to sign in
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


         {success ? (
           <div className="text-center">
             <div className="flex justify-center mb-4">
               <CheckCircle className="h-12 w-12 text-green-500" />
             </div>
             <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
             <p className="text-gray-600 mb-4">
               We've sent password reset instructions to {email}
             </p>
             <Link
               to="/auth/login"
               className="text-teal-600 hover:text-teal-500 font-medium"
             >
               Return to sign in
             </Link>
           </div>
         ) : (
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
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="appearance-none block w-full pl-10 px-3 py-3 border border-teal-100 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                   placeholder="Enter your email"
                 />
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
                   'Send reset instructions'
                 )}
               </button>
             </div>
           </form>
         )}
       </div>
     </div>
   </div>
 );
}
