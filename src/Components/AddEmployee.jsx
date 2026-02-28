'use client'
import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import axios from "axios";
import { errorToast, sucessToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const AddEmployee = () => {
  const route = useRouter();
  
  // --- EXISTING DROPDOWN STATES ---
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [selectedNationality, setSelectedNationality] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Active");

  // --- NEW ROLE DROPDOWN STATE ---
  const [isRoleOpen, setIsRoleOpen] = useState(false);

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

  const nationalities = [
    "Pakistani",
    "Bangali",
    "Saudi",
    "Indian",
    "Other"
  ];

  // --- NEW ROLES ARRAY ---
  const roles = [
    "Foreman",
    "Engineer",
    "Labour",
    "Other"
  ];

  const statuses = [
    { label: "Active", value: true },
    { label: "Inactive", value: false }
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

  // --- NEW ROLE SELECTION HANDLER ---
  const handleRoleSelect = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      role: roleValue
    }));
    setIsRoleOpen(false);
    
    // Clear error if exists
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.iqamaNumber.trim()) {
      newErrors.iqamaNumber = "Iqama number is required";
    } else if (!/^\d{10}$/.test(formData.iqamaNumber.trim())) {
      newErrors.iqamaNumber = "Iqama number must be exactly 10 digits";
    }

    if (!formData.nationality) {
      newErrors.nationality = "Nationality is required";
    }

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
      joiningDate: formData.joiningDate || today
    };

    try {
      const response = await axios.post('/api/employee/addEmployee', dataToSend);

      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      sucessToast(response.data.message || "Employee Added Successfully");

      setFormData({
        name: "",
        iqamaNumber: "",
        phone: "",
        nationality: "",
        role: "",
        joiningDate: "",
        salary: "000",
        status: true
      });
      setSelectedNationality("");
      setSelectedStatus("Active");
      setIsRoleOpen(false); // Reset role dropdown state
      setErrors({});
      route.back();

    } catch (error) {
      console.error('Error adding employee:', error);
      errorToast(error.response?.data?.message || 'Failed to add employee. Please try again.');
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
             <h2 className="text-2xl font-bold text-base-content">Add Employee</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Add a new employee to the company database.
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
                    onClick={() => setIsNationalityOpen(!isNationalityOpen)}
                    className={`input input-bordered w-full cursor-pointer flex items-center justify-between text-left ${errors.nationality ? 'input-error' : ''}`}
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
                
                {/* --- ROLE DROPDOWN START --- */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Role / Position <span className="text-error">*</span>
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsRoleOpen(!isRoleOpen)}
                      className={`input input-bordered w-full cursor-pointer flex items-center justify-between text-left ${errors.role ? 'input-error' : ''}`}
                    >
                      {/* Check if a role is selected, else show placeholder */}
                      <span className={formData.role ? "text-base-content" : "text-base-content/40"}>
                        {formData.role || "Select role/position"}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isRoleOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {roles.map((roleOption) => (
                          <button
                            key={roleOption}
                            type="button"
                            onClick={() => handleRoleSelect(roleOption)}
                            className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors text-sm"
                          >
                            {roleOption}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {errors.role && (
                    <p className="text-error text-xs mt-1">{errors.role}</p>
                  )}
                </div>
                {/* --- ROLE DROPDOWN END --- */}

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Joining Date <span className="text-base-content/50">(Defaults to Today)</span>
                  </label>
                  <input
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Status <span className="text-base-content/50">(Default: Active)</span>
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

              {/* Divider */}
              <div className="border-t border-base-300 mb-6 mt-10"></div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: "",
                      iqamaNumber: "",
                      phone: "",
                      nationality: "",
                      role: "",
                      joiningDate: "",
                      salary: "000",
                      status: true
                    });
                    setSelectedNationality("");
                    setSelectedStatus("Active");
                    setIsRoleOpen(false);
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
                    'Add Employee'
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

export default AddEmployee;