'use client'
import React from 'react'
import BreadCrumps from './BreadCrumps';

const DashboardPageHeader = ({heading,breadData}) => {
  return (
    <div className='flex flex-col md:flex-row items-center  justify-between mb-4 w-full px-2 '>
      <h2 className=' text-xl font-medium'>{heading}</h2>
      <BreadCrumps breadData={breadData}/>
    </div>
  )
}

export default DashboardPageHeader;