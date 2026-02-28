"use client";

import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RecentProjectsTable() {
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    fetchRecentProjects();
  }, []);

  const fetchRecentProjects = async () => {
    try {
     
      const response = await axios.get("/api/project/recentProjects");
      const data = response.data;
      if (data.success) {
        setProjects(data.data || []);
      } else {
        console.error("Failed to fetch projects:", data.message);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      // Small delay to prevent flickering if data loads too fast (optional)
      setTimeout(() => setLoading(false), 100);
    }
  };

  // Helper to get status badge based on your enum: ['active', 'completed', 'on_hold']
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || "";
    
    switch (s) {
      case "active":
        return <span className="badge badge-success badge-sm text-white gap-1">Active</span>;
      case "completed":
        return <span className="badge badge-info badge-sm text-white gap-1">Completed</span>;
      case "on_hold":
        return <span className="badge badge-warning badge-sm text-white gap-1">On Hold</span>;
      default:
        return <span className="badge badge-ghost badge-sm">{status || "Unknown"}</span>;
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="table w-full table-md">
        {/* Table Header */}
        <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
          <tr>
            <th>Project Name</th>
            <th>Location</th>
            <th>Status</th>
          
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {loading ? (
            // --- SKELETON LOADER STATE ---
            // Creating 5 skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td>
                  <div className="h-4 w-32 bg-base-300 rounded"></div>
                  <div className="h-3 w-20 bg-base-200 rounded mt-2"></div>
                </td>
                <td>
                  <div className="h-4 w-24 bg-base-300 rounded"></div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-16 bg-base-300 rounded-full"></div>
                     <div className="h-3 w-6 bg-base-200 rounded"></div>
                  </div>
                </td>
                <td>
                  <div className="h-6 w-16 bg-base-300 rounded-full"></div>
                </td>
              </tr>
            ))
          ) : projects.length === 0 ? (
            // --- EMPTY STATE ---
            <tr>
              <td colSpan={4} className="text-center py-10 text-base-content/60">
                No recent projects found.
              </td>
            </tr>
          ) : (
            // --- REAL DATA STATE ---
            projects.map((project, idx) => (
              <tr 
                key={project._id || idx} 
                className="hover:bg-base-200/40 transition cursor-pointer"
                
              >
                <td>
                  <div className="font-medium">{project.name}</div>
                  {project.clientName && (
                    <div className="text-xs text-base-content/60">{project.clientName}</div>
                  )}
                </td>
                
                <td className="text-sm text-base-content/80">
                  {project.location || "N/A"}
                </td>

               

                <td>{getStatusBadge(project.status)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}