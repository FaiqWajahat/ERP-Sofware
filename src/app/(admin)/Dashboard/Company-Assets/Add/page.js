'use client'
import AddAsset from '@/Components/AddAsset';
import AddEmployee from '@/Components/AddEmployee';
import DashboardPageHeader from '@/Components/DashboardPageHeader'
import React from 'react'



const Page = () => {
  

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Assets",
      href: "/Dashboard/Company-Assets",
    },
    {
      name: "Add",
      href: `/Dashboard/Company-Assets/Add`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Add Employee`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
       <AddAsset/>
      </div>
    </>
  )
}

export default Page