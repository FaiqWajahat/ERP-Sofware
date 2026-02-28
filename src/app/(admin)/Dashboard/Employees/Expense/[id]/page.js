"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Check,
  BriefcaseBusiness,
  FileText,
  Clock,
  CheckCircle,
  PieChart // New Icon for Partial
} from "lucide-react";
import axios from "axios";
import { errorToast } from "@/lib/toast";
import CustomLoader from "@/Components/CustomLoader";

// --- CONSTANTS ---
const EXPENSE_TYPES = ["Loan", "Reimbursement", "Advance", "Other"];

const getExpenseBadgeClass = (type) => {
  switch (type) {
    case "Loan": return "badge-error";
    case "Reimbursement": return "badge-success";
    case "Advance": return "badge-warning";
    default: return "badge-info";
  }
};

// --- HELPER: STATUS BADGE LOGIC ---
const getStatusBadge = (status) => {
  switch (status) {
    case "Completed":
      return "badge-success text-white"; // Green
    case "Partial":
      return "badge-info text-white";    // Blue
    default:
      return "badge-warning";            // Yellow (Pending)
  }
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SAR",
});

// --- CUSTOM DROPDOWN (Unchanged) ---
const CustomDropdown = ({ value, onChange, options, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-base-100  border-base-300 rounded-lg hover:border-base-content/20 focus:outline-none focus:border-neutral border-2 transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`badge ${getExpenseBadgeClass(value)} badge-sm`}>
            {value}
          </span>
          <ChevronDown className={`w-4 h-4 text-base-content/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2.5 text-left hover:bg-base-200 transition-colors flex items-center justify-between ${
                value === option ? "bg-base-200" : ""
              }`}
            >
              <span className={"text-sm"}>{option}</span>
              {value === option && (
                <Check className="w-4 h-4" style={{ color: "var(--primary-color)" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- ADD EXPENSE MODAL (Unchanged) ---
const AddExpenseModal = ({ isOpen, onClose, employeeId, onSave }) => {
  const [formData, setFormData] = useState({
    type: EXPENSE_TYPES[0],
    date: new Date().toISOString().substring(0, 10),
    amount: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: EXPENSE_TYPES[0],
        date: new Date().toISOString().substring(0, 10),
        amount: "",
        description: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleTypeChange = (newType) => {
    setFormData((prev) => ({ ...prev, type: newType }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.date || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newExpense = {
        employeeId,
        type: formData.type,
        date: formData.date,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        status: "Pending",
        paidAmount: 0, // Initialize as 0 paid
      };

      await onSave(newExpense);
      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
      setError(error.response?.data?.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base text-base-content">Add New Expense</h3>
          <button onClick={onClose} disabled={isSubmitting} className="btn btn-ghost btn-xs btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{error}</span>
          </div>
        )}
        <div className="space-y-3">
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Expense Type</span>
            </label>
            <CustomDropdown
              value={formData.type}
              onChange={handleTypeChange}
              options={EXPENSE_TYPES}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-medium">Amount (SAR) *</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="input input-bordered input-sm w-full text-sm"
              />
            </div>
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-xs font-medium">Date *</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isSubmitting}
                max={new Date().toISOString().substring(0, 10)}
                className="input input-bordered input-sm w-full text-sm"
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Description *</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Brief reason for the expense"
              rows={3}
              className="textarea textarea-bordered textarea-sm w-full resize-none text-sm"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-ghost btn-sm w-full sm:w-auto text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-sm text-white w-full sm:w-auto text-sm" style={{ backgroundColor: "var(--primary-color)" }}>
              {isSubmitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={!isSubmitting ? onClose : undefined}></div>
    </div>
  );
};

// --- DELETE CONFIRMATION (Unchanged) ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-base-content mb-1">Delete Expense</h3>
            <p className="text-xs text-base-content/70">Are you sure? This cannot be undone.</p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button onClick={onClose} disabled={isDeleting} className="btn btn-ghost btn-sm w-full sm:w-auto text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="btn btn-error btn-sm w-full sm:w-auto text-sm">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const EmployeeExpenseDetails = () => {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expenseId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Data (Same logic, assumes Backend returns 'paidAmount')
  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const empResponse = await axios.get(`/api/employee/getEmployee/${employeeId}`);
      if (!empResponse.data.success) {
        errorToast("Failed to fetch employee");
        router.push("/Dashboard/Employees/Expense");
        return;
      }
      setEmployee(empResponse.data.employee);

      const expResponse = await axios.get(`/api/employee/expenses?employeeId=${empResponse.data.employee._id}&limit=100`);
      if (!expResponse.data.success) throw new Error(expResponse.data.message);
      
      setExpenses(expResponse.data.data.expenses);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { if (employeeId) fetchData(); }, [employeeId]);

  const handleAddExpense = async (newExpenseData) => {
    try {
      const response = await axios.post("/api/employee/expenses/add", newExpenseData);
      if (!response.data.success) throw new Error(response.data.message);
      await fetchData(true);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteClick = (expenseId) => {
    setDeleteModal({ isOpen: true, expenseId });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/employee/expenses/delete/${deleteModal.expenseId}`);
      await fetchData(true);
      setDeleteModal({ isOpen: false, expenseId: null });
    } catch (err) {
      alert("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- NEW CALCULATION LOGIC FOR PARTIAL PAYMENTS ---
  
  // Calculate how much is actually remaining to be paid
  const totalLiability = expenses.reduce((sum, exp) => {
    // If completed, 0 liability. If pending/partial, add (amount - paidAmount)
    if (exp.status === "Completed") return sum;
    const paid = exp.paidAmount || 0;
    const remaining = exp.amount - paid;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  if (isLoading) return <div className="flex items-center justify-center bg-base-200"><CustomLoader text="Loading..." /></div>;
  if (error || !employee) return <div className="p-6">Error: {error}</div>;

  return (
    <div className="">
      <div className="w-full">
        <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} employeeId={employee._id} onSave={handleAddExpense} />
        <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, expenseId: null })} onConfirm={handleConfirmDelete} isDeleting={isDeleting} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 md:mb-6">
          {/* Card 1: Outstanding Balance */}
          <div className="stats shadow-md bg-base-100">
            <div className="stat py-3">
              <div className="stat-title text-xs">Total Outstanding</div>
              <div className="stat-value text-xl md:text-2xl text-error">
                {isRefreshing ? <span className="loading loading-dots loading-md"></span> : currencyFormatter.format(totalLiability)}
              </div>
              <div className="stat-desc text-xs">Remaining amount to be deducted</div>
            </div>
          </div>

          <div className="stats shadow-md bg-base-100">
            <div className="stat py-3">
              <div className="stat-title text-xs">Total Records</div>
              <div className="stat-value text-xl md:text-2xl">
                {isRefreshing ? <span className="loading loading-dots loading-md"></span> : expenses.length}
              </div>
              <div className="stat-desc text-xs">All time entries</div>
            </div>
          </div>
          
           <div className="stats shadow-md bg-base-100 sm:col-span-2 lg:col-span-1">
             <div className="stat py-3">
               <div className="stat-title text-xs">Total Original Value</div>
               <div className="stat-value text-xl md:text-2xl">
                 {isRefreshing ? (
                   <span className="loading loading-dots loading-md"></span>
                 ) : (
                   currencyFormatter.format(expenses.reduce((sum, exp) => sum + exp.amount, 0))
                 )}
               </div>
               <div className="stat-desc text-xs">Sum of all loans/advances</div>
             </div>
           </div>
        </div>

        {/* Employee Header */}
        <div className="bg-base-100 shadow-sm rounded-lg p-6 border border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{employee?.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70 mt-1">
                <span className="flex items-center gap-1"><BriefcaseBusiness size={14}/> {employee?.role || 'N/A'}</span>
                <span className="flex items-center gap-1"><FileText size={14}/> Iqama: {employee?.iqamaNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => router.back()} className="btn btn-outline btn-sm"><ArrowLeft size={16} /> Back</button>
            <button onClick={() => setIsModalOpen(true)} className={`btn btn-sm text-white border-none bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 }`}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </div>

        {/* --- UPGRADED TABLE --- */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-3 md:p-4">
            <div className="py-3">
              <h2 className="text-sm md:text-base font-semibold text-base-content">Expense & Deduction History</h2>
            </div>
            {isRefreshing && <div className="flex justify-center py-4"><span className="loading loading-spinner loading-sm" style={{ color: "var(--primary-color)" }}></span></div>}
            
            <div className="overflow-x-auto">
              <table className="table table-xs md:table-sm">
                <thead>
                  <tr className="border-base-300 bg-base-200">
                    <th className="hidden sm:table-cell text-sm">Date</th>
                    <th className="text-sm">Type</th>
                    <th className="text-sm">Status</th>
                    <th className="hidden lg:table-cell text-sm">Description</th>
                    <th className="text-right text-sm">Original</th>
                    <th className="text-right text-sm text-success">Paid</th> {/* New */}
                    <th className="text-right text-sm text-error">Remaining</th> {/* New */}
                    <th className="text-center text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => {
                    const paid = exp.paidAmount || 0;
                    const remaining = exp.amount - paid;
                    // Determine Status Icon
                    let StatusIcon = Clock;
                    if(exp.status === "Completed") StatusIcon = CheckCircle;
                    else if(exp.status === "Partial") StatusIcon = PieChart;

                    return (
                    <tr key={exp._id} className="hover border-base-300">
                      <td className="hidden sm:table-cell font-medium text-xs">
                        {new Date(exp.date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span className={`badge badge-sm ${getExpenseBadgeClass(exp.type)}`}>{exp.type}</span>
                          <span className="text-xs text-base-content/60 sm:hidden">
                            {new Date(exp.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </td>
                      
                      <td>
                        <span className={`badge badge-sm gap-1 ${getStatusBadge(exp.status || "Pending")}`}>
                            <StatusIcon size={10} />
                            {exp.status || "Pending"}
                        </span>
                      </td>

                      <td className="hidden lg:table-cell text-base-content/80 text-sm truncate max-w-xs" title={exp.description}>
                        {exp.description}
                      </td>
                      
                      {/* AMOUNT COLUMNS */}
                      <td className="font-semibold text-right text-sm">
                        {currencyFormatter.format(exp.amount)}
                      </td>
                      <td className="text-right text-sm text-success/80">
                         {paid > 0 ? currencyFormatter.format(paid) : "-"}
                      </td>
                      <td className="font-bold text-right text-sm text-error">
                         {remaining > 0 ? currencyFormatter.format(remaining) : "0.00"}
                      </td>

                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteClick(exp._id)}
                          // Disable delete if any amount has been paid (to prevent data mess)
                          disabled={isDeleting || (exp.paidAmount > 0)} 
                          className={`btn btn-ghost btn-sm text-error hover:bg-error/10 ${(exp.paidAmount > 0) ? "opacity-20 cursor-not-allowed" : ""}`}
                          title={(exp.paidAmount > 0) ? "Cannot delete: Partial payment made" : "Delete expense"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )})}
                  
                  {expenses.length === 0 && !isRefreshing && (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-1 opacity-60">
                          <p className="text-sm font-medium">No records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeExpenseDetails;