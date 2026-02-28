'use client';

import React from 'react'
import DashboardMenu from './DashboardMenu';
import DashboardSidebarHead from './DashboardSidebarHead';
import DashboardSidebarBottom from './DashboardSidebarBottom';
import DashboardMenuSmall from './DashboardMenuSmall';



const DashboardSidebar = ({sidebarOpen,setSidebarOpen}) => {
  return (
    <div className='w-full h-screen max-h-screen bg-base-100   flex flex-col justify-between pt-4  '>
       <div className='px-4 pb-1  flex-none'>
          <DashboardSidebarHead  sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
       </div>
        <div className='flex-1 w-full py-4  px-2  overflow-y-auto'>
           <div className='hidden md:block'>
            <DashboardMenu/>
           </div>
            <div className='block md:hidden'>
           <DashboardMenuSmall sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
           </div>
        </div>
          
          <div className='flex-none '>
           <DashboardSidebarBottom/>
          </div>
       
    </div>
  )
}

export default DashboardSidebar