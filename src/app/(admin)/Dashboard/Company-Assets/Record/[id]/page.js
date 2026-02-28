'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from "next/navigation";
import axios from 'axios';
import { 
  Calendar, MapPin, Search, Download, Truck, 
  Loader2, AlertCircle, Tag, Hash, Clock, CheckCircle, Briefcase
} from 'lucide-react';
import DashboardPageHeader from '@/Components/DashboardPageHeader';
import CustomLoader from '@/Components/CustomLoader'; 
import { warningToast, errorToast } from '@/lib/toast';

// Helper for Avatar
const AssetAvatar = ({ name, size = 'lg' }) => {
  const sizeClasses = { md: 'w-10 h-10', lg: 'w-24 h-24' };
  const sizePixels = { md: 40, lg: 96 };
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Asset')}&background=random&size=${sizePixels[size]}&bold=true&format=svg&rounded=false`; 
  return (
    <div className={`${sizeClasses[size]} rounded-xl overflow-hidden ring-4 ring-base-100 shadow-lg`}>
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover"/>
    </div>
  );
};

export default function AssetRecordPage() {
  // 1. Get ID from URL Parameters
  const params = useParams();
  const { id } = params; 

  // Data States
  const [asset, setAsset] = useState(null);
  
  // UI States
  const [isLoadingAsset, setIsLoadingAsset] = useState(true);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- 1. Fetch Asset Details on Mount ---
  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!id) return;
      setIsLoadingAsset(true);
      try {
        const response = await axios.post('/api/assets/getAssetDetails', { assetId: id });
        if (response.data.success) {
          setAsset(response.data.asset);
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        errorToast("Failed to load asset data");
      } finally {
        setIsLoadingAsset(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  // --- 2. Process History Data (Flattening the structure) ---
  const allHistory = useMemo(() => {
    if (!asset) return [];

    let historyList = [];

    // 1. Add Current Project (if exists) as the top record
    if (asset.currentProject?.id) {
      historyList.push({
        status: 'Current',
        projectName: asset.currentProject.name,
        assignedDate: asset.currentProject.assignedDate,
        unassignedDate: null, // Still active
        duration: calculateDuration(asset.currentProject.assignedDate, new Date())
      });
    }

    // 2. Add Past History
    if (asset.projectHistory?.length > 0) {
      const pastRecords = asset.projectHistory.map(record => ({
        status: 'Completed',
        projectName: record.projectName,
        assignedDate: record.assignedDate,
        unassignedDate: record.unassignedDate,
        duration: calculateDuration(record.assignedDate, record.unassignedDate),
        notes: record.notes
      }));
      // Reverse to show newest first
      historyList = [...historyList, ...pastRecords.reverse()];
    }

    return historyList;
  }, [asset]);

  // --- 3. Filter Logic ---
  const filteredData = useMemo(() => {
    return allHistory.filter((record) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        searchQuery === "" ||
        (record.projectName && record.projectName.toLowerCase().includes(searchLower)) ||
        (record.status && record.status.toLowerCase().includes(searchLower))
      );
    });
  }, [allHistory, searchQuery]);

  // --- 4. Statistics ---
  const stats = useMemo(() => {
    const totalMoves = allHistory.length;
    const uniqueProjects = new Set(allHistory.map(r => r.projectName)).size;
    const currentlyActive = asset?.currentProject?.id ? "Yes" : "No";
    
    return { totalMoves, uniqueProjects, currentlyActive };
  }, [allHistory, asset]);

  // Helper: Calculate Duration
  function calculateDuration(start, end) {
    if (!start) return "-";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return `${diffDays} days`;
  }

  // --- 5. Export Handler ---
  const handleExport = () => {
    const csvContent = [
      ["Project Name", "Status", "Assigned Date", "Unassigned Date", "Duration"],
      ...filteredData.map(r => [
        r.projectName || "N/A",
        r.status,
        new Date(r.assignedDate).toLocaleDateString(),
        r.unassignedDate ? new Date(r.unassignedDate).toLocaleDateString() : "Present",
        r.duration
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${asset?.name || "Asset"}_history.csv`;
    a.click();
  };

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Assets", href: "/Dashboard/Company-Assets" },
    { name: "Tracking Record", href: "#" },
  ];

  if (isLoadingAsset) {
    return <CustomLoader text={'Loading asset history...'}/>;
  }

  if (!asset) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-error" />
        <h2 className="text-xl font-bold">Asset Not Found</h2>
      </div>
    );
  }

  return (
    <> 
    <DashboardPageHeader breadData={breadData} heading="Asset Tracking Record" />
    <div className="w-full min-h-screen bg-base-200/30 pb-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Asset Profile Card */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Avatar */}
            <div className="relative">
                 <AssetAvatar name={asset.name} size="lg" />
                 <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-base-100 ${['operational', 'active'].includes(asset.status?.toLowerCase()) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-base-content">{asset.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-xs text-base-content/70">
                 <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono">{asset.serialNumber}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{asset.model || "No Model"}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>{asset.manufacturer || "No Make"}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`badge badge-sm border-none text-white ${['operational', 'active'].includes(asset.status?.toLowerCase()) ? 'bg-green-600' : 'bg-yellow-600'}`}>
                        {asset.status}
                    </span>
                 </div>
              </div>
            </div>

            {/* Current Location Badge */}
            <div className="w-full md:w-auto">
               <div className="bg-base-200/50 rounded-lg p-4 border border-base-200 text-center">
                  <div className="text-xs text-base-content/50 uppercase font-bold mb-1">Current Location</div>
                  {asset.currentProject?.id ? (
                      <div className="flex flex-col items-center">
                         <div className="flex items-center gap-2 text-[var(--primary-color)] font-bold text-lg">
                            <MapPin className="w-5 h-5" />
                            {asset.currentProject.name}
                         </div>
                         <div className="text-xs text-base-content/60 mt-1">
                            Since {new Date(asset.currentProject.assignedDate).toLocaleDateString()}
                         </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center opacity-50">
                         <div className="flex items-center gap-2 font-bold text-lg">
                            <Briefcase className="w-5 h-5" />
                            In Storage
                         </div>
                      </div>
                  )}
               </div>
            </div>

          </div>
        </div>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
               <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Total Movements</div>
               <div className="text-3xl font-bold text-base-content">{stats.totalMoves}</div>
               <div className="text-xs mt-1 text-base-content/60">Times assigned</div>
             </div>
             <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
               <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Unique Sites</div>
               <div className="text-3xl font-bold text-[var(--primary-color)]">{stats.uniqueProjects}</div>
               <div className="text-xs mt-1 text-[var(--primary-color)]">Project locations</div>
             </div>
             <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
               <div className="text-xs text-base-content/60 uppercase font-medium mb-2">Currently Active</div>
               <div className={`text-3xl font-bold ${stats.currentlyActive === 'Yes' ? 'text-success' : 'text-warning'}`}>
                 {stats.currentlyActive}
               </div>
               <div className="text-xs mt-1 text-base-content/60">Is on a site?</div>
             </div>
        </div>

        {/* 3. Search & Filters */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
           <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                  <input 
                    type="text" 
                    placeholder="Search project name..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-base-300 rounded-lg text-xs bg-base-100"
                  />
              </div>
              <button 
                onClick={handleExport} 
                className="flex items-center justify-center gap-2 px-6 py-2 bg-[var(--primary-color)] text-white rounded-sm hover:opacity-90 transition font-medium text-xs w-full md:w-auto disabled:opacity-50"
                disabled={filteredData.length === 0}
              >
                <Download className="w-4 h-4" />
                Export History
              </button>
           </div>
        </div>

        {/* 4. Timeline Table */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden min-h-[300px]">
          {filteredData.length === 0 ? (
             <div className="flex flex-col justify-center items-center h-full py-20">
               <MapPin className="w-12 h-12 text-base-content/40 mb-3" />
               <div className="font-medium text-base-content">No movement history found</div>
               <div className="text-base-content/60 text-xs">{"This asset hasn't been moved yet."}</div>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-base-200 border-b border-base-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Project / Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Date Arrived</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Date Left</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-base-content/80 uppercase">Duration</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-base-content/80 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {filteredData.map((record, i) => (
                    <tr key={i} className={`hover:bg-base-200 ${record.status === 'Current' ? 'bg-[var(--primary-color)]/5' : ''}`}>
                      <td className="px-6 py-4 text-xs text-base-content">{i + 1}</td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-base-content">{record.projectName || "Unknown"}</span>
                            {record.notes && <span className="text-[10px] text-base-content/60 italic">{record.notes}</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-base-content flex items-center gap-2">
                         <Calendar className="w-3 h-3 opacity-50"/>
                         {new Date(record.assignedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-base-content">
                         {record.unassignedDate ? new Date(record.unassignedDate).toLocaleDateString() : <span className="text-[var(--primary-color)] font-medium">Ongoing</span>}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-base-content/70">
                         {record.duration}
                      </td>
                      <td className="px-6 py-4 text-center">
                         {record.status === 'Current' ? (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                               <CheckCircle className="w-3 h-3" /> Current
                            </div>
                         ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-base-200 text-base-content/60 text-[10px] font-medium">
                               <Clock className="w-3 h-3" /> History
                            </div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {filteredData.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-4">
            <div className="text-xs text-base-content/60 text-center">
              Showing <strong className="text-[var(--primary-color)]">{filteredData.length}</strong> movements.
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
}