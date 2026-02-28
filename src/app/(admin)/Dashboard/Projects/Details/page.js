'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import DashboardSearch from "@/Components/DashboardSearch";
import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from '@/Components/CustomLoader';
import axios from 'axios';
import { errorToast } from '@/lib/toast';
import { MapPin, Calendar, Building2 } from 'lucide-react';

// Reusing the ProjectAvatar style from previous contexts
const ProjectAvatar = ({ name }) => {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Project')}&background=random&size=40&bold=true&format=svg&rounded=false`; 
  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden ring-1 ring-base-300 shadow-sm">
      <img src={avatarUrl} alt={name} className="w-full h-full object-cover"/>
    </div>
  );
};

const ProjectRecord = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Statuses relevant to Projects
  const dropdownMenu = ['Active', 'Completed', 'All'];

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Projects", href: "/Dashboard/Projects" },
  ];

  // Fetch Projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get("/api/project"); // Adjust if your endpoint is different
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setProjects(response.data.data || response.data.projects);
    } catch (error) {
      console.log("error of fetching projects:", error);
      errorToast(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Projects
  const filteredProjects = projects.filter(proj => {
    const sTerm = searchTerm.toLowerCase();
    
    const matchesSearch = 
        proj.name?.toLowerCase().includes(sTerm) ||
        proj.clientName?.toLowerCase().includes(sTerm) ||
        proj.location?.toLowerCase().includes(sTerm);

    const matchesStatus = selectedStatus === 'All' || 
        (selectedStatus === 'Active' && proj.status === 'active') ||
        (selectedStatus === 'Completed' && proj.status === 'completed');

    return matchesSearch && matchesStatus;
  });

  // Stats Logic
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  // Navigate to Project Details
  const handleViewProject = (projectId) => {
    // You can adjust this route to where you want to go (e.g., Tracking, Edit, or Details)
    router.push(`/Dashboard/Projects/${projectId}/Dashboard`);
  };

  if (isLoading) {
    return <CustomLoader text={"Loading Projects..."}/>;
  }

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Project Records" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Total Projects</div>
            <div className="stat-value text-2xl">
              {projects.length}
            </div>
            <div className="stat-desc">All Registered Sites</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Active</div>
            <div className="stat-value text-2xl text-success">
              {activeProjects}
            </div>
            <div className="stat-desc text-success">Ongoing Projects</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Completed</div>
            <div className="stat-value text-2xl text-[var(--primary-color)]">
              {completedProjects}
            </div>
            <div className="stat-desc text-[var(--primary-color)]">Finished Projects</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <p className="text-sm text-base-content/60 mt-1">
               Select a project to manage records.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-full md:w-auto justify-center md:justify-start flex">
              <DashboardSearch 
                placeholder="Search Project or Client" 
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

        {/* Projects Table */}
        <div className="w-full overflow-x-auto">
          <table className="table w-full">
            <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
              <tr>
                <th>S.No</th>
                <th>Project</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((proj, idx) => (
                  <tr
                    onClick={() => handleViewProject(proj._id || proj.id)}
                    key={proj._id || proj.id}
                    className="hover:bg-base-200/40 transition cursor-pointer"
                  >
                    <td>{idx + 1}</td>

                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                           <ProjectAvatar name={proj.name} />
                        </div>
                        <div>
                          <h3 className="font-medium">{proj.name}</h3>
                          <p className="text-xs text-base-content/70 flex items-center gap-1">
                             <Building2 className="w-3 h-3"/> {proj.clientName || 'Private Client'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-sm">
                       <div className="flex items-center gap-1.5 opacity-80">
                          <MapPin className="w-3.5 h-3.5" /> 
                          {proj.location}
                       </div>
                    </td>
                    
                    <td className="text-sm font-mono opacity-80">
                        {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'N/A'}
                    </td>

                    <td>
                      {proj.status === 'active' ? (
                        <span className="text-success font-medium flex items-center gap-1">
                          Active
                        </span>
                      ) : (
                        <span className="text-[var(--primary-color)] font-medium flex items-center gap-1">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <p className="text-base-content/60">
                      {searchTerm ? 'No projects found matching your search' : 'No projects available'}
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

export default ProjectRecord;