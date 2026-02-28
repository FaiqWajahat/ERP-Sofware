'use client'

import CustomLoader from "@/Components/CustomLoader";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
// I will provide the code for this Table component below
import SalaryListTable from "@/Components/SalaryListTable"; 
import { errorToast } from "@/lib/toast";
import axios from "axios";
import { Plus } from "lucide-react";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";

const Page = () => {
  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Salary Sheets", href: "/Dashboard/Salary" },
  ];

  const [salaryLists, setSalaryLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    getSalaryLists();
    console.log("Fetched Slary list , ", salaryLists);
    
  }, []);

  const getSalaryLists = async () => {
    setIsLoading(true);
    try {
      // Assuming you will create this GET endpoint
      const response = await axios.get("/api/salary/salary-list"); 
      
      // Adjust this based on your actual API response structure
      // Example: { message: "...", data: [...] }
      const data = response.data.data || response.data.salaryLists || []; 
      setSalaryLists(data);
     
      
    } catch (error) {
      console.log("Error fetching salary lists:", error);
      errorToast(error.response?.data?.message || "Failed to load salary sheets");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deletion
  const handleDeleteList = (listId) => {
    setSalaryLists((prev) => prev.filter((item) => item._id !== listId));
  };

  // Filter based on search query (Project Name or Foreman Name)
  const filteredLists = useMemo(() => {
    let filtered = salaryLists;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => 
        item.projectName?.toLowerCase().includes(query) ||
        item.foremanName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [salaryLists, searchQuery]);

  // Calculate Stats
  const stats = useMemo(() => {
    const totalSheets = salaryLists.length;
    // Count unique projects
    const uniqueProjects = new Set(salaryLists.map(item => item.projectId)).size;
    // Count unique foremen
    const uniqueForemen = new Set(salaryLists.map(item => item.foremanId)).size;

    return { totalSheets, uniqueProjects, uniqueForemen };
  }, [salaryLists]);

  if (isLoading) return <CustomLoader text={"Loading salary sheets..."}/> 

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Salary Sheets`} />

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-primary">
              
            </div>
            <div className="stat-title text-xs">Total Sheets</div>
            <div className="stat-value text-2xl text-[var(--primary-color)]">
              {stats.totalSheets}
            </div>
            <div className="stat-desc">Generated Salary Lists</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-secondary">
             
            </div>
            <div className="stat-title text-xs">Projects</div>
            <div className="stat-value text-2xl text-secondary">
              {stats.uniqueProjects}
            </div>
            <div className="stat-desc">Active Sites</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-accent">
            
            </div>
            <div className="stat-title text-xs">Foremen</div>
            <div className="stat-value text-2xl text-accent">
              {stats.uniqueForemen}
            </div>
            <div className="stat-desc">Supervisors</div>
          </div>
        </div>

      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          
          {/* Search Bar */}
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <DashboardSearch 
              placeholder={"Search Project or Foreman"} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Add Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/Dashboard/Salary/Add")}
              className="btn btn-sm bg-[var(--primary-color)] text-white rounded-sm hover:bg-[var(--primary-color)]/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Salary Sheet
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <SalaryListTable 
            data={filteredLists} 
            isLoading={isLoading}
            onDelete={handleDeleteList}
          />
        </div>
      </div>
    </>
  );
};

export default Page;