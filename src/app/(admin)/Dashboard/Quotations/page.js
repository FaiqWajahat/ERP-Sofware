'use client'

import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from "@/Components/CustomLoader";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import QuotationTable from "@/Components/QuotationTable"; // Using the table we created earlier
import { errorToast } from "@/lib/toast";
import axios from "axios";
import { Plus, FileText, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";

const Quotations = () => {
  // Statuses matching the Schema Enum
  const dropdownMenu = ['All', 'Draft', 'Sent', 'Accepted', 'Rejected'];

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Quotations", href: "/Dashboard/Quotations" },
  ];

  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    getQuotations();
  }, []);

  const getQuotations = async () => {
    setIsLoading(true);
    try {
      // Assuming you will create this GET endpoint next
      const response = await axios.get("/api/quotation/getQuotations");
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setQuotations(response.data.quotations);
    } catch (error) {
      console.log("error of fetching quotations:", error);
      errorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quotation deletion
  const handleDeleteQuotation = (quotationId) => {
    // Remove quotation from state immediately for better UX
    setQuotations((prevQuotations) => 
      prevQuotations.filter((q) => q._id !== quotationId)
    );
  };

  // Filter quotations based on status and search query
  const filteredQuotations = useMemo(() => {
    let filtered = quotations;

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter((q) => q.status === selectedStatus);
    }

    // Filter by search query (Project Name, Client Name, Ref No)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((q) => 
        q.projectName?.toLowerCase().includes(query) ||
        q.clientName?.toLowerCase().includes(query) ||
        q.referenceNo?.toLowerCase().includes(query) ||
        q.role?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [quotations, selectedStatus, searchQuery]);

  if (isLoading) return <CustomLoader text={"Loading quotations..."}/> 

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Quotations Management`} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Quotations */}
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-primary">
                <FileText className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title text-xs">Total Quotations</div>
            <div className="stat-value text-2xl">
              {quotations.length}
            </div>
            <div className="stat-desc">All time records</div>
          </div>
        </div>

        {/* Accepted Quotations */}
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-success">
                <CheckCircle className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title text-xs">Accepted</div>
            <div className="stat-value text-2xl text-success">
              {quotations.filter((q) => q.status === 'Accepted').length}
            </div>
            <div className="stat-desc text-success">Won Projects</div>
          </div>
        </div>

        {/* Pending (Sent/Draft) Quotations */}
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure text-warning">
                <Clock className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title text-xs">Pending</div>
            <div className="stat-value text-2xl text-warning">
              {quotations.filter((q) => q.status === 'Sent' || q.status === 'Draft').length}
            </div>
            <div className="stat-desc text-warning">Drafts & Sent</div>
          </div>
        </div>
      </div>

      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          {/* Search Bar */}
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <DashboardSearch 
              placeholder={"Search Project, Client..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Actions & Filters */}
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
              onClick={() => router.push("/Dashboard/Quotations/Add")}
              className="btn btn-sm bg-[var(--primary-color)] text-white rounded-sm hover:bg-[var(--primary-color)]/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <QuotationTable 
            quotations={filteredQuotations} 
            isLoading={isLoading}
            onDeleteQuotation={handleDeleteQuotation}
          />
        </div>
      </div>
    </>
  );
};

export default Quotations;