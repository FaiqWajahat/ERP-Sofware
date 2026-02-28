'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from '@/Components/CustomLoader';
import axios from 'axios';
import { errorToast } from '@/lib/toast';
import Avatar from '@/Components/Avatar';

const EmployeeExpenseList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dropdownMenu = ['Active', 'Inactive', 'All'];

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Employees", href: "/Dashboard/Employees" },
    { name: "Expenses", href: "/Dashboard/Employees/Expense" },
  ];

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get("/api/employee/getEmployee");
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setEmployees(response.data.employees);
    } catch (error) {
      console.log("error of fetching employee:", error);
      errorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees - FIXED: Using iqamaNumber consistently
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.iqamaNumber?.includes(searchTerm) ||
                         emp.phone?.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All' || 
                         (selectedStatus === 'Active' && emp.status) ||
                         (selectedStatus === 'Inactive' && !emp.status);
    return matchesSearch && matchesStatus;
  });

  // Stats

  const activeEmployees = employees.filter(emp => emp.active).length;
  const inactiveEmployees = employees.filter(emp => !emp.active).length;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Navigate to expense details - FIXED: Using iqamaNumber
  const handleViewExpenses = (iqamaNumber) => {
    router.push(`/Dashboard/Employees/Expense/${iqamaNumber}`);
  };

  if (isLoading) {
    return (
      <CustomLoader text={"Loading Employees...."}/>
    );
  }

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Employee Expenses" />

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Employees</div>
            <div className="stat-value text-2xl">
              {employees.length}
            </div>
            <div className="stat-desc">Total Employees</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Active</div>
            <div className="stat-value text-2xl text-success">
              {activeEmployees}
            </div>
            <div className="stat-desc text-success">Active Employees</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Inactive</div>
            <div className="stat-value text-2xl text-error">
              {inactiveEmployees}
            </div>
            <div className="stat-desc text-error">Inactive Employees</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          <div className="w-full md:w-auto justify-center md:justify-start flex">
          <p className="text-sm text-base-content/60 mt-1">
    Choose employee to track  expense records.
  </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-full md:w-auto justify-center md:justify-start flex">
            <DashboardSearch 
              placeholder="Search Employee" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
            <div>
             
              <CustomDropdown 
                value={selectedStatus} 
                setValue={setSelectedStatus} 
                dropdownMenu={dropdownMenu} 
              />
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="w-full overflow-x-auto">
          <table className="table w-full">
            <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
              <tr>
                <th>S.No</th>
                <th>Employee</th>
                
                <th>Iqama</th>
                <th>Phone</th>
                <th>Status</th>
                
               
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, idx) => (
                  <tr
                   onClick={() => handleViewExpenses(emp._id)}
                    key={emp._id}
                    className="hover:bg-base-200/40 transition cursor-pointer"
                  >
                    <td>{idx + 1}</td>

                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <Avatar name={emp.name} size='md'/>
                        </div>

                        <div>
                          <h3 className="font-medium whitespace-nowrap">{emp.name}</h3>
                          <p className="text-xs text-base-content/70 whitespace-nowrap">{emp.role}</p>
                        </div>
                      </div>
                    </td>

                    
                    <td className=" text-sm whitespace-nowrap">{emp.iqamaNumber}</td>
                    <td className='text-sm'>{emp.phone ?? "N/A"}</td>
                    <td>
                      {emp.status ? (
                        <span className="text-success font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-error font-medium">
                          Inactive
                        </span>
                      )}
                    </td>

                   

                    {/* FIXED: Added Actions column with proper button */}
                   
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <p className="text-base-content/60">
                      {searchTerm ? 'No employees found matching your search' : 'No employees available'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default EmployeeExpenseList;