'use client'
import React, { useState, useEffect } from "react";
import { ChevronDown, ArrowLeft, Loader2 } from "lucide-react";
import axios from "axios";
import { errorToast, sucessToast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";
import CustomLoader from "./CustomLoader";

const EditEmployee = () => {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id;

  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [formData, setFormData] = useState({
    name: "",
    iqamaNumber: "",
    phone: "",
    nationality: "",
    role: "",
    joiningDate: "",
    salary: "000",
    status: true
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const nationalities = [
    "Pakistani",
    "Bangali",
    "Saudi",
    "Indian",
    "Other"
  ];

  const statuses = [
    { label: "Active", value: true },
    { label: "Inactive", value: false }
  ];

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        errorToast("Employee ID not found");
        router.push('/Dashboard/Employees');
        return;
      }

      setIsFetchingData(true);
      try {
        const response = await axios.get(`/api/employee/getEmployee/${employeeId}`);
        
        if (response.data.success && response.data.employee) {
          const employee = response.data.employee;
          
          // Format the date for input field (YYYY-MM-DD)
          let formattedDate = "";
          if (employee.joiningDate) {
            const date = new Date(employee.joiningDate);
            formattedDate = date.toISOString().split('T')[0];
          }

          setFormData({
            name: employee.name || "",
            iqamaNumber: employee.iqamaNumber || "",
            phone: employee.phone || "",
            nationality: employee.nationality || "",
            role: employee.role || "",
            joiningDate: formattedDate,
            salary: employee.salary?.toString() || "000",
            status: employee.status ?? true
          });

          setSelectedNationality(employee.nationality || "");
          setSelectedStatus(employee.status ? "Active" : "Inactive");
        } else {
          errorToast(response.data.message || "Failed to fetch employee data");
          router.push('/Dashboard/Employees');
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        errorToast(
          error.response?.data?.message || 'Failed to load employee data. Please try again.'
        );
        router.push('/Dashboard/Employees');
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
    
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

    // Name validation - required
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Iqama Number validation - required and must be exactly 10 digits
    if (!formData.iqamaNumber.trim()) {
      newErrors.iqamaNumber = "Iqama number is required";
    } else if (!/^\d{10}$/.test(formData.iqamaNumber.trim())) {
      newErrors.iqamaNumber = "Iqama number must be exactly 10 digits";
    }

    // Nationality validation - required
    if (!formData.nationality) {
      newErrors.nationality = "Nationality is required";
    }

    // Role validation - required
    if (!formData.role.trim()) {
      newErrors.role = "Role/Position is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNationalitySelect = (nationality) => {
    setSelectedNationality(nationality);
    setFormData(prev => ({
      ...prev,
      nationality: nationality
    }));
    setIsNationalityOpen(false);
    setHasChanges(true);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status.label);
    setFormData(prev => ({
      ...prev,
      status: status.value
    }));
    setIsStatusOpen(false);
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(`/api/employee/updateEmployee/${employeeId}`, formData);

      if (response.data.success) {
        sucessToast(response.data.message || "Employee Updated Successfully");
        setHasChanges(false);
        
        // Redirect back to employees list after a short delay
        setTimeout(() => {
          router.push('/Dashboard/Employees');
        }, 1500);
      } else {
        errorToast(response.data.message || "Failed to update employee");
      }
      
    } catch (error) {
      console.error('Error updating employee:', error);
      errorToast(
        error.response?.data?.message || 'Failed to update employee. Please try again.'
      );
      router.push('/Dashboard/Employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmLeave) return;
    }
    router.push('/Dashboard/Employees');
  };

  // Loading state while fetching data
  if (isFetchingData) {
    return (
     <CustomLoader text={"Loading employee info..."}/>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
          
            <h2 className="text-2xl font-bold text-base-content">Edit Employee</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Update employee information and details.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
        </div>

        <div className="">
          <div className="p-6">
            {/* Form */}
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter employee full name"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-error text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Iqama Number and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Iqama Number <span className="text-error">*</span>
                  </label>
                  <input
                    name="iqamaNumber"
                    type="text"
                    value={formData.iqamaNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit Iqama number"
                    className={`input input-bordered w-full ${errors.iqamaNumber ? 'input-error' : ''}`}
                    maxLength="10"
                    disabled={isLoading}
                  />
                  {errors.iqamaNumber && (
                    <p className="text-error text-xs mt-1">{errors.iqamaNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Phone Number <span className="text-base-content/50">(Optional)</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+966 XX XXX XXXX"
                    className="input input-bordered w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Nationality Dropdown */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Nationality <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => !isLoading && setIsNationalityOpen(!isNationalityOpen)}
                    className={`input input-bordered w-full cursor-pointer flex items-center justify-between text-left ${errors.nationality ? 'input-error' : ''}`}
                    disabled={isLoading}
                  >
                    <span className={selectedNationality ? "text-base-content" : "text-base-content/40"}>
                      {selectedNationality || "Select nationality"}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isNationalityOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isNationalityOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {nationalities.map((nationality) => (
                        <button
                          key={nationality}
                          type="button"
                          onClick={() => handleNationalitySelect(nationality)}
                          className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors text-sm"
                        >
                          {nationality}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.nationality && (
                  <p className="text-error text-xs mt-1">{errors.nationality}</p>
                )}
              </div>

              {/* Role and Joining Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Role / Position <span className="text-error">*</span>
                  </label>
                  <input
                    name="role"
                    type="text"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Contractor"
                    className={`input input-bordered w-full ${errors.role ? 'input-error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.role && (
                    <p className="text-error text-xs mt-1">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Joining Date <span className="text-base-content/50">(Optional)</span>
                  </label>
                  <input
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Salary and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Monthly Salary (SAR) <span className="text-base-content/50">(Optional, default 000)</span>
                  </label>
                  <input
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="Enter monthly salary"
                    className="input input-bordered w-full"
                    min="0"
                    step="1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Status <span className="text-base-content/50">(Default: Active)</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => !isLoading && setIsStatusOpen(!isStatusOpen)}
                      className="input input-bordered w-full cursor-pointer flex items-center justify-between text-left"
                      disabled={isLoading}
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

              {/* Divider */}
              <div className="border-t border-base-300 mb-6 mt-10"></div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost rounded-sm"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !hasChanges}
                  className="btn bg-[var(--primary-color)] rounded-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" style={{ color: 'white' }}></span>
                      Updating...
                    </>
                  ) : (
                    'Update Employee'
                  )}
                </button>
              </div>

              {/* Unsaved Changes Warning */}
              {hasChanges && !isLoading && (
                <div className="alert alert-warning shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm">You have unsaved changes. Don't forget to save!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;