'use client';
import axios from 'axios';
import { FolderKanban, Users2, Package } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';

const DashboardTopStats = () => {

  const [projectsCount, setProjectsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [assetsCount, setAssetsCount] = useState(0);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const response = await axios.get('/api/top-stats');
      const data = response.data;
      if (data.success) {
        setProjectsCount(data.data.projectCount || 0);
        setEmployeesCount(data.data.employeeCount || 0);
        setAssetsCount(data.data.assetCount || 0);
      }
    } catch (error) {
      console.error('Error fetching top stats counts:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      
      {/* Projects Card */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-base-content/60 uppercase font-bold tracking-wider mb-1">
              Total Projects
            </div>
            <div className="text-2xl font-bold text-[var(--primary-color)]">
              <CountUp start={0} end={projectsCount} duration={2.5} separator="," />
            </div>
            <div className="text-xs text-base-content/60 mt-1">
              Active & Completed
            </div>
          </div>
          <div className="p-2 bg-base-200 rounded-lg text-[var(--primary-color)]">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Employees Card */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-base-content/60 uppercase font-bold tracking-wider mb-1">
              Total Employees
            </div>
            <div className="text-2xl font-bold text-[var(--primary-color)]">
              <CountUp start={0} end={employeesCount} duration={2.5} separator="," />
            </div>
            <div className="text-xs text-base-content/60 mt-1">
              Registered workforce
            </div>
          </div>
          <div className="p-2 bg-base-200 rounded-lg text-[var(--primary-color)]">
            <Users2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Assets Card */}
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4 transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-base-content/60 uppercase font-bold tracking-wider mb-1">
              Total Assets
            </div>
            <div className="text-2xl font-bold text-[var(--primary-color)]">
              <CountUp start={0} end={assetsCount} duration={2.5} separator="," />
            </div>
            <div className="text-xs text-base-content/60 mt-1">
              Machinery & Vehicles
            </div>
          </div>
          <div className="p-2 bg-base-200 rounded-lg text-[var(--primary-color)]">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

    </div>
  )
}

export default DashboardTopStats;