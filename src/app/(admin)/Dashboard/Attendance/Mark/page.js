
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Search,
  ChevronDown,
  Edit2,
  Building,
  User,
  Trash2,
  Filter,
  Check,
  PieChart,
  Users
} from "lucide-react";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import Avatar from "@/Components/Avatar";

// API Configuration
const API_ENDPOINTS = {
  GET_ATTENDANCE: "/api/attendance",
  SAVE_ATTENDANCE: "/api/attendance",
  GET_EMPLOYEES: "/api/attendance/employee",
  GET_PROJECTS: "/api/attendance/project",
};

// --- DROPDOWNS ---

// UPDATED: Added 'disabled' prop to handle logic
const ModernProjectDropdown = ({ value, onChange, projects, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown if it becomes disabled while open
  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  return (
    <div className="relative w-48" ref={dropdownRef}>
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm("");
          }
        }}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-xs font-medium 
          border rounded-md transition-all duration-200
          ${disabled 
            ? "bg-base-200 border-base-200 text-base-content/30 cursor-not-allowed" 
            : "cursor-pointer " + (value 
                ? "bg-[var(--primary-color)]/5 border-[var(--primary-color)] text-[var(--primary-color)]" 
                : "bg-base-100 border-base-300 hover:border-base-400 text-base-content/60")
          }
        `}
      >
        <span className="truncate flex items-center gap-2">
           <Building className="w-3.5 h-3.5" />
           {value ? value.name : (disabled ? "N/A" : "Assign Project")}
        </span>
        {!disabled && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>

      {/* Dropdown Menu - Added z-50 and shadow-xl */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-64 mt-1 bg-base-100 border border-base-200 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 origin-top-left left-0">
          <div className="p-2 border-b border-base-100 sticky top-0 bg-base-100 rounded-t-lg">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-content/40" />
              <input
                autoFocus
                type="text"
                placeholder="Find project..."
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-base-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => {
                    onChange(project);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer transition-colors
                    ${value?._id === project._id ? "bg-[var(--primary-color)]/10 text-[var(--primary-color)]" : "hover:bg-base-200"}
                  `}
                >
                  <span>{project.name}</span>
                  {value?._id === project._id && <Check className="w-3 h-3" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-base-content/40">
                No projects found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModernStatusDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusConfig = {
    Present: { color: "text-success", bg: "bg-success/10", border: "border-success/20", icon: CheckCircle },
    Absent: { color: "text-error", bg: "bg-error/10", border: "border-error/20", icon: XCircle },
    Leave: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", icon: Clock },
    Default: { color: "text-base-content/60", bg: "bg-base-100", border: "border-base-300", icon: ChevronDown }
  };

  const currentStyle = statusConfig[value] || statusConfig.Default;
  const Icon = currentStyle.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-32" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2 text-xs font-semibold 
          border rounded-md transition-all duration-200
          ${value ? `${currentStyle.bg} ${currentStyle.border} ${currentStyle.color}` : "bg-base-100 border-base-300 hover:border-base-400"}
        `}
      >
        <div className="flex items-center gap-2">
           {value && <Icon className="w-3.5 h-3.5" />}
           <span>{value || "Select"}</span>
        </div>
        {!value && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
      </button>

      {/* Dropdown Menu - Added z-50 for stacking */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {["Present", "Absent", "Leave"].map((option) => {
             const style = statusConfig[option];
             const OptIcon = style.icon;
             return (
              <div
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2.5 text-xs cursor-pointer hover:bg-base-200 transition-colors
                  ${value === option ? "bg-base-100 font-bold" : ""}
                `}
              >
                <OptIcon className={`w-3.5 h-3.5 ${style.color}`} />
                <span>{option}</span>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

