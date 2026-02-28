'use client';
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Download,
  User,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Wallet,
  FileText 
} from "lucide-react";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import CustomDropdown from "@/Components/CustomDropdown";
import { warningToast } from "@/lib/toast";
import CustomLoader from "@/Components/CustomLoader";
import Avatar from "@/Components/Avatar";

export default function EmployeeSalaryTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Employee ID

  // Data States
  const [employee, setEmployee] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  
  // UI States
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // --- DATE LOGIC (Updated to YYYY-MM) ---
  const currentMonth = new Date().toISOString().slice(0, 7);
  const startOfYear = `${new Date().getFullYear()}-01`;
  
  const [fromDate, setFromDate] = useState(startOfYear);
  const [toDate, setToDate] = useState(currentMonth);

  // --- 1. Fetch Employee Details ---
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!id) return;
      setIsLoadingEmployee(true);
      try {
        const response = await axios.get(`/api/employee/getEmployee/${id}`);
        if (response.data.success) {
          setEmployee(response.data.employee);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setIsLoadingEmployee(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  // --- 2. Fetch Salary History ---
  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      warningToast("Please select both From and To months");
      return;
    }
    
    if (fromDate > toDate) {
        warningToast("From Month cannot be after To Month");
        return;
    }
    
    setHasSearched(true);
    setIsLoadingData(true);
    
    try {
      const response = await axios.get(`/api/salary/salary-list/${id}/employee`, {
        params: {
          from: fromDate,
          to: toDate
        }
      });

      if (response.data.success) {
        setSalaryHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching salary data:", error);
      setSalaryHistory([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // --- 3. Filtering Logic (UPDATED FOR 'SAVE') ---
  const filteredData = useMemo(() => {
    return salaryHistory.filter((record) => {
      // 1. Status Filter 
      const matchesStatus = filterStatus === "All" || 
                            (filterStatus === "Paid" && record.status === "paid") ||
                            (filterStatus === "Pending" && record.status === "pending") ||
                            (filterStatus === "Draft" && record.status === "draft" ); 
      
      // 2. Search Text
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        searchQuery === "" ||
        (record.projectName && record.projectName.toLowerCase().includes(searchLower)) ||
        (record.foremanName && record.foremanName.toLowerCase().includes(searchLower));
        
      return matchesStatus && matchesSearch;
    });
  }, [salaryHistory, filterStatus, searchQuery]);

  // --- 4. Statistics Calculation (UPDATED) ---
  const stats = useMemo(() => {
    const totalRecords = salaryHistory.length;
    
    const totalEarned = salaryHistory.reduce((sum, r) => sum + (Number(r.salary) || 0), 0);
    
    const totalPaid = salaryHistory
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + (Number(r.salary) || 0), 0);
      
    const totalPending = salaryHistory
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (Number(r.salary) || 0), 0);

    // New Stat for Drafts/Saved
    const totalSaved = salaryHistory
      .filter(r => r.status === 'draft')
      .reduce((sum, r) => sum + (Number(r.salary) || 0), 0);

    return { totalRecords, totalEarned, totalPaid, totalPending, totalSaved };
  }, [salaryHistory]);

  // --- 5. Format Currency ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount);
  };

  // --- 6. Export Handler ---
  const handleExport = () => {
    const csvContent = [
      ["Month", "Project", "Foreman", "Salary Amount", "Status"],
      ...filteredData.map(r => [
        new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 
        r.projectName || "N/A",
        r.foremanName || "N/A",
        r.salary,
        r.status
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${employee?.name || "Employee"}_salary_history.csv`;
    a.click();
  };

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Employees", href: "/Dashboard/Employees" },
    { name: "Salary History", href: "#" },
  ];

  if (isLoadingEmployee) {
    return <CustomLoader text={'Loading employee profile...'}/>;
  }

  if (!employee) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-error" />
        <h2 className="text-xl font-bold">Employee Not Found</h2>
        <button onClick={() => router.back()} className="btn btn-sm">Go Back</button>
      </div>
    );
  }

  return (
    <> 
    <DashboardPageHeader breadData={breadData} heading="Salary History" />
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Employee Profile Card --- */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
          <div className="flex items-center gap-4">
            <div className="avatar">
               <Avatar name={employee.name} size='lg'/>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-base-content">{employee.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-base-content/70">
                {employee.role && (
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{employee.role}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Iqama:</span>
                  <span className="font-mono">{employee.iqama || employee.iqamaNumber || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Base Salary:</span>
                  <span className="text-success font-bold">{formatCurrency(employee.salary || 0)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push("/Dashboard/Employees")}
              className="btn btn-sm btn-outline flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back 
            </button>
          </div>
        </div>

        {/* --- Filters & Search Control Bar --- */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
              
              {/* FROM MONTH INPUT */}
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <label className="font-medium text-xs text-base-content/80">From Month</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-base-content/40 pointer-events-none" />
                    <input 
                    type="month"
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)} 
                    max={toDate} 
                    className="pl-9 pr-3 py-2 border border-base-300 rounded-lg text-xs bg-base-100 w-full focus:outline-none focus:border-[var(--primary-color)]"
                    />
                </div>
              </div>

              {/* TO MONTH INPUT */}
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <label className="font-medium text-xs text-base-content/80">To Month</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-base-content/40 pointer-events-none" />
                    <input 
                    type="month"
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)} 
                    min={fromDate} 
                    className="pl-9 pr-3 py-2 border border-base-300 rounded-lg text-xs bg-base-100 w-full focus:outline-none focus:border-[var(--primary-color)]"
                    />
                </div>
              </div>

              <button 
                onClick={handleSearch} 
                disabled={isLoadingData}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-[var(--primary-color)] text-white rounded-sm cursor-pointer hover:opacity-90 transition font-medium text-xs h-[34px]"
              >
                {isLoadingData ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4" />}
                {isLoadingData ? "Loading..." : "Get History"}
              </button>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-center md:justify-end ">
              <label className="text-xs font-medium text-base-content/80 whitespace-nowrap ">Status:</label>
              {/* UPDATED DROPDOWN */}
              <CustomDropdown
                value={filterStatus}
                setValue={setFilterStatus}
                dropdownMenu={["All", "Paid", "Pending", "Draft"]}
              />
            </div>
          </div>
        </div>

        {/* --- Results Area --- */}
        {hasSearched && (
          <>
            {/* Financial Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Total Paid</div>
                <div className="text-2xl font-bold text-success">{formatCurrency(stats.totalPaid)}</div>
                <div className="text-xs mt-1 text-success">Cleared Amount</div>
              </div>

              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Pending Dues</div>
                <div className="text-2xl font-bold text-error">{formatCurrency(stats.totalPending)}</div>
                <div className="text-xs mt-1 text-error">Unpaid Amount</div>
              </div>

              {/* NEW: DRAFT / SAVED STAT */}
              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Draft / Saved</div>
                <div className="text-2xl font-bold text-info">{formatCurrency(stats.totalSaved)}</div>
                <div className="text-xs mt-1 text-info">Not yet submitted</div>
              </div>

              <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
                <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Total Earned</div>
                <div className="text-2xl font-bold text-base-content">{formatCurrency(stats.totalEarned)}</div>
                <div className="text-xs mt-1 text-base-content/60">Across {stats.totalRecords} records</div>
              </div>
            </div>

            {/* Sub-search and Export */}
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input 
                    type="text" 
                    placeholder="Search project or foreman..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-lg text-xs bg-base-100"
                  />
                </div>
                <button 
                  onClick={handleExport} 
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-[var(--primary-color)] text-white rounded-sm hover:opacity-90 transition font-medium text-xs disabled:opacity-50"
                  disabled={filteredData.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export History
                </button>
              </div>
            </div>
          </>
        )}

        {/* --- Table Area --- */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden min-h-[300px]">
          {!hasSearched ? (
            <div className="flex flex-col justify-center items-center h-full py-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <Wallet className="w-16 h-16 text-base-content/40" />
                <div className="font-semibold text-lg text-base-content">View Salary History</div>
                <div className="text-base-content/60 text-xs max-w-md">
                  Select a month range and click <strong>Get History</strong> to view financial records for {employee.name}.
                </div>
              </div>
            </div>
          ) : isLoadingData ? (
             <div className="flex flex-col justify-center items-center h-full py-20">
              <Loader2 className="w-12 h-12 text-[var(--primary-color)] animate-spin" />
              <span className="text-sm mt-4 text-base-content/60">Fetching salary records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-base-200 border-b border-base-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Month & Year</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Foreman</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-base-content/80 uppercase">Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-base-content/80 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-12 h-12 text-base-content/40" />
                          <div className="font-medium text-xs text-base-content">No salary records found</div>
                          <div className="text-base-content/60 text-xs">Try adjusting dates or filters</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, i) => {
                      const dateObj = new Date(record.date);
                      const monthYear = dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                      
                      const isPaid = record.status === 'paid';
                      const isSaved = record.status === 'draft'; // <--- Check for save status
                      
                      return (
                        <tr key={i} className="hover:bg-base-200 transition-colors">
                          <td className="px-6 py-4 text-xs text-base-content/60">{i + 1}</td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-base-content/40" />
                                <span className="text-sm font-medium">{monthYear}</span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-base-content/40" />
                                <span className="text-xs font-medium">{record.projectName || 'N/A'}</span>
                             </div>
                          </td>

                          <td className="px-6 py-4 text-xs text-base-content/70">
                            {record.foremanName || 'N/A'}
                          </td>
                          
                          <td className="px-6 py-4 text-right">
                            <span className="font-mono font-bold text-sm">
                                {formatCurrency(record.salary)}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 text-center">
                            {/* UPDATED STATUS BADGE LOGIC */}
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                                ${isPaid 
                                    ? "bg-success/10 text-success border-success/20" 
                                    : isSaved 
                                        ? "bg-info/10 text-info border-info/20" 
                                        : "bg-warning/10 text-warning border-warning/20"
                                }`}>
                              
                              {isPaid && <CheckCircle className="w-3 h-3"/>}
                              {isSaved && <FileText className="w-3 h-3"/>}
                              {!isPaid && !isSaved && <Clock className="w-3 h-3"/>}
                              
                              {isPaid ? "Paid" : isSaved ? "Draft" : "pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {hasSearched && filteredData.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
            <div className="text-xs text-base-content/60 text-center">
              Showing <strong className="text-[var(--primary-color)]">{filteredData.length}</strong> of <strong>{salaryHistory.length}</strong> records
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}