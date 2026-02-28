'use client'
import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import axios from "axios";
import { errorToast, successToast } from "@/lib/toast";
import { useRouter, useParams } from "next/navigation";
import CustomLoader from "@/Components/CustomLoader"; // Assuming you have this

const EditAsset = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Get Asset ID from URL
  
  // UI State for Dropdowns
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Loading States
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    price: "",
    status: "",
    
  });

  const [errors, setErrors] = useState({});

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

  // Fetch Asset Data on Mount
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        // Since we didn't create a specific 'getSingle' API, we fetch all and find the one.
        // Optimization: In a real app with many items, create a GET /api/assets/getAsset?id=... endpoint.
        const response = await axios.get('/api/assets/getAssets');
        
        if (response.data.success) {
          const asset = response.data.assets.find(a => a._id === id);
          
          if (asset) {
            setFormData({
              name: asset.name || "",
              category: asset.category || "",
              serialNumber: asset.serialNumber || "",
              model: asset.model || "",
              manufacturer: asset.manufacturer || "",
              purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : "", // Format for date input
              price: asset.price || "",
              status: asset.status || "Operational",
              notes: asset.notes || ""
            });
            
            // Set Dropdown Visual States
            setSelectedCategory(asset.category);
            setSelectedStatus(asset.status);
          } else {
            errorToast("Asset not found");
            router.push('/Dashboard/Company-Assets');
          }
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        errorToast("Failed to load asset details");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchAsset();
    }
  }, [id, router]);

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
    if (!formData.name.trim()) newErrors.name = "Asset name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.serialNumber.trim()) newErrors.serialNumber = "Serial Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category: category }));
    setIsCategoryOpen(false);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status.label);
    setFormData(prev => ({ ...prev, status: status.value }));
    setIsStatusOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Use PUT and include the ID
      const response = await axios.put('/api/assets/updateAsset', {
        _id: id,
        ...formData
      });

      if (response.data.success) {
        successToast("Asset Updated Successfully");
        router.push('/Dashboard/Company-Assets');
      } else {
        errorToast(response.data.message || "Failed to update asset");
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      errorToast(error.response?.data?.message || 'Failed to update asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return <CustomLoader text="Loading Asset Details..." />;
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 mx-4 flex items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Edit Asset</h2>
            <p className="text-sm text-base-content/60 mt-1 hidden md:block">
              Update machinery or vehicle details
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

              {/* Category & Manufacturer */}
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
                    placeholder="e.g., Toyota, CAT"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Serial & Model */}
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
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              {/* Date & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Purchase Date
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
                    Current Status
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

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-ghost rounded-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn bg-[var(--primary-color)] rounded-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" style={{ color: 'white' }}></span>
                      Updating...
                    </>
                  ) : (
                    'Update Asset'
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

export default EditAsset;