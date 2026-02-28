'use client'
import AddEmployee from '@/Components/AddEmployee';
import AddSalaryList from '@/Components/AddSalaryList';
import DashboardPageHeader from '@/Components/DashboardPageHeader'
import React from 'react'



const Page = () => {
  

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Salary",
      href: "/Dashboard/Salary",
    },
    {
      name: "Add",
      href: `/Dashboard/Salary/Add`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Add Salary List`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
   <AddSalaryList/>
      </div>
    </>
  )
}

export default Page