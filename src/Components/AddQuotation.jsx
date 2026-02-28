'use client'
import React, { useState, useRef } from "react";
import { ArrowLeft, ChevronDown, Upload, X, FileText } from "lucide-react"; // Added Upload, X, FileText icons
import axios from "axios";
import { errorToast, successToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const AddQuotation = () => {
  const route = useRouter();
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Draft");
  const [selectedFile, setSelectedFile] = useState(null); // State for the file

  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    referenceNo: "",
    date: "",
    totalAmount: "",
    status: "Draft",
    
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const statuses = [
    { label: "Draft", value: "Draft" },
    { label: "Sent", value: "Sent" },
    { label: "Accepted", value: "Accepted" },
    { label: "Rejected", value: "Rejected" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // --- File Upload Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errorToast("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: "" }));
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  // ---------------------------

  const validateForm = () => {
    const newErrors = {};

    // Client Name (Now Mandatory)
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

 

    // Reference No
    if (!formData.referenceNo.trim()) {
      newErrors.referenceNo = "Reference number is required";
    }

    // Date (Now Mandatory)
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status.label);
    setFormData(prev => ({
      ...prev,
      status: status.value
    }));
    setIsStatusOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // --- Prepare FormData for File Upload ---
    const dataToSend = new FormData();
    dataToSend.append("clientName", formData.clientName);
    dataToSend.append("projectName", formData.projectName);
    dataToSend.append("referenceNo", formData.referenceNo);
    dataToSend.append("date", formData.date);
  
    dataToSend.append("status", formData.status);
    
    // Append file if exists
    if (selectedFile) {
      dataToSend.append("file", selectedFile);
    }

    try {
      // Note: When sending FormData, axios automatically sets Content-Type to multipart/form-data
      const response = await axios.post('/api/quotation/addQuotation', dataToSend);

      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      successToast(response.data.message || "Quotation Created Successfully");

      // Reset form
      setFormData({
        clientName: "",
        projectName: "",
        referenceNo: "",
        date: "",
        
        status: "Draft",
      });
      setSelectedFile(null);
      setSelectedStatus("Draft");
      setErrors({});
      route.back();

    } catch (error) {
      console.error('Error adding quotation:', error);
      errorToast(error.response?.data?.message || 'Failed to create quotation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Add Quotation</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Add a new quotation for a client project.
            </p>
          </div>
          <button
            onClick={() => { route.back() }}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="">
          <div className="p-4">
            {/* Form */}
            <div className="space-y-6">

              {/* Project & Reference Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Project Name <span className="text-error"></span>
                  </label>
                  <input
                    name="projectName"
                    type="text"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    className={`input input-bordered w-full ${errors.projectName ? 'input-error' : ''}`}
                  />
                  {errors.projectName && (
                    <p className="text-error text-xs mt-1">{errors.projectName}</p>
                  )}
                </div>

                {/* Reference No */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Reference No. <span className="text-error">*</span>
                  </label>
                  <input
                    name="referenceNo"
                    type="text"
                    value={formData.referenceNo}
                    onChange={handleInputChange}
                    placeholder="e.g., QT-2025-001"
                    className={`input input-bordered w-full ${errors.referenceNo ? 'input-error' : ''}`}
                  />
                  {errors.referenceNo && (
                    <p className="text-error text-xs mt-1">{errors.referenceNo}</p>
                  )}
                </div>
              </div>

              {/* Client & Date Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client Name (Mandatory) */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Client Name <span className="text-error">*</span>
                  </label>
                  <input
                    name="clientName"
                    type="text"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Enter client or company name"
                    className={`input input-bordered w-full ${errors.clientName ? 'input-error' : ''}`}
                  />
                  {errors.clientName && (
                    <p className="text-error text-xs mt-1">{errors.clientName}</p>
                  )}
                </div>

                {/* Date (Mandatory) */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Quotation Date <span className="text-error">*</span>
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                  />
                  {errors.date && (
                    <p className="text-error text-xs mt-1">{errors.date}</p>
                  )}
                </div>

                    {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Status <span className="text-base-content/50">(Default: Draft)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="input input-bordered w-full cursor-pointer flex items-center justify-between text-left"
                    >
                      <span className="text-base-content">
                        {selectedStatus}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStatusOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg">
                        {statuses.map((status) => (
                          <button
                            key={status.label}
                            type="button"
                            onClick={() => handleStatusSelect(status)}
                            className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors text-sm"
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CUSTOM FILE UPLOADER (Replaced Notes) */}
              <div className="w-full">
                <label className="block text-sm font-medium text-base-content mb-2">
                  Attach Document <span className="text-base-content/50">(Optional)</span>
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" // Adjust accepted types as needed
                />

                {!selectedFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-base-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--primary-color)] hover:bg-base-200/50 transition-all group"
                  >
                    <div className="bg-base-200 p-3 rounded-full mb-3 group-hover:bg-white transition-colors">
                      <Upload className="w-6 h-6 text-base-content/70" />
                    </div>
                    <p className="text-sm font-medium text-base-content">
                      Click to upload a file
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      PDF, DOC, Images up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-base-300 rounded-lg p-4 flex items-center justify-between bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="w-5 h-5 text-[var(--primary-color)]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-base-content line-clamp-1 break-all">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={removeFile}
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-base-300 mb-6 mt-10"></div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    // Reset Logic
                    setFormData({
                      clientName: "",
                      projectName: "",
                      referenceNo: "",
                      date: "",
                      totalAmount: "",
                      status: "Draft",
                    });
                    setSelectedFile(null);
                    setSelectedStatus("Draft");
                    setErrors({});
                  }}
                  className="btn btn-ghost rounded-sm"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn bg-[var(--primary-color)] rounded-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" style={{ color: 'white' }}></span>
                      Adding...
                    </>
                  ) : (
                    'Add Quotation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuotation;