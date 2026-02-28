'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Edit, Trash, X, Briefcase, Search, Check, ChevronDown, 
  MapPin, Tag, Hash, Wallet, AlertTriangle, Truck, Disc,
  LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { successToast, errorToast } from '@/lib/toast';
import axios from 'axios';
import CustomLoader from './CustomLoader';

// --- 1. Helper Components ---

const AssetAvatar = ({ name, size = 'md' }) => {
  const sizeClasses = { sm: 'w-12 h-12', md: 'w-10 h-10', lg: 'w-20 h-20' };
  const sizePixels = { sm: 48, md: 40, lg: 80 };
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Asset')}&background=random&size=${sizePixels[size]}&bold=true&format=svg&rounded=false`; 
  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden ring-2 ring-base-300 ring-offset-base-100 ring-offset-2 shadow-md flex-shrink-0`}>
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover"/>
    </div>
  );
};

const formatCurrency = (amount) => amount ? `Rs. ${amount.toLocaleString()}` : 'N/A';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status) => {
  const s = status?.toLowerCase().trim() || '';
  if (['operational', 'active'].includes(s)) return 'text-green-600 bg-green-500/10 border-green-500/20';
  if (['maintenance', 'repair'].includes(s)) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
  return 'text-base-content/70 bg-base-200 border-base-300';
};

// --- 2. Custom Dropdown (Trigger API on Change) ---
const ProjectAssignmentDropdown = ({ currentProjectId, projects, onChange, isLoading }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentProjectName = safeProjects.find(p => p._id === currentProjectId)?.name;

  const handleSelect = (project) => {
    // Prevent API call if selecting the same project
    if ((!project && !currentProjectId) || (project && project._id === currentProjectId)) {
        setIsDropdownOpen(false);
        return;
    }

    onChange(project); // Triggers the API call in parent
    setIsDropdownOpen(false);
    setSearchQuery(""); 
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center justify-between w-full p-3 bg-base-100 border rounded-md cursor-pointer transition-colors ${isLoading ? 'opacity-70 cursor-wait border-base-200' : 'border-base-300 hover:border-[var(--primary-color)]'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {isLoading ? (
             <span className="loading loading-spinner loading-xs text-[var(--primary-color)]"></span>
          ) : (
             <Briefcase className="w-4 h-4 text-base-content/50 flex-shrink-0" />
          )}
          
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-base-content/50 font-bold uppercase tracking-wider">Current Location</span>
            <span className="text-sm font-semibold truncate">
              {currentProjectId ? (currentProjectName || "Unknown Project") : "In Storage (Unassigned)"}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </div>

      {isDropdownOpen && !isLoading && (
        <div className="absolute top-full mt-1 left-0 w-full bg-base-100 border border-base-300 rounded-md shadow-lg z-50 max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-base-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-3 h-3 opacity-40" />
              <input 
                type="text" 
                placeholder="Find project..." 
                className="input input-sm w-full pl-8 bg-base-200 focus:outline-none focus:bg-base-100 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-1">
            <div 
              onClick={() => handleSelect(null)}
              className="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer text-error text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Unassign (Move to Storage)</span>
            </div>
            {filteredProjects.map(project => (
              <div 
                key={project._id} 
                onClick={() => handleSelect(project)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-colors ${currentProjectId === project._id ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'hover:bg-base-200'}`}
              >
                <MapPin className="w-3.5 h-3.5 opacity-70" />
                <span className="truncate flex-1">{project.name}</span>
                {currentProjectId === project._id && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="p-3 text-center text-xs opacity-50">No projects found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. Main Component ---
const CompanyAssetsTable = ({ assets, isLoading, onDeleteAsset, onUpdateAsset }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [projects, setProjects] = useState([]);
  
  // Loading state specifically for the assignment dropdown
  const [isAssigning, setIsAssigning] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/attendance/project'); 
        if (res.data.success) {
          setProjects(res.data.projects || res.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
      }
    };
    fetchProjects();
  }, []);

  // NEW: Automatically save when dropdown selection changes
  const handleAutoAssign = async (project) => {
    if (!selectedAsset) return;

    setIsAssigning(true);
    
    // Determine payload
    const payload = {
        assetId: selectedAsset._id,
        projectId: project ? project._id : null,
        projectName: project ? project.name : null,
        assignedDate: new Date()
    };

    try {
      const response = await axios.put('/api/assets/assignProject', payload);

      if (response.data.success) {
        successToast(response.data.message);
        
        // 1. Update the local modal data (Immediate Feedback)
        setSelectedAsset(response.data.asset);
        
        // 2. Notify parent to update the background table list (Real-time Sync)
        if (onUpdateAsset) {
            onUpdateAsset(response.data.asset);
        }
      }
    } catch (error) {
      console.error(error);
      errorToast("Failed to update location");
    } finally {
      setIsAssigning(false);
    }
  };

  

  const openDialog = (asset) => {
    setSelectedAsset(asset);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedAsset(null), 200);
  };

  if (isLoading) return <CustomLoader text={"Loading Assets..."}/>;

  if (!assets || assets.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
            <Truck className="h-8 w-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">No Assets Found</h3>
          <p className="text-sm text-base-content/60">Start by adding your first vehicle or machine.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto pb-10">
        <table className="table w-full table-md">
          <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
            <tr>
              <th>S.No</th>
              <th>Asset Name</th>
              <th className="hidden md:block">Assignment</th>
              <th>Serial No</th>
              <th>Status</th>
              <th className=''>Date</th>
            </tr>
          </thead>
          <tbody>
            {assets?.map((asset, idx) => (
              <tr key={asset._id} onClick={() => openDialog(asset)} className="hover:bg-base-200/40 cursor-pointer transition">
                <td className="font-medium">{idx + 1}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <AssetAvatar name={asset.name} size="md" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-medium whitespace-nowrap">{asset.name || 'N/A'}</h3>
                      <span className="text-xs text-[var(--primary-color)] whitespace-nowrap">{asset.category || 'Asset'}</span>
                    </div>
                  </div>
                </td>
                <td className='hidden  md:flex mt-2 items-center'>
                  {asset.currentProject?.name ? (
                    <div className=" items-center gap-1.5 flex whitespace-nowrap text-xs font-medium text-[var(--primary-color)]">
                      <Briefcase className="w-3.5 h-3.5" />
                      {asset.currentProject.name}
                    </div>
                  ) : (
                    <span className="text-xs text-base-content/40 italic">In Storage</span>
                  )}
                </td>
                <td><span className={asset.serialNumber ? "text-base-content" : "text-base-content/40 italic"}>{asset.serialNumber || 'N/A'}</span></td>
                <td>
                  {['Operational', 'Active'].includes(asset.status) ? (
                      <span className="text-green-600 text-sm font-medium">Active</span>
                  ) : (
                      <span className="text-yellow-600 text-sm font-medium">{asset.status}</span>
                  )}
                </td>
                <td className="text-sm whitespace-nowrap">{formatDate(asset.purchaseDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Detail Modal --- */}
      {isOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeDialog}>
          <div className="relative w-full max-w-lg max-h-[90vh] bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="relative bg-gradient-to-br from-base-200/50 to-base-300/30 px-8 pt-8 pb-6 flex-shrink-0">
               <button onClick={closeDialog} className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle hover:bg-base-100/50"><X className="w-4 h-4"/></button>
               <div className="flex items-center gap-5">
                 <div className="relative">
                    <div className="shadow-lg ring-4 ring-base-100 rounded-lg"><AssetAvatar name={selectedAsset.name} size="lg" /></div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-base-100 shadow-sm ${getStatusColor(selectedAsset.status).includes('green') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                 </div>
                 <div className="flex-1">
                   <h2 className="text-xl font-bold text-base-content mb-1">{selectedAsset.name}</h2>
                   <p className="text-sm text-base-content/60 font-medium">{selectedAsset.category || 'Asset'}</p>
                   <div className="mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAsset.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(selectedAsset.status).includes('green') ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {selectedAsset.status}
                      </span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
              {/* Assignment Card */}
              <div>
                <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">Project Assignment</h3>
                <div className="bg-base-200/50 p-4 rounded-lg border border-base-200">
                  <ProjectAssignmentDropdown 
                    currentProjectId={selectedAsset.currentProject?.id}
                    projects={projects}
                    onChange={handleAutoAssign}
                    isLoading={isAssigning}
                  />
                  <div className="flex justify-end mt-2">
                      <p className="text-[10px] text-base-content/40 italic flex items-center gap-1">
                        {isAssigning ? (
                            <>Saving changes...</>
                        ) : (
                            <><Check className="w-3 h-3"/> Location saves automatically</>
                        )}
                      </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                 <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">Technical & Financial</h3>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg transition-colors">
                       <div className="w-8 h-8 rounded bg-base-200 flex items-center justify-center"><Tag className="h-4 w-4 text-base-content/70" /></div>
                       <div><p className="text-xs text-base-content/50">Model</p><p className="text-sm font-medium">{selectedAsset.model || 'N/A'}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg transition-colors">
                       <div className="w-8 h-8 rounded bg-base-200 flex items-center justify-center"><Hash className="h-4 w-4 text-base-content/70" /></div>
                       <div><p className="text-xs text-base-content/50">Serial Number</p><p className="text-sm font-mono font-medium">{selectedAsset.serialNumber || 'N/A'}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg transition-colors">
                       <div className="w-8 h-8 rounded bg-base-200 flex items-center justify-center"><Wallet className="h-4 w-4 text-base-content/70" /></div>
                       <div><p className="text-xs text-base-content/50">Cost</p><p className="text-sm font-medium">{formatCurrency(selectedAsset.price)}</p></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-4 py-5 bg-base-200/30 border-t border-base-200 flex-shrink-0">
              
             <button 
                onClick={() => router.push(`/Dashboard/Company-Assets/Record/${selectedAsset._id}`)}
                className="btn bg-[var(--primary-color)] text-white rounded-sm flex-1 gap-2 shadow-sm hover:bg-[var(--primary-color)]/90"
              >
                <LayoutDashboard className="w-4 h-4" /> Track
              </button>

              {/* 2. Edit Button */}
              <button 
                onClick={() => router.push(`/Dashboard/Company-Assets/Edit/${selectedAsset._id}`)}
                className="btn bg-secondary text-secondary-content rounded-sm flex-1 gap-2 shadow-sm "
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              
              {/* 3. Delete Button */}
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(selectedAsset); }}
                className="btn btn-ghost gap-2 rounded-sm text-error hover:bg-error/10 border border-transparent hover:border-error/20"
              >
                <Trash className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirm(null)}>
          <div className="relative w-full max-w-md bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center"><AlertTriangle className="h-8 w-8 text-error" /></div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Delete Asset</h3>
              <p className="text-sm text-base-content/70 text-center mb-6">Are you sure you want to delete <span className="font-semibold text-base-content">{deleteConfirm.name}</span>? This action cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost flex-1 rounded-sm">Cancel</button>
                <button 
                  onClick={() => { if(onDeleteAsset) onDeleteAsset(deleteConfirm._id); setDeleteConfirm(null); setIsOpen(false); }} 
                  className="btn btn-error text-white flex-1 rounded-sm gap-2"
                >
                  <Trash className="w-4 h-4" /> Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyAssetsTable;