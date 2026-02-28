'use client';
import React, { useState } from 'react';
import { Edit, Trash, X, Phone, Calendar, Wallet, AlertTriangle, CreditCard, Home, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { successToast, errorToast } from '@/lib/toast';
import axios from 'axios';
import CustomLoader from './CustomLoader';

const EmployeeTable = ({ employees, isLoading, onDeleteEmployee }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Avatar component using UI Avatars API
  const Avatar = ({ name, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-10 h-10',
      lg: 'w-20 h-20'
    };

    const sizePixels = {
      sm: 48,
      md: 40,
      lg: 80
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || 'NA'
    )}&background=random&size=${sizePixels[size]}&bold=true&format=svg`;

    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden ring-2 ring-base-300 ring-offset-base-100 ring-offset-2 shadow-md`}>
        <img 
          src={avatarUrl} 
          alt={name || 'Employee'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Open employee details modal
  const openDialog = (employee) => {
    setSelectedEmployee(employee);
    setIsOpen(true);
  };

  // Close employee details modal
  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedEmployee(null), 200);
  };

  // Handle delete button click
  const handleDeleteClick = (employee) => {
    setDeleteConfirm(employee);
  };

  // Cancel delete action
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete('/api/employee/deleteEmployee', {
        data: { employeeId: deleteConfirm._id }
      });

      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || 'Failed to delete employee');
        return;
      }

      // Call parent callback to refresh list
      if (onDeleteEmployee) {
        onDeleteEmployee(deleteConfirm._id);
      }

      // Close modals
      setDeleteConfirm(null);
      closeDialog();
      
      // Show success message
      successToast(response.data.message || 'Employee deleted successfully');
      
    } catch (error) {
      console.error('Error deleting employee:', error);
      errorToast(
        error.response?.data?.message || 'Failed to delete employee. Please try again....'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
     <CustomLoader text={"Loading Employees..."}/>
    );
  }

  // Empty State
  if (!employees || employees.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">No Employees Found</h3>
          <p className="text-sm text-base-content/60">Start by adding your first employee.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Employee Table */}
      <table className="table w-full table-md">
        <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
          <tr>
            <th>S.No</th>
            <th>Employee</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Joined At</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee, idx) => (
            <tr
              key={employee._id}
              className="hover:bg-base-200/40 transition cursor-pointer"
              onClick={() => openDialog(employee)}
            >
              {/* Serial Number */}
              <td className="font-medium">{idx + 1}</td>

              {/* Employee Info with Avatar */}
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <Avatar name={employee.name} size="md" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-medium whitespace-nowrap">{employee.name || 'N/A'}</h3>
                    <span className="text-xs text-[var(--primary-color)] whitespace-nowrap">
                      {employee.role || 'Employee'}
                    </span>
                  </div>
                </div>
              </td>

              {/* Phone */}
              <td>
                <span className={employee.phone ? "text-base-content" : "text-base-content/40 italic whitespace-nowrap"}>
                  {employee.phone || 'N/A'}
                </span>
              </td>

              {/* Status */}
              <td>
                {employee.status ? (
                  <span className="text-green-600 text-sm font-medium">Active</span>
                ) : (
                  <span className="text-red-600 text-sm font-medium">Inactive</span>
                )}
              </td>

              {/* Joined Date */}
              <td className="table-cell whitespace-nowrap">
                {formatDate(employee.joiningDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Employee Details Modal */}
      {isOpen && selectedEmployee && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDialog}
        >
          <div 
            className="relative w-full max-w-lg max-h-[90vh] bg-base-100 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-base-200/50 to-base-300/30 px-8 pt-8 pb-6 flex-shrink-0">
              <button
                className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle hover:bg-base-100/50"
                onClick={closeDialog}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="shadow-lg ring-4 ring-base-100">
                    <Avatar name={selectedEmployee.name} size="lg" />
                  </div>
                  {/* Status Indicator */}
                  {selectedEmployee.status ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-base-100 shadow-sm"></div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-base-100 shadow-sm"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-base-content mb-1">
                    {selectedEmployee.name || 'N/A'}
                  </h2>
                  <p className="text-sm text-base-content/60 font-medium">
                    {selectedEmployee.role || 'Employee'}
                  </p>
                  <div className="mt-2">
                    {selectedEmployee.status ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Active Employee
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-700 text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {/* Iqama Number */}
                  <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 group-hover:bg-base-300 transition-colors">
                      <CreditCard className="h-4 w-4 text-base-content/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Iqama Number</p>
                      <p className={`text-sm font-medium truncate ${selectedEmployee.iqamaNumber ? 'text-base-content' : 'text-base-content/40 italic'}`}>
                        {selectedEmployee.iqamaNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 group-hover:bg-base-300 transition-colors">
                      <Phone className="h-4 w-4 text-base-content/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Phone Number</p>
                      <p className={`text-sm font-medium ${selectedEmployee.phone ? 'text-base-content' : 'text-base-content/40 italic'}`}>
                        {selectedEmployee.phone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Nationality */}
                  <div className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 group-hover:bg-base-300 transition-colors">
                      <Home className="h-4 w-4 text-base-content/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Nationality</p>
                      <p className={`text-sm font-medium truncate ${selectedEmployee.nationality ? 'text-base-content' : 'text-base-content/40 italic'}`}>
                        {selectedEmployee.nationality || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-base-200"></div>

              {/* Employment Details */}
              <div>
                <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                  Employment Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Joined Date */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50">
                    <Calendar className="h-4 w-4 text-base-content/50 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Joined Date</p>
                      <p className={`text-sm font-semibold ${selectedEmployee.joiningDate ? 'text-base-content' : 'text-base-content/40 italic'}`}>
                        {formatDate(selectedEmployee.joiningDate)}
                      </p>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50">
                    <Wallet className="h-4 w-4 text-base-content/50 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Salary</p>
                      <p className={`text-sm font-semibold ${selectedEmployee.salary ? 'text-base-content' : 'text-base-content/40 italic'}`}>
                        {selectedEmployee.salary ? `Rs. ${selectedEmployee.salary.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-4 py-5 bg-base-200/30 border-t border-base-200 flex-shrink-0">
              <button 
                onClick={() => router.push(`/Dashboard/Employees/Tracking/${selectedEmployee._id}`)} 
                className="btn bg-[var(--primary-color)] text-white rounded-sm flex-1 gap-2 shadow-sm hover:bg-[var(--primary-color)]/90"
              >
                <LayoutDashboard className="h-4 w-4" />
                 Record
              </button>
              <button 
                onClick={() => router.push(`/Dashboard/Employees/Edit/${selectedEmployee._id}`)} 
                className="btn bg-secondary text-secondary-content rounded-sm flex-1 gap-2 shadow-sm "
              >
                <Edit className="h-4 w-4" />
                Edit 
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(selectedEmployee);
                }}
                className="btn btn-ghost gap-2 rounded-sm text-error hover:bg-error/20 hover:text-error"
              >
                <Trash className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              {/* Warning Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-error" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2">Delete Employee</h3>
              
              {/* Description */}
              <p className="text-sm text-base-content/70 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-base-content">
                  {deleteConfirm.name}
                </span>
                ? This action cannot be undone and will permanently remove all employee data.
              </p>

              {/* Employee Info Card */}
              <div className="bg-base-200/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Avatar name={deleteConfirm.name} size="sm" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{deleteConfirm.name || 'N/A'}</p>
                    <p className="text-xs text-base-content/60">{deleteConfirm.role || 'Employee'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                      Delete Employee
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeTable;