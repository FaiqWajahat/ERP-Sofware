'use client';
import React, { useEffect, useState } from 'react';
import BrandLoader from '@/Components/BrandLoader';
import BreadCrumps from '@/Components/BreadCrumps';
import DashboardTopStats from '@/Components/DashboardTopStats';
import SalesChart from '@/Components/SalesChart';
import Calender from '@/Components/Calender';
import RecentOrders from '@/Components/RecentOrders';

const Page = () => {
  const breadData = [
    { name: "Dashboard", href: "/Dashboard" }
  ];

  const [loading, setLoading] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const visitedBefore = sessionStorage.getItem("hasVisited");

    if (!visitedBefore) {
      sessionStorage.setItem("hasVisited", "true");
      setHasVisited(false); // First visit
    } else {
      setHasVisited(true); // Already visited
      setLoading(false);   // Skip loader if already visited
    }

    // Show loader for 3 sec on first visit
    if (!visitedBefore) {
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading && !hasVisited) {
    return <BrandLoader />;
  }

  return (
    <>
   


      <div className="flex items-center justify-between mb-4 w-full ">
        <h2 className="text-xl font-medium">Dashboard</h2>
        <BreadCrumps breadData={breadData} />
      </div>
      <div className=''>
 <DashboardTopStats />
      </div>
     
      <div className='mt-12 grid grid-cols-12  gap-4  overflow-hidden my-auto'>
        <div className=' col-span-12 lg:col-span-8 '>
         <RecentOrders/>
        </div>
         <div className=' col-span-12 lg:col-span-4'>
          <Calender/>
        </div>
      </div>

    
      <div className='mt-12   w-full'>
        
       <SalesChart/>
       
         
      </div>
  
    </>
  );
};

export default Page;
