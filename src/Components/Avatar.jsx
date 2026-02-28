'use client'
import React from 'react'



  const Avatar = ({ name, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-10 h-10',
      lg: 'w-20 h-20'
    };

    const sizePixels = {
      sm: 48,
      md: 40,
      lg: 80
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name ?? 'NA'
    )}&background=random&size=${sizePixels[size]}&bold=true&format=svg`;

    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden ring-2 ring-base-300 ring-offset-base-100 ring-offset-2 shadow-md`}>
        <img 
          src={avatarUrl} 
          alt={name || 'Employee'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

   export default Avatar