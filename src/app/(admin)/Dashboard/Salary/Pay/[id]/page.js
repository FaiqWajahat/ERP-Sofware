'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Download, Plus, X, Save, Calculator, DollarSign, 
  Calendar, Trash2, ArrowLeft, Briefcase, 
  AlertCircle, CheckCircle2, FileText, Receipt,
  Building2, Eye
} from 'lucide-react';
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import CustomDropdown from "@/Components/CustomDropdown";
import axios from 'axios';
import { errorToast, successToast } from '@/lib/toast';
import CustomLoader from '@/Components/CustomLoader';

export default function EmployeeSalaryPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id;

  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false); 
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); 
  
  const [employee, setEmployee] = useState(null);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]); 
  
  // Projects State
  const [projects, setProjects] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  
  // Stores { "expenseId": amountToDeduct }
  const [expenseAllocations, setExpenseAllocations] = useState({}); 

  // UI States
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    monthReference: '', 
    fromDate: '',
    toDate: '',
    baseSalary: '',
    absentDays: '0',
    manualExpenses: [], 
    deductions: '0', 
    allowances: '0', 
    notes: '',
    status: "Pending",
    employeeId: '',
    projectId: '', 
    projectName: '',
    salaryListId: null // <--- NEW: Stores the ID of the parent Salary List
  });

  const [calculatedData, setCalculatedData] = useState(null);

  // --- API Functions ---

  const fetchEmployeeData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/employee/getEmployee/${employeeId}`);
      if (!response.data.success) throw new Error(response.data.message);
      
      const emp = response.data.employee;
      setEmployee(emp);
      
      // Initialize base form data with employee defaults
      setFormData(prev => ({ 
        ...prev, 
        baseSalary: emp.salary, 
        employeeId: emp._id 
      }));
    } catch (error) {
      errorToast(error.message || "Failed to load employee");
      router.push("/Dashboard/Employees");
    }
  }, [employeeId, router]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`/api/project/active-projects`); 
      if (response.data.success) {
        setProjects(response.data.data || []);
        setProjectOptions((response.data.data|| []).map(p => p.name));
      }
    } catch (error) {
      console.error("Failed to load projects");
    }
  }, []);

  const fetchPendingExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`/api/employee/expenses?employeeId=${employeeId}&limit=100`);
      if (response.data.success) {
        const activeExpenses = response.data.data.expenses.filter(e => e.status !== 'Completed' && e.status !== 'Deducted');
        setPendingExpenses(activeExpenses);

        const initialAllocations = {};
        activeExpenses.forEach(exp => {
            const remaining = exp.amount - (exp.paidAmount || 0);
            initialAllocations[exp._id] = remaining; 
        });
        setExpenseAllocations(initialAllocations);
      }
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  }, [employeeId]);

  const fetchSalaryRecords = useCallback(async () => {
    try {
      const response = await axios.get(`/api/salary/${employeeId}`);
      if (response.data.success) {
        setSalaryRecords(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching records", error);
    }
  }, [employeeId]);

  // --- Initial Data Fetching ---
  useEffect(() => {
    if (employeeId) {
      setLoading(true);
      Promise.all([fetchEmployeeData(), fetchSalaryRecords(), fetchPendingExpenses(), fetchProjects()])
        .finally(() => setLoading(false));
    }
  }, [employeeId, fetchEmployeeData, fetchSalaryRecords, fetchPendingExpenses, fetchProjects]);

  // --- Logic & Calculations ---

  const handleMonthSelect = (e) => {
    const date = new Date(e.target.value);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const formatDateInput = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    setFormData(prev => ({
      ...prev,
      monthReference: e.target.value,
      fromDate: formatDateInput(firstDay),
      toDate: formatDateInput(lastDay)
    }));
  };

  const handleProjectSelect = (name) => {
    const selected = projects.find(p => p.name === name);
    if (selected) {
        setFormData(prev => ({
            ...prev,
            projectName: selected.name,
            projectId: selected._id
        }));
    }
  };

  const handleAllocationChange = (expenseId, value, maxAmount) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > maxAmount) numValue = maxAmount;
    if (numValue < 0) numValue = 0;

    setExpenseAllocations(prev => ({
        ...prev,
        [expenseId]: numValue
    }));
  };

  const handleCalculate = useCallback(() => {
    const { fromDate, toDate, baseSalary, absentDays, manualExpenses, deductions, allowances } = formData;
    
    if (!fromDate || !toDate) return;

    const base = parseFloat(baseSalary) || 0;
    const absent = parseFloat(absentDays) || 0;
    const extraDeduct = parseFloat(deductions) || 0;
    const extraAllow = parseFloat(allowances) || 0;

    const dailyRate = base / 30; 
    const absentDeduction = dailyRate * absent;
    
    const manualExpensesTotal = manualExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const dbExpensesTotal = Object.values(expenseAllocations).reduce((sum, val) => sum + val, 0);
    const totalDeductions = absentDeduction + manualExpensesTotal + dbExpensesTotal + extraDeduct;
    const netSalary = (base + extraAllow) - totalDeductions;

    const linkedExpensesPayload = Object.entries(expenseAllocations)
        .filter(([_, amount]) => amount > 0)
        .map(([id, amount]) => ({ expenseId: id, amount: amount }));

    setCalculatedData({
      ...formData,
      baseSalary: base,
      absentDays: absent,
      absentDeduction,
      manualExpensesTotal,
      dbExpensesTotal,
      extraDeductions: extraDeduct,
      extraAllowances: extraAllow,
      totalDeductions,
      netSalary: Math.max(0, netSalary),
      linkedExpenses: linkedExpensesPayload 
    });
  }, [formData, expenseAllocations]);

  useEffect(() => {
    if(formData.fromDate && formData.toDate) {
      handleCalculate();
    }
  }, [handleCalculate, formData.fromDate, formData.toDate, expenseAllocations]);

  // --- FETCH PENDING RECORD (UPDATED) ---
  const handleOpenCalculator = async () => {
    setLoading(true);
    // Reset calculator data temporarily
    setCalculatedData(null); 
    
    try {
        // Call your API endpoint
        // NOTE: Ensure your API route is /api/salary/get-draft/[id] based on our previous discussions, 
        // or update the string below to match your exact route file path.
        const response = await axios.get(`/api/salary/${employeeId}/fetch-record`);
        
        if (response.data.success && response.data.record) {
            const draft = response.data.record;
            
            // Helper to format Date Objects to YYYY-MM-DD for input fields
            const formatForInput = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
            const monthRef = draft.date ? new Date(draft.date).toISOString().slice(0, 7) : '';

            // Pre-fill form with fetched data
            setFormData(prev => ({
                ...prev,
                monthReference: monthRef,
                fromDate: draft.fromDate ? formatForInput(draft.fromDate) : '', 
                toDate: draft.toDate ? formatForInput(draft.toDate) : '',
                projectId: draft.projectId || '',
                projectName: draft.projectName || '',
                baseSalary: draft.salary || employee?.salary || '', 
                status: draft.status || "Pending",
                employeeId: employeeId,
                absentDays: draft.absentDays || '0', 
                manualExpenses: draft.manualExpenses || [],
                deductions: draft.deductions || '0',
                allowances: draft.allowances || '0',
                notes: draft.notes || '',
                
                // --- NEW: Capture Salary List ID ---
                salaryListId: draft.salaryListId || null 
            }));
            
            successToast("Draft found! Data pre-filled.");
        } else {
            // No draft found? Just reset to default fresh form
            resetForm();
        }
    } catch (error) {
        console.log("No pending draft found, starting fresh.");
        resetForm();
    } finally {
        setLoading(false);
        setShowCalculator(true); // Open the modal
    }
  };

  // --- Database Actions ---

  const resetForm = () => {
    setFormData({
      monthReference: '',
      fromDate: '',
      toDate: '',
      baseSalary: employee?.salary || '', 
      employeeId: employee?._id || employeeId, 
      absentDays: '0',
      manualExpenses: [],
      deductions: '0',
      allowances: '0',
      notes: '',
      status: "Pending",
      projectId: '', 
      projectName: '',
      salaryListId: null // <--- Reset this to null
    });
    
    const initialAllocations = {};
    pendingExpenses.forEach(exp => {
        initialAllocations[exp._id] = exp.amount - (exp.paidAmount || 0);
    });
    setExpenseAllocations(initialAllocations);

    setCalculatedData(null);
  };

  const closeCalculator = () => {
      setShowCalculator(false);
      resetForm();
  };

  const handleSaveRecord = async (status = 'Pending') => {
    if (!calculatedData) {
      errorToast("Please fill in the date range first");
      return;
    }
    if (!calculatedData.projectId) {
        errorToast("Please select a project");
        return;
    }

    // Prepare Payload
    const finalPayload = { 
        ...calculatedData, // This includes salaryListId automatically because it's in formData
        employeeId: calculatedData.employeeId || employee?._id || employeeId,
        status, 
        paidDate: status === 'Paid' ? new Date() : null,
        linkedExpenses: calculatedData.linkedExpenses 
    };

    try {
      setPaying(true);
      const response = await axios.post("/api/salary/add", finalPayload);

      if (!response.data.success) throw new Error(response.data.message);

      successToast(status === 'Paid' ? "Salary processed & expenses updated" : "Draft saved successfully");
      setSalaryRecords(prev => [response.data.data, ...prev]);
      
      if (status === 'Paid') fetchPendingExpenses();
      resetForm();
      setShowCalculator(false); // Close modal on save
      
    } catch (error) {
      errorToast(error.response?.data?.message || error.message || "Failed to save record");
    } finally {
      setPaying(false);
    }
  };

  const handleQuickPay = async (record, isFromModal = false) => {
    const recId = record._id || record.id;
    setUpdatingId(recId);
    
    try {
      const response = await axios.put(`/api/salary/update/${recId}`, {
        status: 'Paid',
        paidDate: new Date().toISOString()
      });

      if (!response.data.success) throw new Error(response.data.message);

      successToast("Salary marked as Paid");

      setSalaryRecords(prev => prev.map(r => 
        (r._id === recId || r.id === recId) 
          ? { ...r, status: 'Paid', paidDate: new Date().toISOString() } 
          : r
      ));
      
      if(isFromModal) {
         setSelectedRecord(prev => ({...prev, status: 'Paid', paidDate: new Date().toISOString() }));
      }

      fetchPendingExpenses();

    } catch (error) {
      errorToast(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteRecord = async () => {
    const target = recordToDelete || selectedRecord; 
    if (!target) return;
    
    setDeleting(true);
    try {
      const response = await axios.delete(`/api/salary/delete/${target._id || target.id}`);
      if (!response.data.success) throw new Error(response.data.message);
      
      setSalaryRecords(prev => prev.filter(r => (r._id || r.id) !== (target._id || target.id)));
      successToast("Record deleted");
      
      setDeleteModalOpen(false);
      setViewModalOpen(false); 
      setRecordToDelete(null);
      setSelectedRecord(null);

    } catch (error) {
      errorToast(error.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // --- Form Handlers ---
  const handleManualExpenseChange = (index, field, value) => {
    const newExpenses = [...formData.manualExpenses];
    newExpenses[index][field] = value;
    setFormData(prev => ({ ...prev, manualExpenses: newExpenses }));
  };

  const addExpenseRow = () => {
    setFormData(prev => ({
      ...prev,
      manualExpenses: [...prev.manualExpenses, { description: '', amount: '' }]
    }));
  };

  const removeExpenseRow = (index) => {
    setFormData(prev => ({
      ...prev,
      manualExpenses: prev.manualExpenses.filter((_, i) => i !== index)
    }));
  };

  // --- Utilities ---
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount || 0);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleExportSingle = (record) => {
    const rows = [
      ['SALARY SLIP', 'MIGCO.'],
      ['Employee', employee?.name],
      ['Project', record.projectName || 'N/A'],
      ['Period', `${formatDate(record.fromDate)} - ${formatDate(record.toDate)}`],
      ['Status', record.status],
      [],
      ['DESCRIPTION', 'AMOUNT'],
      ['Base Salary', record.baseSalary],
      ['Allowances', record.allowances],
      ['Absence Deduction', `-${record.absentDeduction || 0}`],
      ['DB Expenses', `-${record.dbExpensesTotal || 0}`],
      ['Other Deductions', `-${record.deductions || 0}`],
      ...(record.manualExpenses || []).map(e => [e.description, `-${e.amount}`]),
      [],
      ['NET SALARY', record.netSalary],
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Salary_${employee?.name}_${record.month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = useMemo(() => {
    if (selectedStatus === 'All') return salaryRecords;
    return salaryRecords.filter(r => r.status === selectedStatus);
  }, [salaryRecords, selectedStatus]);


  if (loading && !showCalculator) return <CustomLoader/> // Show loader only on initial page load
  
  return (
    <div className="">
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <dialog className="modal modal-open z-[60]">
          <div className="modal-box rounded-lg">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <AlertCircle /> Confirm Deletion
            </h3>
            <p className="py-4">Are you sure you want to delete the salary record? This cannot be undone.</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-error text-white" onClick={handleDeleteRecord} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-black/20" onClick={() => setDeleteModalOpen(false)}></div>
        </dialog>
      )}

      {/* View Detail Modal */}
      {viewModalOpen && selectedRecord && (
        <dialog className="modal modal-open z-50">
          <div className="modal-box rounded-xl max-w-2xl p-0 overflow-hidden bg-base-100 shadow-2xl">
            {/* Modal Header */}
            <div className="bg-base-200/60 p-5 flex justify-between items-start border-b border-base-200">
                <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        {new Date(selectedRecord.month).toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <p className="text-sm opacity-60 mt-1 flex items-center gap-2">
                        <Building2 size={14}/> {selectedRecord.projectName || 'General'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button onClick={() => setViewModalOpen(false)} className="btn btn-sm btn-circle btn-ghost"><X size={20}/></button>
                    <span className={`badge ${selectedRecord.status === 'Paid' ? 'badge-success text-white' : 'badge-warning'} badge-sm uppercase font-bold tracking-wider`}>
                        {selectedRecord.status}
                    </span>
                </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase opacity-50 tracking-widest border-b pb-1">Period Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-xs opacity-60">From Date</span>
                            <span className="font-medium">{formatDate(selectedRecord.fromDate)}</span>
                        </div>
                        <div>
                            <span className="block text-xs opacity-60">To Date</span>
                            <span className="font-medium">{formatDate(selectedRecord.toDate)}</span>
                        </div>
                        <div>
                            <span className="block text-xs opacity-60">Generated On</span>
                            <span className="font-medium">{formatDate(selectedRecord.createdAt)}</span>
                        </div>
                        <div>
                            <span className="block text-xs opacity-60">Paid On</span>
                            <span className="font-medium">{selectedRecord.paidDate ? formatDate(selectedRecord.paidDate) : '-'}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase opacity-50 tracking-widest border-b pb-1">Financials</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="opacity-70">Base Salary</span>
                            <span className="font-mono">{formatCurrency(selectedRecord.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between text-success">
                            <span className="opacity-70">Allowances</span>
                            <span className="font-mono">+{formatCurrency(selectedRecord.allowances)}</span>
                        </div>
                        <div className="flex justify-between text-error">
                            <span className="opacity-70">Deductions</span>
                            <span className="font-mono">-{formatCurrency((selectedRecord.totalDeductions || (selectedRecord.deductions + (selectedRecord.dbExpensesTotal||0) + (selectedRecord.absentDeduction||0))))}</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between items-center bg-base-200/50 p-2 rounded">
                            <span className="font-bold">Net Payable</span>
                            <span className="font-bold text-lg text-[var(--primary-color)] font-mono">{formatCurrency(selectedRecord.netSalary)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-base-200/30 border-t border-base-200 flex gap-3 justify-end">
                 <button 
                    onClick={() => setDeleteModalOpen(true)}
                    className="btn btn-ghost text-error hover:bg-error/10"
                >
                    <Trash2 size={18}/> Delete
                </button>

                <button 
                    onClick={() => handleExportSingle(selectedRecord)} 
                    className="btn btn-outline"
                >
                    <Download size={18}/> Download
                </button>

                {selectedRecord.status !== 'Paid' && (
                    <button 
                        onClick={() => handleQuickPay(selectedRecord, true)} 
                        disabled={updatingId === selectedRecord._id}
                        className="btn bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-none min-w-[140px]"
                    >
                        {updatingId === selectedRecord._id ? <span className="loading loading-spinner"/> : <><CheckCircle2 size={18}/> Mark Paid</>}
                    </button>
                )}
            </div>
          </div>
          <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setViewModalOpen(false)}></div>
        </dialog>
      )}

      {/* Header */}
      <DashboardPageHeader 
        breadData={[
          { name: "Dashboard", href: "/Dashboard" },
          { name: "Employees", href: "/Dashboard/Employees" },
          { name: employee?.name || "Employee", href: "#" },
        ]} 
        heading="Salary Management" 
      />

      <div className=" space-y-6 mt-10">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stats shadow bg-base-100">
            <div className="stat">
                <div className="stat-title text-xs">Salary</div>
                <div className="stat-value text-2xl text-[var(--primary-color)]">
                {formatCurrency(employee?.salary)}
                </div>
                <div className="stat-desc ">Base Salary</div>
            </div>
            </div>

            <div className="stats shadow bg-base-100">
            <div className="stat">
                <div className="stat-title text-xs">Salary Records</div>
                <div className="stat-value text-2xl ">
                {salaryRecords.length}
                </div>
            </div>
            </div>

            <div className="stats shadow bg-base-100">
            <div className="stat">
                <div className="stat-title text-xs">Pending Liabilities</div>
                <div className="stat-value text-2xl text-error">
                {formatCurrency(pendingExpenses.reduce((sum, e) => sum + (e.amount - (e.paidAmount||0)), 0))}
                </div>
                <div className="stat-desc ">Total DB Expenses</div>
            </div>
            </div>

            <div className="stats shadow bg-base-100">
            <div className="stat">
                <div className="stat-title text-xs">Paid Salary</div>
                <div className="stat-value text-2xl text-success">
                {formatCurrency(salaryRecords.filter(r => r.status === 'Paid').reduce((a, b) => a + (b.netSalary || 0), 0))}
                </div>
                <div className="stat-desc ">Total Disbursed</div>
            </div>
            </div>
        </div>
        
        {/* Employee Identity Card */}
        <div className="bg-base-100 shadow-sm rounded-lg p-6 border border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{employee?.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70 mt-1">
                <span className="flex items-center gap-1"><Briefcase size={14}/> {employee?.role || 'N/A'}</span>
                <span className="flex items-center gap-1"><FileText size={14}/> Iqama: {employee?.iqamaNumber}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => router.back()} className="btn btn-outline btn-sm">
                <ArrowLeft size={16} /> Back
             </button>
             {/* -- UPDATE: Changed onClick to handleOpenCalculator -- */}
             <button 
                onClick={handleOpenCalculator} 
                className={`btn btn-sm text-white border-none bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 ${showCalculator ? 'btn-disabled' : ''}`}
             >
                {loading && !showCalculator ? <span className="loading loading-spinner loading-xs"/> : <Plus size={16} />} Create Salary
             </button>
          </div>
        </div>

        {/* CALCULATOR SECTION */}
        {showCalculator && (
          <div className="card bg-base-100 shadow-lg border-t-4 border-[var(--primary-color)] animate-in fade-in slide-in-from-top-4">
            <div className="card-body p-6">
              <div className="flex justify-between items-center pb-4 border-b border-base-200 mb-4">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <Calculator className="text-[var(--primary-color)]" size={20} /> New Salary Calculation
                </h3>
                {/* -- UPDATE: Use closeCalculator to reset form properly -- */}
                <button onClick={closeCalculator} className="btn btn-ghost btn-sm btn-circle"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Column */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* 1. Time Period & Project Selection */}
                  <div className="bg-base-200/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Calendar size={16}/> Period & Project</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="form-control w-full"> 
                            <label className="label text-xs opacity-70 block">Select Project</label>
                           <div className="w-full">
                            <CustomDropdown 
                                value={formData.projectName || "Select Project"} 
                                setValue={handleProjectSelect} 
                                dropdownMenu={projectOptions} 
                            />
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label text-xs opacity-70">Quick Select Month</label>
                            <input required type="month" className="input input-sm input-bordered " 
                            onChange={handleMonthSelect} value={formData.monthReference} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label text-xs opacity-70">From Date</label>
                        <input type="date" required className="input input-sm input-bordered "
                           value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} />
                      </div>
                      <div className="form-control">
                        <label className="label text-xs opacity-70">To Date</label>
                        <input type="date" required className="input input-sm input-bordered "
                           value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2. Earnings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-success border-b pb-2">Earnings</h4>
                      <InputGroup label="Base Salary (SAR)" value={formData.baseSalary ?? 0} 
                        onChange={v => setFormData({...formData, baseSalary: v})} />
                      <InputGroup label="Overtime / Allowances" value={formData.allowances} 
                        onChange={v => setFormData({...formData, allowances: v})} />
                    </div>

                    {/* 3. Deductions */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-error border-b pb-2">Deductions</h4>
                      <div className="form-control">
                        <label className="label text-xs font-medium block pt-2">Absent Days</label>
                        <div className="join">
                          <input type="number" className="input input-sm input-bordered join-item w-full" 
                            value={formData.absentDays} onChange={e => setFormData({...formData, absentDays: e.target.value})} />
                          <div className="join-item btn btn-sm btn-disabled bg-base-200">Days</div>
                        </div>
                      </div>
                      <InputGroup label="Other Deductions" value={formData.deductions} 
                        onChange={v => setFormData({...formData, deductions: v})} />
                    </div>
                  </div>

                  {/* 4. DB EXPENSES TABLE */}
                  <div className="bg-base-100 border border-base-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Receipt size={16} className="text-warning"/> Pending Liabilities (Database)
                    </h4>
                    {pendingExpenses.length === 0 ? (
                          <p className="text-xs opacity-50 italic">No pending expenses found for this employee.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-xs">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th className="text-right">Total Owed</th>
                                        <th className="text-right w-32">Deduct Now</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingExpenses.map(exp => {
                                        const paid = exp.paidAmount || 0;
                                        const remaining = exp.amount - paid;
                                        return (
                                            <tr key={exp._id}>
                                                <td className="w-24">{new Date(exp.date).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="font-medium">{exp.type}</div>
                                                    <div className="text-[10px] opacity-60 truncate max-w-[150px]">{exp.description}</div>
                                                </td>
                                                <td className="text-right opacity-60 font-medium">
                                                    {formatCurrency(remaining)}
                                                </td>
                                                <td className="text-right">
                                                    <input 
                                                        type="number" 
                                                        className="input input-xs input-bordered w-full text-right font-bold text-error"
                                                        value={expenseAllocations[exp._id] ?? remaining}
                                                        onChange={(e) => handleAllocationChange(exp._id, e.target.value, remaining)}
                                                        min="0"
                                                        max={remaining}
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    <tr className="bg-base-200 font-bold">
                                        <td colSpan={3} className="text-right">Total Deducting:</td>
                                        <td className="text-right text-error">
                                            {formatCurrency(Object.values(expenseAllocations).reduce((sum, val) => sum + val, 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                  </div>

                  {/* 5. Manual Extras */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold">Ad-hoc Deductions (Manual)</label>
                      <button onClick={addExpenseRow} className="btn btn-xs btn-outline border-dashed">
                        <Plus size={14}/> Add Item
                      </button>
                    </div>
                    {formData.manualExpenses.length === 0 && <p className="text-xs opacity-50 italic">No additional manual items.</p>}
                    <div className="space-y-2">
                      {formData.manualExpenses.map((exp, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input type="text" placeholder="Description" className="input input-sm input-bordered flex-1"
                            value={exp.description} onChange={e => handleManualExpenseChange(idx, 'description', e.target.value)} />
                          <input type="number" placeholder="Amount" className="input input-sm input-bordered w-32"
                            value={exp.amount} onChange={e => handleManualExpenseChange(idx, 'amount', e.target.value)} />
                          <button onClick={() => removeExpenseRow(idx)} className="btn btn-sm btn-square btn-ghost text-error"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <textarea className="textarea textarea-bordered w-full" placeholder="Internal Notes..." 
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>

                {/* Summary Column */}
                <div className="lg:col-span-4">
                  <div className="bg-base-200 rounded-lg p-5 sticky top-6">
                    <h4 className="font-bold  mb-4 text-sm uppercase tracking-wider">Estimated Breakdown</h4>
                    
                    {calculatedData && (
                      <div className="space-y-3 text-sm">
                        <div className="badge badge-neutral w-full p-3 h-auto">{formData.projectName || 'No Project Selected'}</div>
                        <SummaryRow label="Base Pay" amount={calculatedData.baseSalary} />
                        <SummaryRow label="Allowances" amount={calculatedData.extraAllowances} isAdd />
                        <div className="divider my-1"></div>
                        <SummaryRow label={`Absence (${formData.absentDays} days)`} amount={-calculatedData.absentDeduction} isDeduct />
                        <SummaryRow label="DB Expenses" amount={-calculatedData.dbExpensesTotal} isDeduct />
                        <SummaryRow label="Manual Expenses" amount={-calculatedData.manualExpensesTotal} isDeduct />
                        <SummaryRow label="Other Deductions" amount={-calculatedData.extraDeductions} isDeduct />
                        
                        <div className="bg-base-100 p-4 rounded-lg mt-4 border border-base-300">
                          <span className="block text-xs mb-1">Net Payable Salary</span>
                          <span className="block text-lg font-bold text-[var(--primary-color)]">{formatCurrency(calculatedData.netSalary)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-6">
                          <button 
                            onClick={() => handleSaveRecord('Pending')} 
                            disabled={paying}
                            className="btn btn-outline w-full rounded-sm"
                          >
                            <Save size={16} /> Draft
                          </button>
                          <button 
                            onClick={() => handleSaveRecord('Paid')} 
                            disabled={paying}
                            className="btn bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 border-none w-full rounded-sm"
                          >
                            <CheckCircle2 size={16} /> Pay Now
                          </button>
                        </div>
                      </div>
                    )}
                    {!calculatedData && <div className="text-center py-10 opacity-50">Enter details to see breakdown</div>}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* HISTORY TABLE */}
        <div className="card bg-base-100 shadow-sm md:p-4 p-2">
          <div className="card-body p-0">
            {/* Table Toolbar */}
            <div className="p-4 flex justify-between items-center gap-4">
              <div className=" hidden md:flex items-center gap-2">
                 <h3 className="font-bold text-lg">Salary History</h3>
                 <div className="badge badge-neutral">{filteredRecords.length}</div>
              </div>
              <div className="flex items-center gap-3 float-end w-full md:w-auto">
              <span>Status:</span>
                <CustomDropdown 
                  value={selectedStatus} 
                  setValue={setSelectedStatus} 
                  dropdownMenu={['All', 'Paid', 'Pending']} 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-md">
                <thead className="bg-base-200/50 text-xs uppercase">
                  <tr>
                    <th>Period / Project</th>
                    <th className="text-right">Earnings</th>
                    <th className="text-right">Deductions</th>
                    <th className="text-right">Net Pay</th>
                    <th>Status</th>
                  
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 opacity-50">No salary records found.</td></tr>
                  ) : filteredRecords.map((record) => (
                    <tr 
                        key={record._id || record.id} 
                        className="hover:bg-base-100 group transition-colors cursor-pointer"
                        onClick={() => { setSelectedRecord(record); setViewModalOpen(true); }}
                    >
                      <td>
                        <div className="font-bold">
                        {record?.month 
                            ? new Date(record.month).toLocaleString("en-US", { month: "long", year: "numeric" })
                            : "Unknown Period"
                        }
                        </div>
                        <div className="flex flex-col text-xs opacity-50">
                           <span>{formatDate(record.fromDate)} - {formatDate(record.toDate)}</span>
                           <span className="font-semibold text-primary/70">{record.projectName || 'No Project'}</span>
                        </div>
                      </td>
                      <td className="text-right font-medium text-success">
                        {formatCurrency(record.baseSalary + record.allowances)}
                      </td>
                      <td className="text-right font-medium text-error">
                        {formatCurrency(record.totalDeductions || (record.deductions + (record.dbExpensesTotal||0)))}
                      </td>
                      <td className="text-right">
                        <div className="font-bold text-[var(--primary-color)]">{formatCurrency(record.netSalary)}</div>
                      </td>
                      <td>
                        <span className={`badge badge-sm font-medium ${record.status === 'Paid' ? 'badge-success text-white' : 'badge-warning'}`}>
                          {record.status}
                        </span>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Sub Components ---

const InputGroup = ({ label, value, onChange }) => (
  <div className="form-control">
    <label className="label text-xs font-medium">{label}</label>
    <input type="number" className="input input-sm input-bordered w-full" 
      value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" />
  </div>
);

const SummaryRow = ({ label, amount, isDeduct, isAdd }) => (
  <div className="flex justify-between items-center">
    <span className="opacity-70">{label}</span>
    <span className={`font-semibold ${isDeduct ? 'text-error' : isAdd ? 'text-success' : ''}`}>
      {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount || 0)}
    </span>
  </div>
);