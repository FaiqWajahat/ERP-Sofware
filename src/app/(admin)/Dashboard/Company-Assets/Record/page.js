'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from '@/Components/CustomLoader';
import axios from 'axios';
import { errorToast } from '@/lib/toast';
import { Briefcase, Truck } from 'lucide-react';

// --- Helper Component for Asset Avatar (Matching the style of the previous table) ---
const AssetAvatar = ({ name }) => {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Asset')}&background=random&size=40&bold=true&format=svg&rounded=false`; 
  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden ring-1 ring-base-300 shadow-sm">
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover"/>
    </div>
  );
};

const AssetRecord = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Adapted dropdown for Asset contexts
  const dropdownMenu = ['Operational', 'Maintenance', 'All'];

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Assets", href: "/Dashboard/Company-Assets" },
  ];

  // Fetch Assets
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    
    try {
      // Assuming you have a getAssets API similar to getEmployee
      const response = await axios.get("/api/assets/getAssets"); 
      const success = response.data.success;

      if (!success) {
        // Fallback or empty if needed, but alerting error as per your pattern
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setAssets(response.data.assets || response.data.data); // Adjust based on your API response structure
    } catch (error) {
      console.log("error of fetching assets:", error);
      errorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Assets
  const filteredAssets = assets.filter(asset => {
    const sTerm = searchTerm.toLowerCase();
    
    // Search by Name, Serial Number, or Current Project Name
    const matchesSearch = 
      asset.name?.toLowerCase().includes(sTerm) ||
      asset.serialNumber?.toLowerCase().includes(sTerm) ||
      asset.currentProject?.name?.toLowerCase().includes(sTerm) ||
      asset.model?.toLowerCase().includes(sTerm);

    // Status Filtering Logic
    const matchesStatus = selectedStatus === 'All' || 
      (selectedStatus === 'Operational' && ['Active', 'Operational'].includes(asset.status)) ||
      (selectedStatus === 'Maintenance' && ['Maintenance', 'Repair', 'Broken'].includes(asset.status));

    return matchesSearch && matchesStatus;
  });

  // Stats Calculations
  const activeAssets = assets.filter(a => ['Active', 'Operational'].includes(a.status)).length;
  const maintenanceAssets = assets.filter(a => ['Maintenance', 'Repair'].includes(a.status)).length;

  // Navigate to asset details/edit
  const handleViewAsset = (assetId) => {
    router.push(`/Dashboard/Company-Assets/Record/${assetId}`);
  };

  if (isLoading) {
    return (
      <CustomLoader text={"Loading Assets...."}/>
    );
  }

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Asset Records" />

      {/* Stats Section - Exact replica of Employee Stats style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Total Assets</div>
            <div className="stat-value text-2xl">
              {assets.length}
            </div>
            <div className="stat-desc">Registered Vehicles & Machines</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Operational</div>
            <div className="stat-value text-2xl text-success">
              {activeAssets}
            </div>
            <div className="stat-desc text-success">Ready for use</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">In Maintenance</div>
            <div className="stat-value text-2xl text-warning">
              {maintenanceAssets}
            </div>
            <div className="stat-desc text-warning">Currently unavailable</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <p className="text-sm text-base-content/60 mt-1">
              Manage and track company assets and machinery.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-full md:w-auto justify-center md:justify-start flex">
              <DashboardSearch 
                placeholder="Search Asset or Serial" 
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

        {/* Asset Table */}
        <div className="w-full overflow-x-auto">
          <table className="table w-full">
            <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
              <tr>
                <th>S.No</th>
                <th>Asset Name</th>
                <th>Serial No</th>
                <th>Current Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset, idx) => (
                  <tr
                    onClick={() => handleViewAsset(asset._id)}
                    key={asset._id}
                    className="hover:bg-base-200/40 transition cursor-pointer"
                  >
                    <td>{idx + 1}</td>

                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <AssetAvatar name={asset.name} />
                        </div>

                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <p className="text-xs text-base-content/70">{asset.model || asset.category || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="text-sm font-mono">{asset.serialNumber || "N/A"}</td>
                    
                    <td className="text-sm">
                        {asset.currentProject?.name ? (
                            <div className="flex items-center gap-1.5 text-[var(--primary-color)] font-medium">
                                <Briefcase className="w-3.5 h-3.5" />
                                {asset.currentProject.name}
                            </div>
                        ) : (
                            <span className="text-base-content/50 italic">In Storage</span>
                        )}
                    </td>

                    <td>
                      {['Active', 'Operational'].includes(asset.status) ? (
                        <span className="text-success font-medium">
                          Operational
                        </span>
                      ) : (
                        <span className="text-warning font-medium">
                          {asset.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <p className="text-base-content/60">
                      {searchTerm ? 'No assets found matching your search' : 'No assets available'}
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

export default AssetRecord;