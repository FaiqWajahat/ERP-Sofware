'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Edit, Trash, X, MapPin, Calendar, Wallet, AlertTriangle, 
  Briefcase, CheckCircle, Search, Plus, Building2,
  LayoutDashboard
} from 'lucide-react';

import DashboardPageHeader from '@/Components/DashboardPageHeader';
import CustomDropdown from '@/Components/CustomDropdown';
import DashboardSearch from '@/Components/DashboardSearch';
import CustomLoader from '@/Components/CustomLoader';
import { errorToast, successToast } from '@/lib/toast';
import Avatar from '@/Components/Avatar';

// --- Helper Components ---

const ProjectAvatar = ({ name, size = 'md' }) => {
  const sizeClasses = { sm: 'w-12 h-12', md: 'w-10 h-10', lg: 'w-20 h-20' };
  const sizePixels = { sm: 48, md: 40, lg: 80 };
  
  // Using a square/rounded-lg shape for projects to distinguish from employees
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Project')}&background=random&size=${sizePixels[size]}&bold=true&format=svg&rounded=false`; 

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden ring-2 ring-base-300 ring-offset-base-100 ring-offset-2 shadow-md flex-shrink-0`}>
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover"/>
    </div>
  );
};

const formatCurrency = (amount) => {
  if (!amount || typeof amount !== 'number') return 'SAR 0';
  return `SAR ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return 'N/A'; }
};

// --- Main Component ---

