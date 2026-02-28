'use client'
import {  PanelRightOpen } from 'lucide-react';
import Image from 'next/image';
import React from 'react'
import Logo from "../../public/logo.png"
import whiteLogo from "../../public/white-logo.png"

import  {useThemeStore} from "@/app/(admin)/Dashboard/Setting/Theme/page.js"

const DashboardSidebarHead = ({sidebarOpen ,setSidebarOpen}) => {

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
  
  return (
      <div className='flex w-full justify-between items-center     ' > 
    <Image src={logo || Logo} width={120} height={120} alt="Logo" className='ml-2 '/>
         <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className=" p-1.5 cursor-pointer hover:bg-base-300 rounded-md flex items-center justify-center"
        >
         
            <PanelRightOpen className=" cursor-pointer text-base-content w-5 h-5   stroke-[1.3px] " />
          
        </div>
        
      </div>
  )
}

export default DashboardSidebarHead