import React from 'react'
import OrdersTable from './OrdersTable'

const RecentOrders = () => {



  return (
   <div className="w-full bg-base-100 rounded-xl overflow-x-auto shadow-md p-4 lg:p-6">
    <h3 className='text-lg font-semibold mb-6'>Recent Projects</h3>
    <OrdersTable />
   </div>
  )
}

export default RecentOrders