export default function ProjectsPage() {
  const router = useRouter();

  // Data States
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [selectedProject, setSelectedProject] = useState(null); // For Details Modal
  const [isOpen, setIsOpen] = useState(false); // Modal visibility
  const [deleteConfirm, setDeleteConfirm] = useState(null); // For Delete Modal
  const [isDeleting, setIsDeleting] = useState(false);

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Projects", href: "/Dashboard/Projects" },
  ];

  const dropdownMenu = ['All', 'Active', 'Completed'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/project');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      errorToast("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Actions ---

  const openDialog = (project) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedProject(null), 200);
  };

  const handleDeleteClick = (project) => {
    setDeleteConfirm(project);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const targetId = deleteConfirm._id || deleteConfirm.id;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/project/${targetId}`);
      if (response.data.success) {
        successToast(response.data.message || "Project deleted successfully");
        setProjects(prev => prev.filter(p => (p._id || p.id) !== targetId));
        setDeleteConfirm(null);
        setIsOpen(false); // Close details modal if open
      } else {
        errorToast(response.data.message || "Failed to delete project");
      }
    } catch (error) {
      errorToast("Error deleting project");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Filtering ---

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' 
      ? true 
      : p.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  if (isLoading) return <CustomLoader text={"Loading Projects..."} />

 else return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Projects" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Total Projects</div>
            <div className="stat-value text-2xl">{stats.total}</div>
            <div className="stat-desc">All registered projects</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Active</div>
            <div className="stat-value text-2xl text-success">{stats.active}</div>
            <div className="stat-desc text-success">Currently ongoing</div>
          </div>
        </div>
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Completed</div>
            <div className="stat-value text-2xl text-[var(--primary-color)]">{stats.completed}</div>
            <div className="stat-desc text-[var(--primary-color)]">Finished projects</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6">
        
        {/* Header / Filter Section */}
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          

          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:full justify-between">
            <div className="w-full md:w-auto">
              <DashboardSearch 
                placeholder="Search Projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className='flex items-center gap-4 mx-auto md:mx-0'>
            <div>
              <CustomDropdown 
                value={statusFilter} 
                setValue={setStatusFilter} 
                dropdownMenu={dropdownMenu} 
              />
            </div>
            <button
               onClick={() => router.push('/Dashboard/Projects/Add')}
               className="btn btn-sm bg-[var(--primary-color)] text-white rounded-sm"
            >
               <Plus className="w-4 h-4 mr-1" /> Add Project
            </button>
          </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="w-full overflow-x-auto">
          <table className="table w-full table-md">
            <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
              <tr>
                <th>S.No</th>
                <th>Project Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Start Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <tr 
                    key={project._id || project.id} 
                    onClick={() => openDialog(project)}
                    className="hover:bg-base-200/40 transition cursor-pointer"
                  >
                    <td className="font-medium">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <Avatar name={project.name} size="md" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-medium whitespace-nowrap">{project.name}</h3>
                          <span className="text-xs text-[var(--primary-color)] whitespace-nowrap">{project.clientName || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-base-content/70">
                         <MapPin className="w-3.5 h-3.5" />
                         <span className="truncate max-w-[150px]">{project.location}</span>
                      </div>
                    </td>
                    <td>
                      {project.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-700 text-xs font-medium border border-green-500/10">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-700 text-xs font-medium border border-blue-500/10">
                           <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {project.status}
                        </span>
                      )}
                    </td>
                    <td className="text-sm whitespace-nowrap">{formatDate(project.startDate)}</td>
                  </tr>
                ))
              ) : (
                 <tr>
                    <td colSpan={5} className="text-center py-12 text-base-content/60">
                        {searchTerm ? 'No projects found matching search.' : 'No projects available.'}
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Details Modal (Copied Structure from EmployeeTable) --- */}
      {isOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeDialog}>
          <div className="relative w-full max-w-lg max-h-[90vh] bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-base-200/50 to-base-300/30 px-8 pt-8 pb-6 flex-shrink-0">
               <button className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle hover:bg-base-100/50" onClick={closeDialog}>
                  <X className="h-4 w-4" />
               </button>
               <div className="flex items-center gap-5">
                  <div className="relative">
                     <div className="shadow-lg ring-4 ring-base-100 rounded-lg">
                        <Avatar name={selectedProject.name} size="lg" />
                     </div>
                     <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-base-100 shadow-sm ${selectedProject.status === 'active' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  </div>
                  <div className="flex-1">
                     <h2 className="text-xl font-bold text-base-content mb-1 leading-tight">{selectedProject.name}</h2>
                     <p className="text-sm text-base-content/60 font-medium">{selectedProject.clientName || 'No Client Specified'}</p>
                     <div className="mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${selectedProject.status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}`}>
                           {selectedProject.status === 'active' ? 'Active Project' : selectedProject.status}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
               {/* Location & Client */}
               <div>
                  <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">General Information</h3>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0"><MapPin className="h-4 w-4 text-base-content/70" /></div>
                        <div>
                           <p className="text-xs text-base-content/50 font-medium">Location</p>
                           <p className="text-sm font-medium">{selectedProject.location || 'N/A'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0"><Briefcase className="h-4 w-4 text-base-content/70" /></div>
                        <div>
                           <p className="text-xs text-base-content/50 font-medium">Client</p>
                           <p className="text-sm font-medium">{selectedProject.clientName || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="border-t border-base-200"></div>

               {/* Financials & Timeline */}
               <div>
                  <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">Financials & Timeline</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50">
                        <Calendar className="h-4 w-4 text-base-content/50" />
                        <div>
                           <p className="text-xs text-base-content/50 font-medium">Start Date</p>
                           <p className="text-sm font-semibold">{formatDate(selectedProject.startDate)}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50">
                        <Wallet className="h-4 w-4 text-base-content/50" />
                        <div>
                           <p className="text-xs text-base-content/50 font-medium">Budget</p>
                           <p className="text-sm font-semibold">{formatCurrency(selectedProject.estimatedBudget)}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Description */}
               {selectedProject.details && (
                  <div>
                     <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">Scope of Work</h3>
                     <div className="p-3 bg-base-200/30 rounded-lg border border-base-200">
                        <p className="text-sm text-base-content/80 leading-relaxed">{selectedProject.details}</p>
                     </div>
                  </div>
               )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-4 py-5 bg-base-200/30 border-t border-base-200 flex-shrink-0">
             <button 
                  onClick={() => router.push(`/Dashboard/Projects/${selectedProject._id || selectedProject.id}/Dashboard`)}
                  className="btn bg-[var(--primary-color)] text-white rounded-sm flex-1 gap-2 shadow-sm hover:bg-[var(--primary-color)]/90"
               >
                  <LayoutDashboard className="h-4 w-4" /> Ledger
               </button>
               <button 
                  onClick={() => router.push(`/Dashboard/Projects/Edit/${selectedProject._id || selectedProject.id}`)}
                  className="btn bg-secondary text-secondary-content rounded-sm flex-1 gap-2 shadow-sm "
               >
                  <Edit className="h-4 w-4" /> Edit 
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(selectedProject); }}
                  className="btn btn-ghost gap-2 rounded-sm text-error hover:bg-error/10 hover:border-error/20"
               >
                  <Trash className="h-4 w-4" /> Delete
               </button>
            </div>

          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirm(null)}>
          <div className="relative w-full max-w-md bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
               <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                     <AlertTriangle className="h-8 w-8 text-error" />
                  </div>
               </div>
               <h3 className="text-xl font-bold text-center mb-2">Delete Project</h3>
               <p className="text-sm text-base-content/70 text-center mb-6">
                  Are you sure you want to delete <span className="font-semibold text-base-content">{deleteConfirm.projectName}</span>? This action cannot be undone.
               </p>

               <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost flex-1 rounded-sm" disabled={isDeleting}>Cancel</button>
                  <button onClick={handleConfirmDelete} className="btn btn-error text-white flex-1 rounded-sm gap-2" disabled={isDeleting}>
                     {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : <Trash className="h-4 w-4" />}
                     Delete Project
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}