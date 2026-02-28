'use client'
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, Trash2, Plus, Search, User, Briefcase, Calendar, Loader2, DollarSign, X } from "lucide-react";
import { errorToast, sucessToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import axios from "axios";

// --- ISOLATED SEARCH COMPONENT (Fixed Logic) ---
const EmployeeSearchInput = ({ row, index, employees, onSearchChange, onSelect, onClear }) => {
  const wrapperRef = useRef(null);

  // Handle Click Outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (row.isSearchOpen) {
          // Close dropdown via the parent handler (passing specific flag)
          onSearchChange(index, row.name, false); 
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [row.isSearchOpen, row.name, index, onSearchChange]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-base-100 transition-all ${
          row.isSearchOpen 
          ? 'border-[var(--primary-color)] ring-1 ring-[var(--primary-color)]' 
          : 'border-base-300 focus-within:border-[var(--primary-color)]'
      }`}>
        <Search className={`w-4 h-4 transition-colors ${row.isSearchOpen ? 'text-[var(--primary-color)]' : 'text-base-content/40'}`} />
        
        <input 
          type="text"
          placeholder="Search employee..."
          className="w-full bg-transparent outline-none text-sm placeholder:text-base-content/30"
          value={row.name}
          onChange={(e) => onSearchChange(index, e.target.value, true)}
          onFocus={() => onSearchChange(index, row.name, true)}
        />

        {/* Clear Button - Only visible if text exists */}
        {row.name && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(index); }}
            className="text-base-content/30 hover:text-error transition-colors p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* DROPDOWN LIST */}
      {row.isSearchOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[280px] bg-base-100 border border-base-200 rounded-lg shadow-xl z-[100] max-h-56 overflow-y-auto">
          {employees.filter(e => e.name.toLowerCase().includes(row.name.toLowerCase())).length > 0 ? (
            employees
              .filter(e => e.name.toLowerCase().includes(row.name.toLowerCase()))
              .map(emp => (
                <div 
                  key={emp._id}
                  // CRITICAL FIX: Use onMouseDown instead of onClick. 
                  // onMouseDown fires BEFORE the input blur or click-outside logic.
                  onMouseDown={(e) => { 
                    e.preventDefault(); // Prevent input blur
                    onSelect(index, emp); 
                  }}
                  className="px-4 py-3 border-b border-base-100 hover:bg-base-200 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold text-base-content/70">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-base-content">{emp.name}</p>
                    <p className="text-xs text-base-content/50">IQ: {emp.iqamaNumber} • {emp.role}</p>
                  </div>
                </div>
            ))
          ) : (
            <div className="p-4 text-center text-base-content/40 text-sm">No employee found</div>
          )}
        </div>
      )}
    </div>
  );
};

const AddSalaryList = () => {
  const router = useRouter();
  
  // --- STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [projects, setProjects] = useState([]);
  const [foremen, setForemen] = useState([]); 
  const [employees, setEmployees] = useState([]); 
  
  const [rows, setRows] = useState([
    { tempId: Date.now(), employeeId: "", name: "", iqama: "", salary: "", status: "pending", isSearchOpen: false }
  ]);
  
  const [headerData, setHeaderData] = useState({
    date: new Date().toISOString().slice(0, 7), 
    projectId: "",
    projectName: "",
    foremanId: "",
    foremanName: ""
  });
  
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isForemanOpen, setIsForemanOpen] = useState(false);
  const projectRef = useRef(null);
  const foremanRef = useRef(null);
  
  const [errors, setErrors] = useState({});
  const [salaryErrors, setSalaryErrors] = useState({});

  // --- API CALLS ---
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsFetchingData(true);
        const [projectsRes, employeesRes] = await Promise.all([
          axios.get("/api/project/active-projects"),
          axios.get("/api/attendance/employee")
        ]);
        setProjects(projectsRes.data.data || []);
        const employeeData = employeesRes.data.employees || [];
        setEmployees(employeeData);
        setForemen(employeeData.filter(emp => emp.role === "Foreman"));
      } catch (error) {
        console.error("Failed to load data", error);
        errorToast("Failed to load data.");
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchDropdownData();

    // Global Click Outside for Header Dropdowns
    const handleClickOutside = (event) => {
      if (projectRef.current && !projectRef.current.contains(event.target)) setIsProjectOpen(false);
      if (foremanRef.current && !foremanRef.current.contains(event.target)) setIsForemanOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ROW DATA HANDLERS ---

  // 1. Generic Updater
  const updateRow = (index, field, value) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });

    if (field === "salary" && salaryErrors[index]) {
      const newErrors = { ...salaryErrors };
      delete newErrors[index];
      setSalaryErrors(newErrors);
    }
  };

  // 2. Search Handler (Used by Child Component)
  const handleSearchChange = (index, newName, isOpen) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      const currentRow = { ...newRows[index] };
      
      currentRow.name = newName;
      currentRow.isSearchOpen = isOpen;
      
      // If user is typing, clear the ID to prevent "fake" selection
      if (newName !== currentRow.name) { 
        currentRow.employeeId = "";
        currentRow.iqama = "";
      }
      
      newRows[index] = currentRow;
      return newRows;
    });
  };

  // 3. Clear Handler
  const handleClearRow = (index) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      newRows[index] = { 
        ...newRows[index], 
        name: "", 
        employeeId: "", 
        iqama: "", 
        salary: "", // Optional: clear salary too
        isSearchOpen: false 
      };
      return newRows;
    });
  };

  // 4. Selection Handler (The Critical Fix)
  const handleSelectEmployee = (index, employee) => {
    // Check for duplicates
    const isDuplicate = rows.some((r, i) => i !== index && r.iqama === employee.iqamaNumber);
    if (isDuplicate) {
      errorToast(`${employee.name} is already in the list!`);
      return;
    }

    setRows(prevRows => {
      const newRows = [...prevRows];
      newRows[index] = {
        ...newRows[index],
        employeeId: employee._id,
        name: employee.name,
        iqama: employee.iqamaNumber,
        salary: employee.salary ? employee.salary.toString() : "",
        status: "pending",
        isSearchOpen: false // Close dropdown
      };
      return newRows;
    });

    // Clear salary error if exists
    if(employee.salary) {
      setSalaryErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const addRow = () => {
    setRows(prev => [
      ...prev.map(r => ({...r, isSearchOpen: false})), // Close others
      { tempId: Date.now(), employeeId: "", name: "", iqama: "", salary: "", status: "pending", isSearchOpen: false }
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) { errorToast("List must have at least one employee"); return; }
    setRows(prev => prev.filter((_, i) => i !== index));
    setSalaryErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[index];
        return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!headerData.projectId) newErrors.project = "Project is required";
    if (!headerData.foremanId) newErrors.foreman = "Foreman is required";
    if (!headerData.date) newErrors.date = "Date is required";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); errorToast("Please fill all required fields"); return; }

    let isSalaryValid = true;
    const newSalaryErrors = {};
    rows.forEach((row, index) => {
      if (row.employeeId && (!row.salary || Number(row.salary) <= 0)) {
        newSalaryErrors[index] = true;
        isSalaryValid = false;
      }
    });
    setSalaryErrors(newSalaryErrors);
    if (!isSalaryValid) { errorToast("Please enter a valid salary for all selected employees"); return; }

    const validRows = rows.filter(r => r.employeeId && r.salary);
    if (validRows.length === 0) { errorToast("Please add at least one valid employee."); return; }

    setIsSubmitting(true);
    try {
      const payload = { ...headerData, items: validRows };
      const response = await axios.post("/api/salary/salary-list/add", payload);
      if (!response.data.success) {
        errorToast(response.data.message || "Failed");
      } else {
        sucessToast("Salary list saved successfully!");
        router.back();
      }
    } catch (error) {
      errorToast(error.response?.data?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-color)]" />
          <p className="text-sm font-medium text-base-content/60">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-base-content">
      <div className=" mx-auto md:p-5 p-4 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">New Salary Sheet</h2>
            <p className="text-sm md:text-base text-base-content/60 mt-1">Create monthly salary records.</p>
          </div>
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm md:btn-md gap-2">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Back</span>
          </button>
        </div>

        {/* MAIN CARD */}
        <div className=" overflow-visible">
          
          {/* SELECTION AREA */}
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 border-b border-base-200">
            {/* Date */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase text-base-content/50">Period</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-base-content/40 pointer-events-none" />
                <input type="month" value={headerData.date} onChange={(e) => setHeaderData({...headerData, date: e.target.value})} className={`input input-bordered w-full pl-10 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] ${errors.date ? 'input-error' : ''}`} />
              </div>
            </div>
            
            {/* Project */}
            <div className="form-control relative" ref={projectRef}>
              <label className="label text-xs font-bold uppercase text-base-content/50">Project</label>
              <div onClick={() => setIsProjectOpen(!isProjectOpen)} className={`input input-bordered w-full flex items-center justify-between cursor-pointer focus:border-[var(--primary-color)] ${errors.project ? 'input-error' : ''} ${isProjectOpen ? 'border-[var(--primary-color)]' : ''}`}>
                <div className="flex items-center gap-2 truncate">
                    <Briefcase className={`w-4 h-4 ${headerData.projectName ? 'text-[var(--primary-color)]' : 'text-base-content/40'}`} />
                    <span className={`truncate ${!headerData.projectName && 'text-base-content/40'}`}>{headerData.projectName || "Select Project"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isProjectOpen ? 'rotate-180' : ''}`} />
              </div>
              {isProjectOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-base-100 border border-base-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {projects.map((p) => (<div key={p._id} onClick={() => { setHeaderData(prev => ({ ...prev, projectId: p._id, projectName: p.name })); setIsProjectOpen(false); setErrors(prev => ({ ...prev, project: "" })); }} className="px-4 py-3 hover:bg-base-200 cursor-pointer text-sm">{p.name}</div>))}
                </div>
              )}
            </div>
            
            {/* Foreman */}
            <div className="form-control relative" ref={foremanRef}>
              <label className="label text-xs font-bold uppercase text-base-content/50">Foreman</label>
              <div onClick={() => setIsForemanOpen(!isForemanOpen)} className={`input input-bordered w-full flex items-center justify-between cursor-pointer focus:border-[var(--primary-color)] ${errors.foreman ? 'input-error' : ''} ${isForemanOpen ? 'border-[var(--primary-color)]' : ''}`}>
                 <div className="flex items-center gap-2 truncate">
                    <User className={`w-4 h-4 ${headerData.foremanName ? 'text-[var(--primary-color)]' : 'text-base-content/40'}`} />
                    <span className={`truncate ${!headerData.foremanName && 'text-base-content/40'}`}>{headerData.foremanName || "Select Foreman"}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isForemanOpen ? 'rotate-180' : ''}`} />
              </div>
              {isForemanOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-base-100 border border-base-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {foremen.map((f) => (<div key={f._id} onClick={() => { setHeaderData(prev => ({ ...prev, foremanId: f._id, foremanName: f.name })); setIsForemanOpen(false); setErrors(prev => ({ ...prev, foreman: "" })); }} className="px-4 py-3 hover:bg-base-200 cursor-pointer"><p className="text-sm font-medium">{f.name}</p></div>))}
                </div>
              )}
            </div>
          </div>

          {/* LIST HEADER */}
          <div className="px-4 py-4 md:px-6 bg-base-200/30 flex justify-between items-center">
             <div className="flex items-center gap-2"><h3 className="font-bold text-base-content">Employee List</h3><span className="badge badge-sm badge-ghost">{rows.length}</span></div>
             <button onClick={addRow} className="btn btn-sm bg-[var(--primary-color)] text-white hover:opacity-90 border-none gap-1 shadow-sm"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Employee</span></button>
          </div>

          {/* MOBILE VIEW (CARDS) */}
          <div className="block md:hidden p-4 space-y-4">
             {rows.map((row, index) => (
                <div key={row.tempId} className="bg-base-100 rounded-lg border border-base-200 shadow-sm p-4 relative overflow-visible">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-base-content/30 bg-base-200 px-2 py-1 rounded">#{index + 1}</span>
                        <button onClick={() => removeRow(index)} className="btn btn-ghost btn-xs text-error"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
                        <div className="form-control">
                            <label className="label text-xs pb-1">Employee Name</label>
                            {/* SEARCH INPUT */}
                            <EmployeeSearchInput 
                              row={row} 
                              index={index} 
                              employees={employees} 
                              onSearchChange={handleSearchChange}
                              onSelect={handleSelectEmployee}
                              onClear={handleClearRow}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-control">
                                <label className="label text-xs pb-1">Salary (SAR)</label>
                                <div className={`flex items-center input input-bordered px-0 ${salaryErrors[index] ? 'input-error' : 'focus-within:border-[var(--primary-color)]'}`}>
                                    <span className="px-3 text-base-content/40 border-r border-base-300 h-full flex items-center bg-base-200/50 rounded-l-lg"><DollarSign className="w-3 h-3" /></span>
                                    <input type="number" className="w-full px-3 bg-transparent outline-none h-full" placeholder="0.00" value={row.salary} onChange={(e) => updateRow(index, "salary", e.target.value)} />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label text-xs pb-1">Status</label>
                                <select value={row.status} onChange={(e) => updateRow(index, "status", e.target.value)} className={`select select-bordered w-full focus:border-[var(--primary-color)] ${row.status === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
                                    <option value="pending">Pending</option><option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                        {row.iqama && (<div className="text-xs text-center text-base-content/40 bg-base-200/50 py-1 rounded">Iqama: {row.iqama}</div>)}
                    </div>
                </div>
             ))}
          </div>

          {/* DESKTOP VIEW (TABLE) */}
          <div className="hidden md:block overflow-x-auto min-h-[300px]">
            <table className="table w-full">
              <thead className="bg-base-200/50 text-base-content/60 text-xs uppercase font-bold">
                <tr>
                  <th className="w-12 text-center">#</th>
                  <th className="w-[35%]">Employee</th>
                  <th className="w-[20%]">Iqama</th>
                  <th className="w-[20%]">Salary (SAR)</th>
                  <th className="w-[15%]">Status</th> 
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="overflow-visible">
                {rows.map((row, index) => (
                  <tr key={row.tempId} className="hover:bg-base-100 group border-b border-base-100 last:border-0 align-top">
                    <td className="text-center py-4 font-medium text-base-content/40">{index + 1}</td>
                    <td className="py-3 overflow-visible">
                         {/* SEARCH INPUT */}
                         <EmployeeSearchInput 
                              row={row} 
                              index={index} 
                              employees={employees} 
                              onSearchChange={handleSearchChange}
                              onSelect={handleSelectEmployee}
                              onClear={handleClearRow}
                          />
                    </td>
                    <td className="py-3"><input disabled value={row.iqama} className="input input-sm w-full bg-base-200/50 text-base-content/50 border-transparent cursor-not-allowed text-xs font-mono" placeholder="---" /></td>
                    <td className="py-3">
                         <div className={`flex items-center input input-sm input-bordered p-0 ${salaryErrors[index] ? 'input-error animate-pulse' : 'focus-within:border-[var(--primary-color)]'}`}>
                             <span className="px-3 h-full flex items-center bg-base-200/50 text-xs text-base-content/50 border-r border-base-300 rounded-l">SAR</span>
                             <input type="number" className="w-full px-2 bg-transparent outline-none h-full text-sm" placeholder="0.00" value={row.salary} onChange={(e) => updateRow(index, "salary", e.target.value)} />
                         </div>
                    </td>
                    <td className="py-3">
                        <select value={row.status} onChange={(e) => updateRow(index, "status", e.target.value)} className={`select select-sm select-bordered w-full font-medium text-xs focus:border-[var(--primary-color)] ${row.status === 'pending' ? 'text-orange-600  border-orange-200' : 'text-green-600  border-green-200'}`}>
                            <option value="pending">Pending</option><option value="paid">Paid</option>
                        </select>
                    </td>
                    <td className="py-3 text-center">
                        <button onClick={() => removeRow(index)} className="btn btn-ghost btn-xs btn-square text-base-content/30 hover:text-error hover:bg-error/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="p-2 md:p-3 bg-base-100 border-t border-base-200 flex justify-end gap-3 sticky bottom-0 z-10 md:relative">
            <button type="button" onClick={() => router.back()} className="btn btn-ghost" disabled={isSubmitting}>Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn bg-[var(--primary-color)] text-white hover:opacity-90 border-none w-full md:w-auto">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Sheet'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddSalaryList;