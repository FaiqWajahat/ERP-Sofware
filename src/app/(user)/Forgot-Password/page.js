'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { errorToast, successToast } from '@/lib/toast';


export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      errorToast('Please enter your email address');
      return;
    }

    setIsLoading(true);
   

    try {
      const response = await axios.post('/api/user/forgot-password', {
        email,
      });

      if(!response.data.success)
      {
             errorToast(response.data.message || "someting went wrong")
             setIsLoading(false)
             return
      }

      
       
        successToast('Reset link sent! Please check your inbox.');
        setIsEmailSent(true);
        setEmail('');
      
    } catch (error) {
     
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Side Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1626885930974-4b69aa21bbf9?q=80&w=746&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Construction Site"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-10 bg-white">
        <div className="w-full max-w-sm">
          
          {/* Logo */}
                 <div className="w-full mb-8 flex justify-center">
                   {/* Ensure you have this logo in your public folder, or remove if not needed */}
                   <Image src="/logo.png" alt="Logo" width={160} height={160} className="object-contain" />
                 </div>

          {/* Conditional UI: Form or Success Message */}
          {!isEmailSent ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Forgot Password</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {"Enter your email address and we'll send you a link to reset your password."}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="email@company.com"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-right mt-1">
                  <Link href="/" className="text-xs font-medium text-[var(--primary-color)] hover:underline">
                    Back to Login
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--primary-color)] hover:[var(--primary-color)/80] cursor-pointer text-white text-sm font-semibold py-2.5 rounded shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

             
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">Check your email</h2>
              <p className="mt-2 text-sm text-gray-600">
                We have sent a password reset link to your email address.
              </p>
              <div className="mt-6">
                <Link href="/" className="text-sm font-medium text-[var(--primary-color)] hover:[var(--primary-color)]/80 hover:underline">
                  Return to Login
                </Link>
              </div>
              <button 
                onClick={() => setIsEmailSent(false)} 
                className="mt-4 text-xs text-gray-400 hover:underline"
              >
                Did not receive it? Try again 
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}