export default function MarkAttendancePage() {
  const todayISO = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);

  // Data States
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [projectAssignments, setProjectAssignments] = useState({});

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedDate && employees.length > 0) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_EMPLOYEES);
      setEmployees(Array.isArray(response.data) ? response.data : response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_PROJECTS);
      setProjects(Array.isArray(response.data) ? response.data : response.data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.GET_ATTENDANCE, { params: { date } });
      const { marked, records } = response.data;

      if (marked && Array.isArray(records) && records.length > 0) {
        const attendanceMap = {};
        const projectMap = {};

        records.forEach((record) => {
          const empId = record.employeeId;
          attendanceMap[empId] = record.status;
          if (record.projectId) {
            const proj = projects.find((p) => p._id === record.projectId);
            projectMap[empId] = proj ? proj : { _id: record.projectId, name: record.projectName };
          }
        });

        setAttendance(attendanceMap);
        setProjectAssignments(projectMap);
        setAttendanceMarked(true);
        setIsEditMode(false);
      } else {
        setAttendance({});
        setProjectAssignments({});
        setAttendanceMarked(false);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance({});
      setProjectAssignments({});
      setAttendanceMarked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      q === "" ||
      emp.name.toLowerCase().includes(q) ||
      (emp.iqamaNumber && emp.iqamaNumber.toLowerCase().includes(q))
    );
  });

  const stats = useMemo(() => ({
    total: filteredEmployees.length,
    present: filteredEmployees.filter((e) => attendance[e._id] === "Present").length,
    absent: filteredEmployees.filter((e) => attendance[e._id] === "Absent").length,
    leave: filteredEmployees.filter((e) => attendance[e._id] === "Leave").length,
  }), [filteredEmployees, attendance]);

  const completionPercentage = filteredEmployees.length
    ? Math.round(
        (Object.keys(attendance).filter((id) => filteredEmployees.some((fe) => fe._id === id)).length /
          filteredEmployees.length) * 100
      )
    : 0;

  // UPDATED: Logic to clear project if not Present
  const updateStatus = (id, status) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
    
    // If status changes to anything other than Present, remove the project assignment
    if (status !== 'Present') {
      setProjectAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[id];
        return newAssignments;
      });
    }
  };

  const updateProject = (id, project) => {
    setProjectAssignments((prev) => ({ ...prev, [id]: project }));
  };

  const markAllAs = (status) => {
    const newAtt = { ...attendance };
    filteredEmployees.forEach((emp) => {
      newAtt[emp._id] = status;
    });
    setAttendance(newAtt);
    
    // If bulk marking anything other than Present, clear all projects
    if (status !== 'Present') {
      setProjectAssignments({});
    }
  };

  const clearAllMarks = () => {
    setAttendance({});
    setProjectAssignments({});
  };

  const handleSave = async () => {
    if (filteredEmployees.length === 0) return;

    const payloadData = filteredEmployees
      .map((emp) => {
        const status = attendance[emp._id];
        if (!status) return null;
        
        // Double check safeguard: If not present, ensure project is null
        const assignedProject = status === 'Present' ? projectAssignments[emp._id] : null;

        return {
          employeeId: emp._id,
          employeeName: emp.name,
          iqama: emp.iqamaNumber,
          status: status,
          projectId: assignedProject?._id || null,
          projectName: assignedProject?.name || "No project",
        };
      })
      .filter(Boolean);

    if (payloadData.length === 0) {
      alert("Please mark at least one employee.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(API_ENDPOINTS.SAVE_ATTENDANCE, {
        date: selectedDate,
        attendance: payloadData,
      });

      if (response.data.success) {
        setAttendanceMarked(true);
        setIsEditMode(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    setAttendanceMarked(false);
  };

  const canEdit = !attendanceMarked || isEditMode;
  const breadData = [{ name: "Dashboard", href: "/Dashboard" }, { name: "Mark Attendance", href: "/Dashboard/Attendance/Mark" }];

  const StatCard = ({ title, value, subtext, colorClass, }) => (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4  transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1">
            {title}
          </span>
          <span className={`text-2xl font-bold ${colorClass}`}>
            {value}
          </span>
          <span className={`text-[10px] font-medium ${colorClass} opacity-80 mt-1`}>
            {subtext}
          </span>
        </div>
      
      </div>
    </div>
  );

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Mark Attendance" />
      <div className="w-full pb-20"> 
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <StatCard title="Total Staff" value={stats.total} subtext="Active Employees" icon={Users} colorClass="text-base-content" bgClass="bg-base-200"/>
             <StatCard title="Present" value={stats.present} subtext="Checked In" icon={CheckCircle} colorClass="text-success" bgClass="bg-success/10"/>
             <StatCard title="Absent" value={stats.absent} subtext="Not Arrived" icon={XCircle} colorClass="text-error" bgClass="bg-error/10"/>
             <StatCard title="On Leave" value={stats.leave} subtext="Approved Leave" icon={Clock} colorClass="text-warning" bgClass="bg-warning/10"/>
             <div className="card bg-base-100 border border-base-200 shadow-sm p-4 col-span-2 md:col-span-1">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Completion</span>
                      <div className="text-2xl font-bold text-[var(--primary-color)]">{completionPercentage}%</div>
                   </div>
                   <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                      <PieChart className="w-5 h-5 text-[var(--primary-color)]" />
                   </div>
                </div>
                <progress className="progress progress-primary w-full h-1.5" value={completionPercentage} max="100"></progress>
             </div>
          </div>

          {/* Action Header */}
          <div className="sticky top-0 z-30 bg-base-100 border border-base-200 rounded-lg  shadow-sm p-3 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
             <div className="flex items-center gap-3 w-full md:w-auto bg-base-200/50 p-2 rounded-lg border border-base-200/50">
                <Calendar className="w-4 h-4 text-[var(--primary-color)]"/>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"/>
             </div>
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input type="text" placeholder="Search name or iqama..." onChange={(e) => setSearchQuery(e.target.value)} className="input input-sm w-full pl-10 h-10 bg-base-200/50 focus:bg-base-100 transition-colors border-transparent focus:border-[var(--primary-color)] rounded-lg"/>
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                 <div className="dropdown dropdown-center w-full md:w-auto">
                    <button tabIndex={0} className="btn btn-sm btn-outline gap-2 h-10 w-full md:w-auto border-base-300">
                       <Filter className="w-4 h-4"/> Bulk
                    </button>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200 mt-1">
                       <li><a onClick={() => markAllAs("Present")} className="text-xs text-success font-medium">Mark All Present</a></li>
                       <li><a onClick={() => markAllAs("Absent")} className="text-xs text-error font-medium">Mark All Absent</a></li>
                       <li><a onClick={() => markAllAs("Leave")} className="text-xs text-warning font-medium">Mark All Leave</a></li>
                       <li className="border-t mt-1 pt-1"><a onClick={clearAllMarks} className="text-xs">Clear All</a></li>
                    </ul>
                 </div>
                 <button onClick={handleSave} disabled={Object.keys(attendance).length === 0 || isSaving || !canEdit} className="btn btn-sm bg-[var(--primary-color)] text-white hover:opacity-90 h-10 w-auto shadow-md border-none">
                     {isSaving ? <span className="loading loading-spinner loading-xs"></span> : <Save className="w-4 h-4 mr-1"/>} Save
                 </button>
             </div>
          </div>

          {/* Status Messages */}
          {isLoading && (
            <div className="alert alert-info shadow-sm text-xs rounded-lg animate-pulse">
              <span className="loading loading-spinner loading-sm"></span>
              <span>Loading data...</span>
            </div>
          )}
          {showSuccess && (
            <div className="alert alert-success shadow-sm text-xs rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Attendance saved for {new Date(selectedDate).toLocaleDateString()}!</span>
            </div>
          )}
          {!isLoading && attendanceMarked && !isEditMode && (
            <div className="alert bg-yellow-50 text-yellow-800 border-yellow-200 shadow-sm text-xs rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <CheckCircle className="w-5 h-5" />
                 <span>Attendance marked.</span>
              </div>
              <button onClick={enableEditMode} className="btn btn-sm bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200">
                <Edit2 className="w-3 h-3 mr-1" /> Edit
              </button>
            </div>
          )}

          {/* Table */}
          {!isLoading && canEdit && (
             // UPDATED: Removed overflow-hidden from this container so dropdowns can pop out
             <div className="bg-base-100 border border-base-200 rounded-xl shadow-sm">
                <div className="overflow-x-auto min-h-[400px] rounded-xl">
                   <table className="table w-full">
                      {/* Added rounded corners to thead since we removed overflow-hidden from parent */}
                      <thead className="bg-base-200/50 text-xs uppercase font-bold text-base-content/60 rounded-t-xl">
                         <tr>
                            <th className="w-12 text-center rounded-tl-xl">#</th>
                            <th>Employee Details</th>
                            <th>Current Status</th>
                            <th>Project Assignment</th>
                            <th className="w-16 text-center rounded-tr-xl">Clear</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-base-100">
                         {filteredEmployees.length === 0 ? (
                           <tr><td colSpan="5" className="text-center py-10 text-base-content/40">No employees found matching search.</td></tr>
                         ) : (
                           filteredEmployees.map((emp, i) => (
                              <tr key={emp._id} className="hover:bg-base-50 transition-colors group">
                                 <td className="text-center text-xs text-base-content/50">{i + 1}</td>
                                 <td>
                                    <div className="flex items-center gap-3">
                                       <div className="avatar">
                                          <Avatar name={emp.name} size="md"/>
                                       </div>
                                       <div>
                                          <div className="font-bold text-sm text-base-content">{emp.name}</div>
                                          <div className="text-xs text-base-content/50 font-mono">{emp.iqamaNumber}</div>
                                       </div>
                                    </div>
                                 </td>
                                 {/* Status Dropdown */}
                                 <td className="relative">
                                    <ModernStatusDropdown 
                                       value={attendance[emp._id]} 
                                       onChange={(status) => updateStatus(emp._id, status)}
                                    />
                                 </td>
                                 {/* Project Dropdown */}
                                 <td className="relative">
                                    <ModernProjectDropdown 
                                       value={projectAssignments[emp._id]}
                                       projects={projects}
                                       // UPDATED: Disabled if status is NOT Present
                                       disabled={attendance[emp._id] !== 'Present'} 
                                       onChange={(project) => updateProject(emp._id, project)}
                                    />
                                 </td>
                                 <td className="text-center">
                                    {(attendance[emp._id] || projectAssignments[emp._id]) && (
                                       <button 
                                          onClick={() => {
                                             setAttendance(prev => { const c={...prev}; delete c[emp._id]; return c; });
                                             setProjectAssignments(prev => { const c={...prev}; delete c[emp._id]; return c; });
                                          }}
                                          className="btn btn-ghost btn-xs text-base-content/30 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
        </div>
      </div>
    </>
  );
}