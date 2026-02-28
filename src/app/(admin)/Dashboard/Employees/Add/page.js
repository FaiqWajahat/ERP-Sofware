'use client'
import AddEmployee from '@/Components/AddEmployee';
import DashboardPageHeader from '@/Components/DashboardPageHeader'
import React from 'react'



const Page = () => {
  

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Employees",
      href: "/Dashboard/Employees",
    },
    {
      name: "Add",
      href: `/Dashboard/Employees/Add`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Add Employee`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <AddEmployee/>
      </div>
    </>
  )
}

export default Page