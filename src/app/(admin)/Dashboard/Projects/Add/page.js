'use client'
import AddAsset from '@/Components/AddAsset';
import AddEmployee from '@/Components/AddEmployee';
import AddProject from '@/Components/AddProject';
import DashboardPageHeader from '@/Components/DashboardPageHeader'
import React from 'react'



const Page = () => {
  

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Projects",
      href: "/Dashboard/Projects",
    },
    {
      name: "Add",
      href: `/Dashboard/Projects/Add`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Add Project`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
       <AddProject/>
      </div>
    </>
  )
}

export default Page