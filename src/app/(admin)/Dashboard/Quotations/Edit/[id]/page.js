'use client'

import DashboardPageHeader from '@/Components/DashboardPageHeader'
import EditEmployee from '@/Components/EditEmployee';
import EditQuotation from '@/Components/EditQuotation';
import { useParams } from 'next/navigation';
import React from 'react'



const Page = () => {
  
 const params = useParams();
  const employeeId = params?.id;


  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Quotations",
      href: "/Dashboard/Quotations",
    },
    {
      name: "Edit",
      href: `/Dashboard/Quotations/Edit/${employeeId}`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Edit Quotation`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
     <EditQuotation/>
      </div>
    </>
  )
}

export default Page