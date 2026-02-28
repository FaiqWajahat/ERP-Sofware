'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import axios from 'axios';
// Ensure these match your actual export names in lib/toast
import { errorToast, sucessToast } from '@/lib/toast';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      errorToast('Please fill both fields');
      return;
    }

    // 1. Start Loading
    setIsLoading(true);

    try {
      const response = await axios.post('/api/user/login', {
        email,
        password,
      });

      // Handle both spellings just in case your backend varies
      const success = response.data.sucess || response.data.success;

      if (!success) {
        errorToast(response.data.message);
        // 2. Stop loading ONLY if API returns failure
        setIsLoading(false); 
        return;
      }

      // 3. Success Case:
      // We do NOT set isLoading(false) here. 
      // The loader will spin until the page unmounts/navigates.
      
      // Optional: Add a small delay if you want the user to see the success toast before the screen flashes
      // await new Promise((resolve) => setTimeout(resolve, 500)); 
      
      sucessToast('Login successful');
      router.push('/Dashboard');
        
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      errorToast(errorMessage);
      // 4. Stop loading on Catch Error
      setIsLoading(false);
    } 
    // 5. REMOVED the 'finally' block so loading stays true on success
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      
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
            <Image src="/logo.png" alt="Logo" width={160} height={160} className="object-contain" />
          </div>

          {/* Welcome */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter your credentials to access the system
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="email@company.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button 
                onClick={() => router.push('/Forgot-Password')}
                type="button" 
                className="text-xs font-medium text-[var(--primary-color)] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--primary-color)] cursor-pointer text-white text-sm font-semibold py-2.5 rounded shadow hover:bg-opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}