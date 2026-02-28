'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { errorToast, successToast } from '@/lib/toast';

// --- Form Component ---
function ResetPasswordForm() {
  const [token, setToken] = useState(null);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  // Visibility toggles for UX consistency with Login page
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get token from URL on client side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get('token'));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
     errorToast('Invalid link. Please request a new one.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
     errorToast('Passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
     errorToast('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
   

    try {
      const response = await axios.post('/api/user/reset-password', {
        token,
        newPassword: passwords.newPassword,
      });

      if (response.data.success) {
      
        successToast('Password successfully updated!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
       
       errorToast(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
     
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
     errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="w-full mb-8 flex justify-center">
        <img src="/logo.png" alt="Logo" width={160} height={160} className="object-contain" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Set New Password</h2>
        <p className="text-sm text-gray-600 mt-1">
          Please enter your new password below.
        </p>
      </div>

      {/* Token Warning */}
      {!token && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Missing reset token. Please use the link from your email.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            {/* Lock Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />

            {/* Toggle Visibility */}
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            {/* Lock Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            />

             {/* Toggle Visibility */}
             <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white text-sm font-semibold py-2.5 rounded shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Updating...
            </span>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}

// --- Main Page Component ---
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Side Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
          alt="Construction Site"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-10 bg-white">
        <Suspense fallback={
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}