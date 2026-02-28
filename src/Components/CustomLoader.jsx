'use client'
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function CustomLoader({ text, brandName = "Seven Directios" }) {
  return (
    // changed from 'fixed h-screen' to 'absolute inset-0'
    <div className=" z-50 w-full flex items-center h-[calc(100vh-10vh)] justify-center bg-base-100 backdrop-blur-[2px] rounded-lg transition-all duration-300">
      
      <div className="flex flex-col items-center gap-3 p-4">
        
        {/* Spinner */}
        <div className="relative">
           {/* Subtle pulsing background behind spinner */}
           <div className="absolute inset-0 bg-[var(--primary-color)] rounded-full opacity-10 animate-ping"></div>
           <Loader2 className="w-8 h-8 text-[var(--primary-color)] animate-spin relative z-10" />
        </div>
        
        {/* Text Content */}
        <div className="text-center">
          <h2 className="text-sm font-bold text-base-content/80 tracking-wide uppercase">
            {brandName}
          </h2>
          {text && (
            <p className="text-xs text-[var(--primary-color)] font-medium mt-1 animate-pulse">
              {text}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}