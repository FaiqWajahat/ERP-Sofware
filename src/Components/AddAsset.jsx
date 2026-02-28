'use client'
import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import axios from "axios";
import { errorToast, successToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const AddAsset = () => {
  const router = useRouter();
  
  // UI State for Dropdowns
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Operational");

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    price: "",
    status: "Operational",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown Options
  const categories = [
    "Heavy Machinery",
    "Light Vehicle",
    "Truck",
    "Excavator",
    "Tools",
    "Other"
  ];

  const statuses = [
    { label: "Operational", value: "Operational" },
    { label: "Maintenance", value: "Maintenance" },
    { label: "Repair", value: "Repair" },
    { label: "Inactive", value: "Inactive" },
    { label: "Sold", value: "Sold" }
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
      newErrors.name = "Asset name is required";
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    // Serial Number validation
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial Number / Plate No is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category: category
    }));
    setIsCategoryOpen(false);
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

    // --- EDITED SECTION START ---
    // Calculate today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Create payload: Use existing purchaseDate, or fallback to 'today'
    const dataToSend = {
      ...formData,
      purchaseDate: formData.purchaseDate || today
    };
    // --- EDITED SECTION END ---

    try {
      // Use dataToSend instead of formData
      const response = await axios.post('/api/assets/addAsset', dataToSend);
      const success = response.data.success;

      if (!success) {
        errorToast(response.data.message || "Something went wrong");
        setIsLoading(false); 
        return;
      } 

      successToast(response.data.message || "Asset Added Successfully");
      
      // Reset form
      setFormData({
        name: "",
        category: "",
        serialNumber: "",
        model: "",
        manufacturer: "",
        purchaseDate: "",
        price: "",
        status: "Operational",
      });
      setSelectedCategory("");
      setSelectedStatus("Operational");
      setErrors({});
      router.push('/Dashboard/Company-Assets'); 

    } catch (error) {
      console.error('Error adding asset:', error);
      errorToast(error.response?.data?.message || 'Failed to add asset. Please try again.');
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
            <h2 className="text-2xl font-bold text-base-content">Add New Asset</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Add machinery or vehicle details to the fleet
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
              
              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Asset Name <span className="text-error">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Caterpillar Excavator 320"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && (
                  <p className="text-error text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Category (Dropdown) & Manufacturer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Category <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className={`input input-bordered w-full cursor-pointer flex items-center justify-between text-left ${errors.category ? 'input-error' : ''}`}
                    >
                      <span className={selectedCategory ? "text-base-content" : "text-base-content/40"}>
                        {selectedCategory || "Select Category"}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCategoryOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategorySelect(cat)}
                            className="w-full text-left px-4 py-2.5 hover:bg-base-200 transition-colors text-sm"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.category && (
                    <p className="text-error text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Manufacturer
                  </label>
                  <input
                    name="manufacturer"
                    type="text"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota, CAT, Komatsu"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Serial Number & Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Serial No. / Plate No. <span className="text-error">*</span>
                  </label>
                  <input
                    name="serialNumber"
                    type="text"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Enter Unique ID"
                    className={`input input-bordered w-full ${errors.serialNumber ? 'input-error' : ''}`}
                  />
                  {errors.serialNumber && (
                    <p className="text-error text-xs mt-1">{errors.serialNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Model
                  </label>
                  <input
                    name="model"
                    type="text"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024 Series"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Purchase Date & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Purchase Date <span className="text-base-content/50">(Defaults to Today)</span>
                  </label>
                  <input
                    name="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Price / Value (SAR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="input input-bordered w-full"
                    min="0"
                  />
                </div>
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 gap-6">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Current Status <span className="text-base-content/50">(Default: Operational)</span>
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
                      Saving Asset...
                    </>
                  ) : (
                    'Add Asset'
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

export default AddAsset;