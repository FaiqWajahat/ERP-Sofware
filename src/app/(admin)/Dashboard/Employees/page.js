'use client'

import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from "@/Components/CustomLoader";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import EmployeeTable from "@/Components/EmployeeTable";
import { errorToast } from "@/lib/toast";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";

const Page = () => {
  const dropdownMenu = ['Active', 'Inactive', 'All'];

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Employees Profile", href: "/Dashboard/Employees" },
  ];

  const [employee, setEmployee] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    getEmployee();
  }, []);

  const getEmployee = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/employee/getEmployee");
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setEmployee(response.data.employees);
    } catch (error) {
      console.log("error of fetching employee:", error);
      errorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = (employeeId) => {
    // Remove employee from state immediately for better UX
    setEmployee((prevEmployees) => 
      prevEmployees.filter((emp) => emp._id !== employeeId)
    );
    // Optionally refetch to ensure sync with backend
    // getEmployee();
  };

  // Filter employees based on status and search query
  const filteredEmployees = useMemo(() => {
    let filtered = employee;

    // Filter by status
    if (selectedStatus === 'Active') {
      filtered = filtered.filter((emp) => emp.status === true);
    } else if (selectedStatus === 'Inactive') {
      filtered = filtered.filter((emp) => emp.status === false);
    }
    // 'All' shows everything, no filter needed

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((emp) => 
        emp.name?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.phone?.toLowerCase().includes(query) ||
        emp.role?.toLowerCase().includes(query) ||
        emp.nationality?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [employee, selectedStatus, searchQuery]);

  if (isLoading) return <CustomLoader text={"Loading employees..."}/> 

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Employees Profile`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Employees</div>
            <div className="stat-value text-2xl">
              {employee.length}
            </div>
            <div className="stat-desc">Total Employees</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Active</div>
            <div className="stat-value text-2xl text-success">
              {employee.filter((emp) => emp.status === true).length}
            </div>
            <div className="stat-desc text-success">Active Employees</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Inactive</div>
            <div className="stat-value text-2xl text-error">
              {employee.filter((emp) => emp.status === false).length}
            </div>
            <div className="stat-desc text-error">Inactive Employees</div>
          </div>
        </div>
      </div>

      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <DashboardSearch 
              placeholder={"Search Employee"} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label className="font-medium text-sm mr-2">Status:</label>
              <CustomDropdown 
                value={selectedStatus} 
                setValue={setSelectedStatus} 
                dropdownMenu={dropdownMenu} 
              />
            </div>
            <button
              onClick={() => router.push("/Dashboard/Employees/Add")}
              className="btn btn-sm bg-[var(--primary-color)] text-white rounded-sm hover:bg-[var(--primary-color)]/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Employee
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <EmployeeTable 
            employees={filteredEmployees} 
            isLoading={isLoading}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </div>
      </div>
    </>
  );
};

export default Page;