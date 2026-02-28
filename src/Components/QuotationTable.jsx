'use client';
import React, { useState } from 'react';
import { 
  Edit, 
  Trash, 
  X, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Briefcase, 
  User, 
  DollarSign, 
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Eye,       // Icon for View
  Download,   // Icon for Download
  CalendarRange
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { successToast, errorToast } from '@/lib/toast';
import axios from 'axios';
import CustomLoader from './CustomLoader';

const QuotationTable = ({ quotations, isLoading, onDeleteQuotation }) => {
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Helper for status colors and icons
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Accepted':
        return { color: 'text-green-600', bg: 'bg-green-500', icon: CheckCircle, label: 'Accepted' };
      case 'Rejected':
        return { color: 'text-red-600', bg: 'bg-red-500', icon: XCircle, label: 'Rejected' };
      case 'Sent':
        return { color: 'text-blue-600', bg: 'bg-blue-500', icon: Send, label: 'Sent' };
      default: // Draft
        return { color: 'text-base-content/60', bg: 'bg-base-content/50', icon: Clock, label: 'Draft' };
    }
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

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  // Open quotation details modal
  const openDialog = (quotation) => {
    setSelectedQuotation(quotation);
    setIsOpen(true);
  };

  // Close details modal
  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedQuotation(null), 200);
  };

  // Handle delete button click
  const handleDeleteClick = (quotation) => {
    setDeleteConfirm(quotation);
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
      const response = await axios.delete('/api/quotation/deleteQuotation', {
        data: { quotationId: deleteConfirm._id }
      });

      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || 'Failed to delete quotation');
        return;
      }

      if (onDeleteQuotation) {
        onDeleteQuotation(deleteConfirm._id);
      }

      setDeleteConfirm(null);
      closeDialog();
      successToast(response.data.message || 'Quotation deleted successfully');
      
    } catch (error) {
      console.error('Error deleting quotation:', error);
      errorToast(
        error.response?.data?.message || 'Failed to delete quotation. Please try again....'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // --- DOWNLOAD HANDLER ---
  const handleDownload = (e, url, fileName) => {
    e.stopPropagation(); // Prevent modal from closing if inside one
    if (!url) return;

    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'document'); 
    link.setAttribute('target', '_blank'); // Fallback for some browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- VIEW HANDLER ---
  const handleView = (e, url) => {
    e.stopPropagation();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  // Loading State
  if (isLoading) {
    return (
     <CustomLoader text={"Loading Quotations..."}/>
    );
  }

  // Empty State
  if (!quotations || quotations.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
            <FileText className="h-8 w-8 text-base-content/40" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">No Quotations Found</h3>
          <p className="text-sm text-base-content/60">Start by creating your first quotation.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quotation Table */}
      <table className="table w-full table-md">
        <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
          <tr>
            <th>S.No</th>
            <th>Project Info</th>
            <th>Ref. No</th>
            <th>Status</th>
          
            <th>Date</th>
            {/* Added Actions Column Header if needed, usually implicitly at end */}
          </tr>
        </thead>

        <tbody>
          {quotations.map((quotation, idx) => {
            const statusConfig = getStatusConfig(quotation.status);
            
            return (
              <tr
                key={quotation._id}
                className="hover:bg-base-200/40 transition cursor-pointer"
                onClick={() => openDialog(quotation)}
              >
                {/* Serial Number */}
                <td className="font-medium">{idx + 1}</td>

                {/* Project Info */}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-medium whitespace-nowrap">{quotation.projectName}</h3>
                      <span className="text-xs text-base-content/60 whitespace-nowrap">
                        {quotation.clientName || 'Unknown Client'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Reference No */}
                <td>
                  <span className="font-mono text-xs bg-base-200 px-2 py-1 rounded">
                    {quotation.referenceNo || 'N/A'}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <span className={`${statusConfig.color} text-sm font-medium flex items-center gap-1`}>
                    {statusConfig.label}
                  </span>
                </td>

              

                {/* Date */}
                <td className="table-cell whitespace-nowrap text-sm text-base-content/70">
                  {formatDate(quotation.date)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Quotation Details Modal */}
      {isOpen && selectedQuotation && (
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
                  <div className="w-20 h-20 rounded-xl bg-base-100 shadow-lg ring-4 ring-base-100 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  {/* Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusConfig(selectedQuotation.status).bg} rounded-full border-2 border-base-100 shadow-sm`}></div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-base-content mb-1">
                    {selectedQuotation.clientName}
                  </h2>
                  <p className="text-sm text-base-content/60 font-medium font-mono">
                    #{selectedQuotation.referenceNo}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getStatusConfig(selectedQuotation.status).bg}/10 ${getStatusConfig(selectedQuotation.status).color} text-xs font-medium`}>
                      <span className={`w-1.5 h-1.5 ${getStatusConfig(selectedQuotation.status).bg} rounded-full`}></span>
                      {selectedQuotation.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
              
              {/* --- DOCUMENT PREVIEW SECTION (NEW) --- */}
              {selectedQuotation.documentUrl && (
                <div className="bg-base-200/50 rounded-lg p-4 border border-base-200">
                  <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                    Attached Document
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={(e) => handleView(e, selectedQuotation.documentUrl)}
                      className="btn btn-sm btn-outline gap-2 flex-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Document
                    </button>
                    <button 
                      onClick={(e) => handleDownload(e, selectedQuotation.documentUrl, `${selectedQuotation.projectName}_doc`)}
                      className="btn btn-sm btn-outline gap-2 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}
              {/* -------------------------------------- */}

              {/* Client Details */}
              <div>
                <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">
                  Client Details
                </h3>
                <div className="space-y-3">
                  {/* Client Name */}
                  <div className="grid  grid-cols-1 gap-3 group">
                    <div className='flex items-center gap-3'>
                    <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 group-hover:bg-base-300 transition-colors">
                      <User className="h-4 w-4 text-base-content/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Project Name</p>
                      <p className="text-sm font-medium truncate">
                        {selectedQuotation.projectName || 'N/A'}
                      </p>
                    </div>
                    </div>

                     <div className='flex items-center gap-3'>
                    <div className="w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0 group-hover:bg-base-300 transition-colors">
                      <CalendarRange className="h-4 w-4 text-base-content/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-base-content/50 font-medium">Project Name</p>
                      <p className="text-sm font-medium truncate">
                         {formatDate(selectedQuotation.date) || 'N/A'}
                      </p>
                    </div>
                    </div>
                  
                  </div>
                </div>
              </div>

              <div className="border-t border-base-200"></div>

            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-3 px-4 py-5 bg-base-200/30 border-t border-base-200 flex-shrink-0">
              <button 
                onClick={() => router.push(`/Dashboard/Quotations/Edit/${selectedQuotation._id}`)} 
                className="btn bg-[var(--primary-color)] text-white rounded-sm flex-1 gap-2 shadow-sm "
              >
                <Edit className="h-4 w-4" />
                Edit 
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(selectedQuotation);
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
              <h3 className="text-xl font-bold text-center mb-2">Delete Quotation</h3>
              
              {/* Description */}
              <p className="text-sm text-base-content/70 text-center mb-6">
                Are you sure you want to delete the quotation for{" "}
                <span className="font-semibold text-base-content">
                  {deleteConfirm.clientName}
                </span>
                ? This action cannot be undone.
              </p>

              {/* Quotation Info Card */}
              <div className="bg-base-200/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-base-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-base-content/70" />
                   </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{deleteConfirm.projectName || 'N/A'}</p>
                    <p className="text-xs text-base-content/60 font-mono">{deleteConfirm.referenceNo || 'No Ref'}</p>
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
                      Delete
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

export default QuotationTable;