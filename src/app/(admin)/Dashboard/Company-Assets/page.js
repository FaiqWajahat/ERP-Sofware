'use client'

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Truck, Wrench } from "lucide-react"; 

// --- IMPORTS ---
// Make sure these paths match your project structure
import CompanyAssetsTable from "@/Components/CompanyAssetsTable"; 
import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from "@/Components/CustomLoader";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import { errorToast, successToast } from "@/lib/toast";

const AssetsPage = () => {
  const dropdownMenu = ['All', 'Operational', 'Maintenance', 'Repair', 'Inactive'];
  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Company Assets", href: "/Dashboard/Company-Assets" },
  ];

  // Initialize as empty array to prevent crashes
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    getAssets();
  }, []);

  const getAssets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/assets/getAssets");
      if (response.data.success) {
        // SAFETY CHECK: Ensure we default to [] if data is null
        setAssets(response.data.assets || []); 
      } else {
        errorToast(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      const response = await axios.delete("/api/assets/deleteAsset", {
        data: { assetId: assetId } 
      });

      if (response.data.success) {
        setAssets((prevAssets) => 
          prevAssets.filter((asset) => asset._id !== assetId)
        );
        successToast(response.data.message);
      } else {
        errorToast(response.data.message);
      }
    } catch (error) {
      errorToast("Failed to delete asset");
    }
  };

  // --- REAL-TIME UPDATE FUNCTION ---
  const handleUpdateAsset = (updatedAsset) => {
    if (!updatedAsset) return;
    
    setAssets((prevAssets) => {
      // Safety check for prevAssets
      const currentList = prevAssets || [];
      return currentList.map((asset) => 
        asset._id === updatedAsset._id ? updatedAsset : asset
      );
    });
  };

  // Filter assets based on status and search query
  const filteredAssets = useMemo(() => {
    // SAFETY CHECK: Prevent crash if assets is null/undefined
    let filtered = assets || [];

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((asset) => 
        asset.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((asset) => 
        asset.name?.toLowerCase().includes(query) ||
        asset.serialNumber?.toLowerCase().includes(query) ||
        asset.model?.toLowerCase().includes(query) ||
        asset.category?.toLowerCase().includes(query) ||
        asset.manufacturer?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assets, selectedStatus, searchQuery]);

  // Helper calculations (Safety checks added)
  const safeAssets = assets || [];
  const totalAssets = safeAssets.length;
  const operationalAssets = safeAssets.filter(a => ['operational', 'active'].includes(a.status?.toLowerCase())).length;
  const maintenanceAssets = safeAssets.filter(a => ['maintenance', 'repair'].includes(a.status?.toLowerCase())).length;

  if (isLoading) return <CustomLoader text={"Loading machinery & vehicles..."}/> 

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading={`Company Assets`} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className="stats shadow bg-base-100">
          <div className="stat">
            
            <div className="stat-title text-xs">Total Fleet</div>
            <div className="stat-value text-2xl">{totalAssets}</div>
            <div className="stat-desc">Machinery & Vehicles</div>
          </div>
        </div>

        {/* Operational */}
        <div className="stats shadow bg-base-100">
          <div className="stat">
              
            <div className="stat-title text-xs">Operational</div>
            <div className="stat-value text-2xl text-success">{operationalAssets}</div>
            <div className="stat-desc text-success">Ready for work</div>
          </div>
        </div>

        {/* In Maintenance */}
        <div className="stats shadow bg-base-100">
          <div className="stat">
            
            <div className="stat-title text-xs">Maintenance</div>
            <div className="stat-value text-2xl text-warning">{maintenanceAssets}</div>
            <div className="stat-desc text-warning">Under repair or service</div>
          </div>
        </div>
      </div>

      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          {/* Search Bar */}
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <DashboardSearch 
              placeholder={"Search Name, Serial or Model"} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label className="font-medium text-sm mr-2 hidden sm:block">Status:</label>
              <CustomDropdown 
                value={selectedStatus} 
                setValue={setSelectedStatus} 
                dropdownMenu={dropdownMenu} 
              />
            </div>
            <button
              onClick={() => router.push("/Dashboard/Company-Assets/Add")}
              className="btn btn-sm bg-[var(--primary-color)] text-white rounded-sm hover:bg-[var(--primary-color)]/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Assets Table */}
        <div className="w-full overflow-x-auto">
          {/* We pass the handleUpdateAsset function here */}
          <CompanyAssetsTable
            assets={filteredAssets} 
            isLoading={isLoading}
            onDeleteAsset={handleDeleteAsset}
            onUpdateAsset={handleUpdateAsset} 
          />
        </div>
      </div>
    </>
  );
};

export default AssetsPage;