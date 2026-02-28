'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { errorToast, successToast } from '@/lib/toast';
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import CustomLoader from '@/Components/CustomLoader';
import { 
  Search, Plus, X, Briefcase, Wallet, 
  BriefcaseBusiness, FileText, ArrowLeft, Trash2, ExternalLink, AlertTriangle, MapPin 
} from 'lucide-react';
import Avatar from '@/Components/Avatar';

const ForemanProjectsPage = () => {
  const {foremanId} = useParams();
  const router = useRouter();

  // States
  const [employee, setEmployee] = useState(null);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState(null); 
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); 

  // Loading States for Actions
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Specific States
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [selectedProjectForAssign, setSelectedProjectForAssign] = useState(null);

  // Custom Color Helpers
  const primaryBg = { backgroundColor: 'var(--primary-color)' };
  const primaryText = { color: 'var(--primary-color)' };

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Foremans", href: "/Dashboard/Foremans" },
    { name: "Assigned Projects", href: `/Dashboard/Foremans/${foremanId}/AssignProjects` }
  ];

  useEffect(() => {
    if (foremanId) fetchData();
  }, [foremanId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, allRes, assignedRes] = await Promise.all([
        axios.get(`/api/employee/getEmployee/${foremanId}`),
        axios.get("/api/project"),
        axios.get(`/api/project/foreman/${foremanId}`)
      ]);

      if (empRes.data.success) setEmployee(empRes.data.employee);
      if (allRes.data.success) setAllProjects(allRes.data.data || []);
      if (assignedRes.data.success) setAssignedProjects(assignedRes.data.projects || []);

    } catch (error) {
      errorToast("Error fetching dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedProjectForAssign || !employee) return;
    try {
      const res = await axios.post("/api/project/foreman/assign-project", {
        foremanId,
        foremanName: employee.name,
        projectId: selectedProjectForAssign._id,
        projectName: selectedProjectForAssign.name,
        projectLocation: selectedProjectForAssign.location
      });

      if (res.data.success) {
        successToast("Project assigned successfully");
        setIsAssignModalOpen(false);
        setSelectedProjectForAssign(null);
        setProjectSearchQuery("");
        fetchData();
      }
    } catch (error) {
      errorToast(error.response?.data?.message || "Assignment failed");
    }
  };

  const handleDeleteAssignment = async () => {
    if (!viewingProject) return;
    
    // Start Loading
    setIsDeleting(true);

    try {
      const res = await axios.delete("/api/project/foreman/remove", {
        data: { 
          id: viewingProject._id 
        }
      });

      if (res.data.success) {
        successToast("Project unassigned successfully");
        setIsDeleteConfirmOpen(false);
        setViewingProject(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      errorToast(error.response?.data?.message || "Failed to remove assignment");
    } finally {
      // Stop Loading
      setIsDeleting(false);
    }
  };

  const searchResults = allProjects.filter(p =>
    p.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  if (isLoading) return <CustomLoader text="Loading Foreman Projects..." />;

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Assigned Projects" />

      {/* --- Stats Cards --- */}
      {/* IMPROVED: Responsive Grid (Stack on mobile, 2 cols on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="stats shadow bg-base-100 border border-base-200 w-full">
          {/* Tighter padding on mobile (p-4), normal on desktop (md:p-6) */}
          <div className="stat p-4 md:p-6">
            <div className="stat-figure" style={primaryText}><Briefcase size={28} className="md:w-8 md:h-8" /></div>
            <div className="stat-title uppercase text-[10px] md:text-xs font-bold text-base-content/70">Total Assigned</div>
            <div className="stat-value text-2xl md:text-4xl" style={primaryText}>{assignedProjects.length}</div>
            <div className="stat-desc text-xs text-base-content/60">Active project sites</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100 border border-base-200 w-full">
          <div className="stat p-4 md:p-6">
            <div className="stat-figure text-error"><Wallet size={28} className="md:w-8 md:h-8" /></div>
            <div className="stat-title uppercase text-[10px] md:text-xs font-bold text-base-content/70">Outstanding Cash</div>
            <div className="stat-value text-2xl md:text-4xl text-error">
              {assignedProjects.reduce((acc, curr) => acc + (curr.remainingBalance || 0), 0).toLocaleString()} <span className="text-sm">SAR</span>
            </div>
            <div className="stat-desc text-xs text-base-content/60">Total balance across projects</div>
          </div>
        </div>
      </div>

      {/* --- Employee Info Header --- */}
      {/* IMPROVED: Stack vertically on mobile, Row on Desktop */}
      <div className="bg-base-100 shadow-sm rounded-md p-5 md:p-6 border border-base-200 flex flex-col md:flex-row justify-between items-center gap-6 mb-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar name={employee?.name} size='lg' className="w-20 h-20 md:w-24 md:h-24 text-2xl" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-base-content">{employee?.name || 'Loading...'}</h2>
            {/* Center tags on mobile, start on desktop */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-base-content/70 mt-2">
              <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md">
                <BriefcaseBusiness size={14} /> {employee?.role || 'Foreman'}
              </span>
              <span className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md">
                <FileText size={14} /> Iqama: {employee?.iqamaNumber || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Buttons: Full width on mobile, auto on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={() => router.back()} 
            className="btn btn-outline border-base-300 btn-sm h-11 px-6 text-base-content hover:bg-base-200 hover:text-base-content w-full sm:w-auto"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button 
            onClick={() => setIsAssignModalOpen(true)} 
            style={primaryBg} 
            className="btn btn-sm text-white border-none h-11 px-6 hover:brightness-90 w-full sm:w-auto shadow-md"
          >
            <Plus size={16} /> Assign Project
          </button>
        </div>
      </div>

      {/* --- Projects Table --- */}
      <div className="bg-base-100 rounded-md shadow-sm border border-base-200 overflow-hidden">
        <div className="p-4 md:p-5 border-b border-base-200">
          <DashboardSearch placeholder="Search within assigned projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="overflow-x-auto w-full md:px-4 py-4">
          {/* Added min-w to force scroll on very small screens instead of crushing content */}
          <table className="table table-zebra w-full text-base-content min-w-[600px] md:min-w-full">
            <thead className="bg-base-200/50 text-base-content/70 text-xs uppercase">
              <tr>
                <th className="w-12">S.No</th>
                <th>Project Details</th>
                <th>Cash Sent</th>
                <th>Invoiced</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {assignedProjects.length > 0 ? (
                assignedProjects
                  .filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((proj, idx) => (
                    <tr key={proj._id} className="hover cursor-pointer border-base-200 transition-colors" onClick={() => setViewingProject(proj)}>
                      <td className="font-mono text-xs opacity-50">{idx + 1}</td>
                      <td>
                        {/* Truncate long names on mobile */}
                        <div className="font-bold uppercase text-xs md:text-sm truncate max-w-[140px] md:max-w-xs" style={primaryText}>{proj.projectName}</div>
                        {/* Hide ID on mobile to save space */}
                        <div className="text-[10px] text-base-content/50 font-mono hidden md:block">{proj._id}</div>
                      </td>
                      <td className="font-mono text-xs md:text-sm">{proj.totalSent?.toLocaleString()}</td>
                      <td className="font-mono text-xs md:text-sm">{proj.totalInvoiced?.toLocaleString()}</td>
                      <td className={`font-bold text-xs md:text-sm ${proj.remainingBalance > 0 ? 'text-error' : 'text-success'}`}>
                        {proj.remainingBalance?.toLocaleString()} <span className="text-[10px] opacity-70">SAR</span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr><td colSpan={5} className="text-center py-12 text-base-content/40 italic">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DIALOG 1: Project Details --- */}
      {viewingProject && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
          {/* Responsive Width: 11/12 on mobile, max-w-lg on desktop */}
          <div className="modal-box w-11/12 max-w-lg p-0 rounded-lg bg-base-100 shadow-2xl overflow-hidden scale-100">
             
             {/* Header */}
             <div className="p-4 md:p-6 border-b border-base-200 flex justify-between items-center bg-base-100">
                <h3 className="text-lg md:text-xl font-bold text-base-content">Project Overview</h3>
                <button onClick={() => setViewingProject(null)} className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:bg-base-200"><X size={20}/></button>
             </div>
             
             {/* Body */}
             <div className="p-5 md:p-8 space-y-6 bg-base-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-base-200/50 p-3 rounded-md">
                    <p className="text-[10px] uppercase font-bold text-base-content/50">Project Name</p>
                    <p className="font-semibold text-base md:text-lg text-base-content leading-tight">{viewingProject.projectName}</p>
                  </div>
                  <div className="bg-base-200/50 p-3 rounded-md">
                    <p className="text-[10px] uppercase font-bold text-base-content/50">Location</p>
                    <p className="text-sm md:text-base text-base-content/80 flex items-center gap-1">
                      <MapPin size={12}/> {viewingProject.projectLocation || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 bg-base-200 rounded-md border border-base-300">
                  <div className="text-center border-r border-base-300 pr-2">
                    <p className="text-[10px] uppercase text-base-content/50">Sent</p>
                    <p className="font-bold text-sm md:text-base text-base-content truncate">{viewingProject.totalSent?.toLocaleString()}</p>
                  </div>
                  <div className="text-center border-r border-base-300 px-2">
                    <p className="text-[10px] uppercase text-base-content/50">Invoiced</p>
                    <p className="font-bold text-sm md:text-base text-base-content truncate">{viewingProject.totalInvoiced?.toLocaleString()}</p>
                  </div>
                  <div className="text-center pl-2">
                    <p className="text-[10px] uppercase text-base-content/50">Balance</p>
                    <p className={`font-bold text-sm md:text-base truncate ${viewingProject.remainingBalance > 0 ? 'text-error' : 'text-success'}`}>
                      {viewingProject.remainingBalance?.toLocaleString()}
                    </p>
                  </div>
                </div>
             </div>

             {/* Footer - Buttons stack on very small screens, row on others */}
             <div className="p-4 md:p-6 flex flex-col sm:flex-row gap-3 justify-end bg-base-100 border-t border-base-200">
              
                <button 
                  onClick={() => router.push(`/Dashboard/Foremans/${foremanId}/Ledger/${viewingProject._id}`)}
                  style={primaryBg}
                  className="btn text-white border-none flex-1 gap-2 rounded-sm hover:brightness-90 h-12 py-3 shadow-md"
                >
                  <ExternalLink size={16}/> View Ledger
                </button>
                  <button 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="btn btn-error btn-outline flex-1 gap-2 rounded-sm py-3 h-12"
                >
                  <Trash2 size={16}/> Unassign
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- DIALOG 2: Delete Confirmation Dialog --- */}
      {isDeleteConfirmOpen && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-[60]">
          <div className="modal-box w-11/12 max-w-sm rounded-lg p-0 overflow-hidden bg-base-100 shadow-2xl">
            <div className="p-6 md:p-8 text-center bg-base-100">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-base-content">Unassign Project?</h3>
              <p className="text-sm text-base-content/70 mt-3 leading-relaxed">
                Are you sure you want to remove <strong>{viewingProject?.projectName}</strong>? The foreman will no longer manage expenses for this project.
              </p>
            </div>
            <div className="flex p-4 gap-3 bg-base-200/50 border-t border-base-200">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)} 
                disabled={isDeleting}
                className="btn btn-ghost text-base-content/70 flex-1 h-12 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAssignment} 
                disabled={isDeleting}
                className="btn btn-error text-white flex-1 h-12 shadow-lg rounded-md disabled:bg-error/70"
              >
                {/* LOADING STATE LOGIC */}
                {isDeleting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Yes, Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DIALOG 3: Assign Project Modal --- */}
      {isAssignModalOpen && (
        <div className="modal modal-open bg-black/40 backdrop-blur-[2px] z-50">
          {/* Responsive Width */}
          <div className="modal-box w-11/12 max-w-md p-0 rounded-md bg-base-100">
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 relative">
              <button onClick={() => setIsAssignModalOpen(false)} className="absolute right-4 top-4 md:right-6 md:top-6 text-base-content/40 hover:text-base-content"><X size={20}/></button>
              <h3 className="text-lg md:text-xl font-semibold text-base-content">Assign Project</h3>
              <p className="text-xs text-base-content/50 mt-1 uppercase tracking-widest">Select from database</p>
            </div>
            
            <div className="p-6 md:p-8 pt-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-base-content/40"><Search size={16}/></div>
                <input 
                  type="text" 
                  className="input input-bordered w-full h-12 pl-12 pr-4 bg-base-200 focus:outline-none focus:border-[var(--primary-color)] text-sm" 
                  style={{ '--tw-ring-color': 'var(--primary-color)' }}
                  placeholder="Search project name..."
                  value={projectSearchQuery}
                  onChange={(e) => { setProjectSearchQuery(e.target.value); setSelectedProjectForAssign(null); }}
                />
                
                {/* Search Dropdown */}
                {projectSearchQuery && !selectedProjectForAssign && (
                  <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map(p => (
                      <div key={p._id} onClick={() => { setSelectedProjectForAssign(p); setProjectSearchQuery(p.name); }} className="px-5 py-3 hover:bg-base-200 cursor-pointer flex justify-between items-center group border-b border-base-200 last:border-none">
                        <span className="text-sm font-medium text-base-content/70 group-hover:text-base-content">{p.name}</span>
                        <span className="text-[10px] text-base-content/40">{p.location || 'Local'}</span>
                      </div>
                    )) : <div className="p-4 text-center text-xs text-base-content/40">No matches found</div>}
                  </div>
                )}
              </div>
              
              {/* Selected Item Preview */}
              {selectedProjectForAssign && (
                <div className="mt-6 p-5 rounded-md border border-base-300 space-y-2 animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color) 5%, transparent)' }}>
                   <p className="text-xs font-bold uppercase opacity-60" style={primaryText}>Selected Project</p>
                   <p className="font-bold text-base-content">{selectedProjectForAssign.name}</p>
                   <p className="text-xs text-base-content/60 flex items-center gap-1"><MapPin size={12}/> {selectedProjectForAssign.location}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8 pt-0">
              <button 
                onClick={handleAssignSubmit} 
                disabled={!selectedProjectForAssign} 
                className="w-full h-12 rounded-md font-bold text-white disabled:bg-base-200 disabled:text-base-content/30 transition-all shadow-md active:scale-95" 
                style={selectedProjectForAssign ? primaryBg : {}}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForemanProjectsPage;