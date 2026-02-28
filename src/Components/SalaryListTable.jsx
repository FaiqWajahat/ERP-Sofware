'use client';
import React, { useState, useMemo } from 'react';
import { Eye, Trash, X, Calendar, Briefcase, User, FileText, DollarSign, AlertTriangle, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { successToast, errorToast } from '@/lib/toast';
import axios from 'axios';
import CustomLoader from './CustomLoader';

const SalaryListTable = ({ data = [], isLoading, onDelete }) => {
  const [selectedList, setSelectedList] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterMonth, setFilterMonth] = useState(''); // Format: YYYY-MM

  const router = useRouter();

  // --- HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  // --- FILTRATION LOGIC ---
  const filteredLists = useMemo(() => {
    if (!data) return [];
    if (!filterMonth) return data;

    return data.filter((list) => {
      // Assuming list.date is ISO string or YYYY-MM-DD
      return list.date.startsWith(filterMonth);
    });
  }, [data, filterMonth]);

  // --- ACTIONS ---
  const openDialog = (list) => {
    setSelectedList(list);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedList(null), 200);
  };

  const handleDeleteClick = (list) => {
    setDeleteConfirm(list);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      // Adjust endpoint as per your API
      const response = await axios.delete(`/api/salary/salary-list/${deleteConfirm._id}/delete`);
      
      // Handle success based on your API structure (assuming standard 200 OK or success: true)
      if (response.status === 200 || response.data.success) {
        if (onDelete) onDelete(deleteConfirm._id);
        setDeleteConfirm(null);
        closeDialog();
        successToast('Salary Sheet deleted successfully');
      } else {
         errorToast(response.data.message || 'Failed to delete');
      }

    } catch (error) {
      console.error('Error deleting list:', error);
      errorToast(error.response?.data?.message || 'Failed to delete salary sheet.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- RENDER STATES ---
  if (isLoading) {
    return <CustomLoader text={"Loading Salary Sheets..."}/>;
  }

  return (
    <div className="space-y-4">
      
      {/* --- FILTER HEADER --- */}
      <div className="flex items-center justify-between bg-base-200/50 p-3 rounded-lg border border-base-200">
        <div className=" hidden md:flex items-center gap-2 ">
            <div className="p-2 bg-[var(--primary-color)]/10 rounded-md">
                <FileText className="w-4 h-4 text-[var(--primary-color)]"/>
            </div>
            <span className="text-sm font-semibold text-base-content/70">
                {filteredLists.length} Records Found
            </span>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-base-content/50 uppercase">Filter by Month:</span>
            <input 
                type="month" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="input input-sm input-bordered bg-base-100 focus:border-[var(--primary-color)]"
            />
            {filterMonth && (
                <button 
                    onClick={() => setFilterMonth('')}
                    className="btn btn-xs btn-ghost text-error"
                >
                    Clear
                </button>
            )}
        </div>
      </div>

      {/* --- TABLE --- */}
      {filteredLists.length === 0 ? (
        <div className="w-full flex items-center justify-center py-20 border border-dashed border-base-300 rounded-xl">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-base-content/40" />
                </div>
                <h3 className="text-lg font-semibold text-base-content mb-2">No Salary Sheets Found</h3>
                <p className="text-sm text-base-content/60">
                    {filterMonth ? "Try changing the month filter." : "Create your first salary sheet."}
                </p>
            </div>
        </div>
      ) : (
        <table className="table w-full table-md">
            <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
            <tr>
                <th>#</th>
                <th>Month & Year</th>
                <th>Project</th>
                <th>Foreman</th>
                <th className="text-center">Workers</th>
                <th className="text-right">Total Payout</th>
            </tr>
            </thead>

            <tbody>
            {filteredLists.map((list, idx) => {
                // Calculate totals on the fly
                const workerCount = list.employeeList?.length || 0;
                const totalAmount = list.employeeList?.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0) || 0;

                return (
                <tr
                    key={list._id}
                    className="hover:bg-base-200/40 transition cursor-pointer"
                    onClick={() => openDialog(list)}
                >
                    <td className="font-medium text-base-content/50">{idx + 1}</td>

                    {/* Date */}
                    <td>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-base-content">
                                {formatDate(list.date)}
                            </span>
                        </div>
                    </td>

                    {/* Project */}
                    <td>
                        <div className="font-medium">{list.projectName || 'N/A'}</div>
                    </td>

                    {/* Foreman */}
                    <td>
                        <div className="flex items-center gap-2">
                             <User className="w-3 h-3 text-base-content/40" />
                             <span className="text-sm">{list.foremanName || 'N/A'}</span>
                        </div>
                    </td>

                    {/* Workers */}
                    <td className="text-center">
                        <span className="badge badge-ghost badge-sm font-mono">
                            {workerCount}
                        </span>
                    </td>

                    {/* Total Amount */}
                    <td className="text-right font-mono font-medium text-base-content/80">
                         {formatCurrency(totalAmount)}
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {isOpen && selectedList && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDialog}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-base-200 to-base-100 px-8 py-6 border-b border-base-200">
              <button
                className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle hover:bg-base-200"
                onClick={closeDialog}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start  gap-4">
                 <div className="p-3 bg-white shadow-sm rounded-xl border border-base-200">
                    <Briefcase className="w-8 h-8 text-[var(--primary-color)]" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-base-content">{selectedList.projectName}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-base-content/60">
                        <Calendar className="w-3 h-3" />
                        {formatDate(selectedList.date)}
                        <span className="mx-1">•</span>
                        <div className='flex gap-1 items-center'> <User className="w-3 h-3" />
                        Foreman: {selectedList.foremanName}</div>
                        
                    </div>
                 </div>
              </div>
            </div>

            {/* Modal Body - Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 py-4 bg-base-200/30 border-b border-base-200">
                <div className="p-3 bg-base-100 rounded-lg border border-base-200 shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-base-content/50 uppercase font-semibold">Total Workers</p>
                        <p className="text-lg font-bold">{selectedList.employeeList?.length || 0}</p>
                    </div>
                </div>
                <div className="p-3 bg-base-100 rounded-lg border border-base-200 shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-md">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-base-content/50 uppercase font-semibold">Total Payout</p>
                        <p className="text-lg font-bold">
                            {formatCurrency(selectedList.employeeList?.reduce((a, b) => a + (Number(b.salary) || 0), 0))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Body - Worker List */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
                <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                    Worker Details
                </h3>
                <div className="border border-base-200 rounded-lg overflow-hidden">
                    <table className="table table-xs w-full">
                        <thead className="bg-base-200/50">
                            <tr>
                                <th>Name</th>
                                <th>Iqama</th>
                                <th className="text-right">Salary</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedList.employeeList?.map((emp, i) => (
                                <tr key={i} className="border-b border-base-200 last:border-0">
                                    <td className="font-medium">{emp.employeeName || emp.name}</td>
                                    <td className="font-mono text-base-content/60">{emp.iqamaNumber || emp.iqama}</td>
                                    <td className="text-right font-mono">{Number(emp.salary).toLocaleString()}</td>
                                    <td className="text-center">
                                        <span className={`badge badge-xs ${emp.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {emp.status || 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-8 py-5 border-t border-base-200 bg-base-100">
              <button 
                onClick={() => router.push(`/Dashboard/Salary/Edit/${selectedList._id}`)} 
                className="btn btn-sm btn-ghost bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 gap-2 flex-1 border border-base-300"
              >
                 Edit Sheet
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(selectedList);
                }}
                className="btn btn-sm btn-error text-white gap-2 flex-1"
              >
                <Trash className="h-4 w-4" />
                Delete Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCancelDelete}
        >
          <div 
            className="relative w-full max-w-md bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-error" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-center mb-2">Delete Salary Sheet</h3>
              
              <p className="text-sm text-base-content/70 text-center mb-6">
                Are you sure you want to delete the salary sheet for <br/>
                <span className="font-semibold text-base-content">{deleteConfirm.projectName}</span>
                <br/> dated <span className="font-semibold">{formatDate(deleteConfirm.date)}</span>?
              </p>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCancelDelete} 
                  className="btn btn-ghost flex-1 rounded-sm"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-error text-white flex-1 rounded-sm gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryListTable;