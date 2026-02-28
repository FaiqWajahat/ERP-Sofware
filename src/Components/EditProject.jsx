'use client'
import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import axios from "axios";
import { errorToast, successToast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";
import CustomLoader from "@/Components/CustomLoader"; 

const EditProject = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id; // Get ID from URL

  // UI State for Dropdowns
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  // Loading States
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    location: "",
    startDate: "",
    estimatedBudget: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  // Dropdown Options
  const projectStatuses = [
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
  ];

  // --- 1. Fetch Existing Project Data ---
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;

      try {
        setIsFetching(true);
        // Assuming your get endpoint is like /api/project/[id]
        const response = await axios.get(`/api/project/${projectId}/get`);
        
        if (response.data.success) {
          const project = response.data.project || response.data.data;
          
          setFormData({
            name: project.name || "",
            clientName: project.clientName || "",
            location: project.location || "",
            // Format date to YYYY-MM-DD for HTML input
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
            estimatedBudget: project.estimatedBudget || "",
            status: project.status || "active",
          });
        } else {
          errorToast("Failed to load project details");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        errorToast("Error loading project");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, router]);

  // --- 2. Form Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.estimatedBudget && isNaN(formData.estimatedBudget)) {
      newErrors.estimatedBudget = "Budget must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusSelect = (status) => {
    setFormData(prev => ({
      ...prev,
      status: status.value
    }));
    setIsStatusOpen(false);
  };

  // --- 3. Submit Handler ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const payload = {
        projectId: projectId, // Pass ID to identify which project to update
        ...formData,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : 0
      };

      // Assuming you have an update route, e.g., PUT /api/project/updateProject or PATCH /api/project/[id]
      const response = await axios.put('/api/project/updateProject', payload); 
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Failed to update project");
        setIsSaving(false);
        return;
      } 

      successToast(response.data.message || "Project Updated Successfully");
      router.push('/Dashboard/Projects'); 

    } catch (error) {
      console.error('Error updating project:', error);
      errorToast(error.response?.data?.message || 'Failed to update project.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render ---

  if (isFetching) {
    return <CustomLoader text="Loading Project Details..." />;
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Edit Project</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Update project details and status
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
                    name="name"
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
                    className={`input input-bordered w-full ${errors.location ? 'input-error' : ''}`}
                  />
                  {errors.location && (
                    <p className="text-error text-xs mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Start Date
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
                      <span className="text-base-content capitalize">
                        {formData.status}
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
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="btn bg-[var(--primary-color)] rounded-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-sm" style={{ color: 'white' }}></span>
                      Updating...
                    </>
                  ) : (
                    'Update Project'
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

export default EditProject;