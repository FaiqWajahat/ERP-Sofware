'use client'
import { ChevronUp, LogOut, Settings, User as UserIcon } from 'lucide-react'
import React from 'react'
import { useUserStore } from '@/stores/userStore'
import Link from 'next/link'
import axios from 'axios'
import { useLanguage } from '@/stores/language'

import { errorToast } from '@/lib/toast'

const DashboardSidebarBottom = () => {
  const {t}= useLanguage();
  const { user, setUser } = useUserStore()
  const [loading, setLoading] = React.useState(false)

  // Fallback values in case store is empty during hydration
  const userName = user?.name || "User Name"
  const userEmail = user?.email || "user@example.com"
  const userImage = user?.profilePic || "/profile.jpg"


  const handleLogout = async() => {
    
   try {
     setLoading(true);
     const response = await axios.post('/api/user/logout');
     if (response.data.success) {
       setUser(null); 
       
       window.location.href = '/';
     } 

     
     
     else {
   errorToast("Logout failed. Please try again.");
     }

   }catch (error) {
     console.error("Logout failed:", error);
   } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full bg-base-200/70 py-2  border-t border-base-300">
     
      <div className="dropdown dropdown-top w-full">
        
       
        <div 
          tabIndex={0} 
          role="button" 
          className="flex items-center w-full p-2 gap-3 rounded-lg hover:bg-base-200 transition-all duration-200 group"
        >
          {/* Avatar */}
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring-1 ring-base-content/10">
              <img
                alt="User Profile"
                src={userImage}
                className="object-cover"
              />
            </div>
          </div>

          {/* User Info (with truncation) */}
          <div className="flex-1 min-w-0 flex flex-col items-start">
            <span className="text-sm font-semibold text-base-content truncate w-full">
              {userName}
            </span>
            <span className="text-xs text-base-content/60 truncate w-full">
              {userEmail}
            </span>
          </div>

          {/* Icon */}
          <div className="text-base-content/50  cursor-pointer group-hover:text-[var(--primary-color)] transition-colors">
            <ChevronUp size={20} />
          </div>
        </div>

        {/* DROPDOWN MENU 
          1. w-full: Matches width of sidebar
          2. mb-2: Adds small gap between trigger and menu
        */}
        <ul 
          tabIndex={0} 
          className="dropdown-content left-32 menu bg-base-100 rounded-box z-[50] w-40 p-2 shadow-md border border-base-200 mb-2"
        >
         

          <li>
            <Link href="/Dashboard/Profile" className="flex items-center gap-2 py-3">
              <UserIcon size={16} />
              {t['Profile']}
            
            </Link>
          </li>
         
          
          <div className="divider my-1"></div>
          
          <li>
            <button disabled={loading}
              onClick={handleLogout} className="flex items-center gap-2 py-3 text-error hover:bg-error/10">
              <LogOut size={16} />
              {loading ? 'Logging out...' : t['Logout']}
            </button>
          </li>
        </ul>
        
      </div>
    </div>
  )
}

export default DashboardSidebarBottom