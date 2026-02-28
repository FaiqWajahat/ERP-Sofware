'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
      
      {/* Main Content Card */}
      <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl overflow-hidden text-center p-8 md:p-12 border border-base-300 relative">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-base-300 via-[var(--primary-color)] to-base-300"></div>

        {/* Icon Animation Wrapper */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-base-200 rounded-full animate-pulse opacity-50"></div>
          <div className="relative w-full h-full bg-base-200 rounded-full flex items-center justify-center ring-4 ring-base-100 shadow-inner">
            <FileQuestion className="w-10 h-10 text-base-content/40" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-base-100 rounded-full p-1.5 shadow-sm border border-base-200">
             <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl font-black text-base-content mb-2 tracking-tight">404</h1>
        
        <h2 className="text-xl font-bold text-base-content mb-3">
          Page Not Found
        </h2>
        
        <p className="text-sm text-base-content/60 leading-relaxed mb-8">
          The page you are looking for doesn't exist, has been moved, or the URL is incorrect.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => router.back()}
            className="btn btn-outline border-base-300 hover:border-base-content/20 hover:bg-base-200 hover:text-base-content flex-1 gap-2 font-normal"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button 
            onClick={() => router.push('/Dashboard')}
            className="btn bg-[var(--primary-color)] text-white hover:brightness-110 flex-1 gap-2 border-none shadow-md shadow-[var(--primary-color)]/20"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-base-content/40 font-medium">
        Construction Management System
      </div>
    </div>
  );
}