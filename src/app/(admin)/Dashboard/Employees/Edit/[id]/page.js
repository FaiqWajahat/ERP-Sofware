'use client'

import DashboardPageHeader from '@/Components/DashboardPageHeader'
import EditEmployee from '@/Components/EditEmployee';
import { useParams } from 'next/navigation';
import React from 'react'



const Page = () => {
  
 const params = useParams();
  const employeeId = params?.id;


  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Employees",
      href: "/Dashboard/Employees",
    },
    {
      name: "Edit",
      href: `/Dashboard/Employees/Edit/${employeeId}`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Edit Employee`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
       <EditEmployee/>
      </div>
    </>
  )
}

export default Page