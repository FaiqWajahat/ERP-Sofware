'use client'
import AddEmployee from '@/Components/AddEmployee';
import AddQuotation from '@/Components/AddQuotation';
import DashboardPageHeader from '@/Components/DashboardPageHeader'
import React from 'react'



const Page = () => {
  

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Quotations",
      href: "/Dashboard/Quotations",
    },
    {
      name: "Add",
      href: `/Dashboard/Quotations /Add`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Add Quotation`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
       <AddQuotation/>
      </div>
    </>
  )
}

export default Page