'use client'
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowLeft, Upload, FileText, X, Eye } from "lucide-react";
import axios from "axios";
import { errorToast, successToast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";
import CustomLoader from "@/Components/CustomLoader";

const EditQuotation = () => {
  const router = useRouter();
  const params = useParams();
  const quotationId = params?.id;
  const fileInputRef = useRef(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Draft");
  
  // File States
  const [existingFileUrl, setExistingFileUrl] = useState(null); // URL from DB
  const [selectedFile, setSelectedFile] = useState(null);       // New file to upload
  const [isFileRemoved, setIsFileRemoved] = useState(false);    // Flag if user removed existing file

  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    referenceNo: "",
    date: "",
    totalAmount: "",
    status: "Draft",
    // Notes removed
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const statuses = [
    { label: "Draft", value: "Draft" },
    { label: "Sent", value: "Sent" },
    { label: "Accepted", value: "Accepted" },
    { label: "Rejected", value: "Rejected" }
  ];

  // Fetch Data
  useEffect(() => {
    const fetchQuotationData = async () => {
      if (!quotationId) return;

      setIsFetchingData(true);
      try {
        const response = await axios.post(`/api/quotation/getSingleQuotation`, { quotationId });
        
        if (response.data.success && response.data.quotation) {
          const quotation = response.data.quotation;
          
          let formattedDate = "";
          if (quotation.date) {
            formattedDate = new Date(quotation.date).toISOString().split('T')[0];
          }

          setFormData({
            clientName: quotation.clientName || "",
            projectName: quotation.projectName || "",
            referenceNo: quotation.referenceNo || "",
            date: formattedDate,
          
            status: quotation.status || "Draft",
          });

          setSelectedStatus(quotation.status || "Draft");
          
          // Set Existing File
          if (quotation.documentUrl) {
            setExistingFileUrl(quotation.documentUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching quotation:', error);
        errorToast("Failed to load data.");
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchQuotationData();
  }, [quotationId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // --- FILE HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        errorToast("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setIsFileRemoved(false); // We are adding a new one, so "removed" is false
      setHasChanges(true);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    if (selectedFile) {
      // Removing the NEWLY selected file
      setSelectedFile(null);
    } else if (existingFileUrl) {
      // Removing the OLD existing file
      setExistingFileUrl(null);
      setIsFileRemoved(true); // Mark for deletion in backend
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setHasChanges(true);
  };
  // ---------------------

  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.clientName.trim()) newErrors.clientName = "Client name is required";
    if (!formData.referenceNo.trim()) newErrors.referenceNo = "Reference number is required";
    if (!formData.date) newErrors.date = "Date is required";
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status.label);
    setFormData(prev => ({ ...prev, status: status.value }));
    setIsStatusOpen(false);
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Use FormData for File Upload
    const dataToSend = new FormData();
    dataToSend.append("_id", quotationId);
    dataToSend.append("clientName", formData.clientName);
    dataToSend.append("projectName", formData.projectName);
    dataToSend.append("referenceNo", formData.referenceNo);
    dataToSend.append("date", formData.date);
   
    dataToSend.append("status", formData.status);
    
    // File Logic Flags for Backend
    dataToSend.append("isFileRemoved", isFileRemoved); // "true" or "false"
    
    if (selectedFile) {
      dataToSend.append("file", selectedFile);
    }

    try {
      const response = await axios.put(`/api/quotation/updateQuotation`, dataToSend);

      if (response.data.success) {
        successToast("Quotation Updated Successfully");
        setHasChanges(false);
        setTimeout(() => router.push('/Dashboard/Quotations'), 1500);
      } else {
        errorToast(response.data.message || "Failed to update quotation");
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      errorToast("Failed to update quotation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !window.confirm("You have unsaved changes. Leave?")) return;
    router.push('/Dashboard/Quotations');
  };

  if (isFetchingData) return <CustomLoader text={"Loading quotation details..."}/>;

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Edit Quotation</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">Update quotation details.</p>
          </div>
          <button onClick={handleCancel} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            
            {/* Project & Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">Project Name <span className="text-error">*</span></label>
                <input name="projectName" type="text" value={formData.projectName} onChange={handleInputChange} className={`input input-bordered w-full ${errors.projectName ? 'input-error' : ''}`} disabled={isLoading} />
                {errors.projectName && <p className="text-error text-xs mt-1">{errors.projectName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">Reference No. <span className="text-error">*</span></label>
                <input name="referenceNo" type="text" value={formData.referenceNo} onChange={handleInputChange} className={`input input-bordered w-full ${errors.referenceNo ? 'input-error' : ''}`} disabled={isLoading} />
                {errors.referenceNo && <p className="text-error text-xs mt-1">{errors.referenceNo}</p>}
              </div>
            </div>

            {/* Client & Date & Status*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">Client Name <span className="text-error">*</span></label>
                <input name="clientName" type="text" value={formData.clientName} onChange={handleInputChange} className={`input input-bordered w-full ${errors.clientName ? 'input-error' : ''}`} disabled={isLoading} />
                {errors.clientName && <p className="text-error text-xs mt-1">{errors.clientName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">Quotation Date <span className="text-error">*</span></label>
                <input name="date" type="date" value={formData.date} onChange={handleInputChange} className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`} disabled={isLoading} />
                {errors.date && <p className="text-error text-xs mt-1">{errors.date}</p>}
              </div>

                <div>
                <label className="block text-sm font-medium text-base-content mb-2">Status</label>
                <div className="relative">
                  <button type="button" onClick={() => !isLoading && setIsStatusOpen(!isStatusOpen)} className="input input-bordered w-full cursor-pointer flex items-center justify-between text-left" disabled={isLoading}>
                    <span className="text-base-content">{selectedStatus}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isStatusOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg">
                      {statuses.map((status) => (
                        <button key={status.label} type="button" onClick={() => handleStatusSelect(status)} className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors text-sm">
                          {status.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

         

            {/* FILE UPLOADER (Modified for Edit) */}
            <div className="w-full">
                <label className="block text-sm font-medium text-base-content mb-2">
                  Attach Document <span className="text-base-content/50">(Optional)</span>
                </label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />

                {/* State 1: New File Selected */}
                {selectedFile ? (
                   <div className="border border-base-300 rounded-lg p-4 flex items-center justify-between bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-primary" /></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-base-content line-clamp-1">{selectedFile.name}</span>
                        <span className="text-xs text-green-600 font-semibold">New File Selected</span>
                      </div>
                    </div>
                    <button onClick={removeFile} type="button" className="btn btn-ghost btn-xs btn-circle text-error"><X className="w-4 h-4" /></button>
                  </div>
                ) : existingFileUrl ? (
                /* State 2: Existing File from DB */
                  <div className="border border-base-300 rounded-lg p-4 flex items-center justify-between bg-base-100">
                     <div className="flex items-center gap-3">
                       <div className="bg-secondary/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-secondary" /></div>
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-base-content">Current Document Attached</span>
                         <a href={existingFileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Existing
                         </a>
                       </div>
                     </div>
                     <button onClick={removeFile} type="button" className="btn btn-ghost btn-xs text-error tooltip" data-tip="Remove File">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                ) : (
                /* State 3: No File */
                  <div onClick={() => !isLoading && fileInputRef.current?.click()} className="border-2 border-dashed border-base-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-base-200/50 transition-all group">
                    <div className="bg-base-200 p-3 rounded-full mb-3 group-hover:bg-white transition-colors"><Upload className="w-6 h-6 text-base-content/70" /></div>
                    <p className="text-sm font-medium text-base-content">Click to upload a new file</p>
                    <p className="text-xs text-base-content/50 mt-1">Replaces existing file if any</p>
                  </div>
                )}
            </div>

            <div className="border-t border-base-300 mb-6 mt-10"></div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button type="button" onClick={handleCancel} className="btn btn-ghost rounded-sm" disabled={isLoading}>Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={isLoading || !hasChanges} className="btn bg-[var(--primary-color)] rounded-sm text-white hover:opacity-90 disabled:opacity-50">
                {isLoading ? <span className="loading loading-spinner loading-sm text-white"></span> : 'Update Quotation'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuotation;