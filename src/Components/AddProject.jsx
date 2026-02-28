'use client'
import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import axios from "axios";
import { errorToast, successToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const AddProject = () => {
  const router = useRouter();
  
  // UI State for Dropdowns
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");

  // Form Data State - Now using 'name' instead of 'projectName'
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    location: "",
    startDate: "",
    estimatedBudget: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown Options
  const projectStatuses = [
    { label: "Active", value: "active" }, 
    { label: "Completed", value: "completed" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // Budget validation
    if (formData.estimatedBudget && isNaN(formData.estimatedBudget)) {
      newErrors.estimatedBudget = "Budget must be a valid number";
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

    const today = new Date().toISOString().split('T')[0];

    const dataToSend = {
      ...formData,
      startDate: formData.startDate || today,
      estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : 0
    };

    try {
      const response = await axios.put('/api/project/add', dataToSend); 
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false); 
        return;
      } 

      successToast(response.data.message || "Project Created Successfully");
      
      setFormData({
        name: "",
        clientName: "",
        location: "",
        startDate: "",
        estimatedBudget: "",
        status: "active",
      });
      setSelectedStatus("Active");
      setErrors({});
      router.push('/Dashboard/Projects'); 

    } catch (error) {
      console.error('Error adding project:', error);
      errorToast(error.response?.data?.message || 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Create New Project</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Register a new construction site or contract
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Form Container */}
        <div>
          <div className="p-4">
            <div className="space-y-6">
              
              {/* Project Name & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Project Name <span className="text-error">*</span>
                  </label>
                  <input
                    name="name" // Updated to match schema
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Al Narjis Villa Compound"
                    className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-error text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Client Name
                  </label>
                  <input
                    name="clientName"
                    type="text"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="e.g., Ministry of Housing"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Location & Start Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Location <span className="text-error">*</span>
                  </label>
                  <input
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Riyadh, Malqa Dist."
                    className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                  />
                  {errors.location && (
                    <p className="text-error text-xs mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Start Date <span className="text-base-content/50">(Defaults to Today)</span>
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Budget & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Estimated Budget (SAR)
                  </label>
                  <input
                    name="estimatedBudget"
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    className={`input input-bordered w-full ${errors.estimatedBudget ? 'input-error' : ''}`}
                  />
                   {errors.estimatedBudget && (
                    <p className="text-error text-xs mt-1">{errors.estimatedBudget}</p>
                  )}
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Project Status
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
                        {projectStatuses.map((status) => (
                          <button
                            key={status.label}
                            type="button"
                            onClick={() => handleStatusSelect(status)}
                            className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors text-sm first:rounded-t-lg last:rounded-b-lg"
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-base-300 mb-6 mt-6"></div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
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
                      Creating Project...
                    </>
                  ) : (
                    'Create Project'
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

export default AddProject;