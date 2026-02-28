"use client";

import { Menu,  LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import React from "react";

import { useUserStore } from "@/stores/userStore";
import axios from "axios";
import { useLanguage } from "@/stores/language";
import CustomDropdown from "./CustomDropdown";
import Logo from "../../public/logo.png"
import whiteLogo from "../../public/white-logo.png"

import  {useThemeStore} from "@/app/(admin)/Dashboard/Setting/Theme/page.js"

const DashboardHeader = ({ sidebarOpen, setSidebarOpen }) => {
const {theme}=useThemeStore();
    const [logo,setLogo] = React.useState(null);
  
    React.useEffect(() => {
      if(theme=="dark" || theme=="business" || theme=="night" || theme=="dracula" || theme=="luxury"  || theme== "forest" || theme== "synthwave" || theme=="coffee"){
        setLogo(whiteLogo);
      }
      else{
        setLogo(Logo);
      } 
    }, [theme]);
  

   const {lang, languages, setLang} = useLanguage();

  const { user, setUser } = useUserStore(); 
  const [loading, setLoading] = React.useState(false);


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
    <div className="navbar bg-base-100 shadow-sm px-3 sticky top-0 z-40">
      <div className="flex-none hover:bg-base-300 p-1 rounded-sm">
        <Menu 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="cursor-pointer text-base-content" 
        />
      </div>
      
      <div className="flex-1 ml-4">
        {/* Ensure you have a logo.png in your public folder */}
        <Image src={logo || Logo} alt="Logo" width={120} height={60} priority />
      </div>
      
      <div className="navbar-end gap-4">
        {/* Language Dropdown */}
         <CustomDropdown value={lang} setValue={setLang} dropdownMenu={languages} />
      
        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar ring-[var(--primary-color)] ring-offset-2 hover:ring-2 transition-all"
          >
            <div className="w-10 rounded-full">
              <img
                alt="User Profile"
                // Use dynamic user image or fallback
                src={user?.profilePic || "/profile.jpg"}
                className="object-cover"
              />
            </div>
          </div>
          
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[50] mt-3 w-52 p-2 shadow-lg border border-base-200"
          >
            {/* User Name Header */}
            <li className="menu-title px-4 py-2 text-base-content">
              {user?.name || "User"}
            </li>
            
           

            <li>
              <Link href="/Dashboard/Profile" className="justify-between py-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Profile
                </div>
                
              </Link>
            </li>
            
        
            
            <div className="divider my-0"></div>
            
            <li>
              <button disabled={loading} 
               onClick={handleLogout}  className="py-2 text-error hover:bg-error/10">
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                 { loading ? 'Logging out...' : 'Logout' }
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;