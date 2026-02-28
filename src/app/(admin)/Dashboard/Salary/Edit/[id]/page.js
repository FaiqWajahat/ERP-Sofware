'use client'

import DashboardPageHeader from '@/Components/DashboardPageHeader'
import EditSalaryList from '@/Components/EditSalaryList';
import React from 'react'
import { useParams } from 'next/navigation';


const Page = () => {
  const params = useParams();
  const id = params?.id;
  

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    {
      name: "Salary",
      href: "/Dashboard/Salary",
    },
    {
      name: "Edit",
      href: `/Dashboard/Salary/Edit/${id}`,
    }
  ];

  
  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Edit Salary List`} />
      
      <div className="w-full bg-base-100 rounded-xl shadow-lg overflow-hidden">
      <EditSalaryList/>
      </div>
    </>
  )
}

export default Page