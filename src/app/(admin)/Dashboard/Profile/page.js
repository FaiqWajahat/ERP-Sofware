"use client";
import React, { useState, useEffect } from "react";
// 1. Added Shield icon
import { Eye, EyeOff, Upload, User, Loader2, CheckCircle2, X, Shield } from "lucide-react";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import axios from "axios"; 
import { errorToast, successToast } from "@/lib/toast";
import { useUserStore } from "@/stores/userStore";
import CustomLoader from "@/Components/CustomLoader";

export default function ProfileSettings() {

  const {setUser}= useUserStore();

  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    role: "", // 2. Added role to state
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [profilePic, setProfilePic] = useState(null); 
  const [imageFile, setImageFile] = useState(null);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get('/api/user/profile');
      const data = response.data;
      const success = data.success;

      if (!success) {
        errorToast( data.message || "Failed to load profile data" );
        return;
      }

      const userData = data.user || {}; 
      
      setFormData(prev => ({
        ...prev,
        name: userData.name || "", 
        email: userData.email || "",
        role: userData.role || "User", // 3. Set role from backend
      }));
      
      if (userData.profilePic) {
        setProfilePic(userData.profilePic);
      }
      
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: "error", text: "Failed to load profile data" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: "", text: "" });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 5MB" });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: "Please upload a valid image file" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
      setImageFile(file);
      setMessage({ type: "", text: "" });
    }
  };

  const handleRemoveImage = () => {
    setProfilePic(null);
    setImageFile(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (showPasswordSection) {
      if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
      
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 8) { 
        newErrors.newPassword = "Password must be at least 8 characters";
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors below" });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const submitData = new FormData();
      
      // Note: We do NOT append 'role' here, ensuring it cannot be updated by the user
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      
      if (imageFile) {
        submitData.append("profilePic", imageFile); 
      }
      
      if (showPasswordSection && formData.newPassword) {
        submitData.append("currentPassword", formData.currentPassword);
        submitData.append("newPassword", formData.newPassword);
      }

      const response = await axios.put('/api/user/updateUser', submitData);
      const data = response.data;
      const success = data.success;
      if (!success) {
        errorToast( data.message || "Failed to update profile" );
        return;
      }
      successToast( data.message || "Profile updated successfully!" );
      setMessage({ type: "success", text: data.message || "Profile updated successfully!" });

      if (data.user) {
        setUser(data.user);
        if (data.user.profilePic) setProfilePic(data.user.profilePic);
        setFormData(prev => ({
            ...prev,
            name: data.user.name || prev.name,
            email: data.user.email || prev.email,
            role: data.user.role || prev.role, // Update role if returned
        }));
      }

      if (showPasswordSection) {
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        setShowPasswordSection(false);
      }
      setImageFile(null);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <CustomLoader text={'Loading profile...'}/>
    );
  }

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Profile Settings", href: "/Dashboard/Profile" },
  ];

  return (
    <>
    <DashboardPageHeader breadData={breadData} heading="My Profile" />
    <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
      <div className="mx-auto">
        <div className="bg-base-100 rounded-lg overflow-hidden">
          
          {/* Profile Image Section */}
          <div className="px-4 py-5 sm:px-6 bg-base-200/50 border-b border-base-300 rounded-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="avatar">
                  <div className="w-32 h-32 rounded-full ring ring-[var(--primary-color)] ring-offset-base-100 ring-offset-2">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-base-300 flex items-center justify-center">
                        <User size={40} className="text-base-content/40" />
                      </div>
                    )}
                  </div>
                </div>
                
                <label 
                  htmlFor="photo-upload" 
                  className="btn bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 border-none text-white btn-sm btn-circle absolute bottom-0 right-0 shadow-lg cursor-pointer"
                  title="Upload photo"
                >
                  <Upload size={16} />
                  <input 
                    type="file" 
                    id="photo-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </label>
              </div>

              <div className="flex-1 m-auto text-center sm:text-left space-y-1">
                <h2 className="text-xl font-semibold text-base-content">
                  {formData.name || "User"}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                   <p className="text-xs text-base-content/60">
                    JPG, PNG or GIF • Max 5MB
                   </p>
                   {/* Badge for Role */}
                   <div className="badge badge-sm badge-ghost gap-1">
                      <Shield size={10}/>
                      {formData.role}
                   </div>
                </div>
               
                {profilePic && (
                  <button 
                    onClick={handleRemoveImage}
                    type="button" 
                    disabled={isLoading}
                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 mt-2"
                  >
                    <X size={14} />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-4 py-5 sm:px-6">
            
            {/* Alert Message */}
            {message.text && (
              <div role="alert" className={`alert ${
                message.type === "success" ? "alert-success text-white" : 
                message.type === "info" ? "alert-info" : 
                "alert-error text-white"
              } mb-4 text-sm py-3 rounded-lg flex items-center`}>
                <CheckCircle2 size={18} />
                <span className="text-sm flex-1">{message.text}</span>
                <button 
                  onClick={() => setMessage({ type: "", text: "" })}
                  className="btn btn-ghost btn-xs btn-circle text-current"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-base-content border-b border-base-300 pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="form-control sm:col-span-2">
                  <label htmlFor="name" className="label py-1">
                    <span className="label-text text-sm font-medium text-base-content">
                      Full Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`input input-sm input-bordered w-full text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                      errors.name ? 'input-error' : ''
                    }`}
                  />
                  {errors.name && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error text-sm">{errors.name}</span>
                    </label>
                  )}
                </div>

                {/* Email */}
                <div className="form-control sm:col-span-2">
                  <label htmlFor="email" className="label py-1">
                    <span className="label-text text-sm font-medium text-base-content">
                      Email Address <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`input input-sm input-bordered w-full text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                      errors.email ? 'input-error' : ''
                    }`}
                  />
                  {errors.email && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error text-sm">{errors.email}</span>
                    </label>
                  )}
                </div>

                {/* 4. Role Field (Read Only) */}
                <div className="form-control sm:col-span-2">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium text-base-content">
                      User Role
                    </span>
                  </label>
                  <div className="relative">
                     <input
                        type="text"
                        value={formData.role}
                        readOnly
                        disabled
                        className="input input-sm input-bordered w-full text-sm bg-base-200 text-base-content/70 cursor-not-allowed pl-9 border-base-300"
                      />
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                  </div>
                  <label className="label py-1">
                    <span className="label-text-alt text-base-content/50 text-xs">
                       Your assigned role cannot be changed. Contact an administrator for permissions.
                    </span>
                  </label>
                </div>

              </div>
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-base-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-base-content">Security</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(!showPasswordSection);
                    if (showPasswordSection) {
                      setFormData(prev => ({
                        ...prev,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      }));
                      setErrors(prev => {
                        const { currentPassword, newPassword, confirmPassword, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  disabled={isLoading}
                  className="btn btn-ghost btn-xs text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 transition-colors rounded-sm"
                >
                  {showPasswordSection ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showPasswordSection && (
                <div className="space-y-3 bg-base-200/30 p-4 rounded-lg">
                  {/* Current Password */}
                  <div className="form-control">
                    <label htmlFor="currentPassword" className="label py-1">
                      <span className="label-text text-sm font-medium text-base-content">
                        Current Password <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`input input-sm input-bordered w-full text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                          errors.currentPassword ? 'input-error' : ''
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        disabled={isLoading}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <label className="label py-1">
                        <span className="label-text-alt text-error text-sm">{errors.currentPassword}</span>
                      </label>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="form-control">
                    <label htmlFor="newPassword" className="label py-1">
                      <span className="label-text text-sm font-medium text-base-content">
                        New Password <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`input input-sm input-bordered w-full text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                          errors.newPassword ? 'input-error' : ''
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <label className="label py-1">
                        <span className="label-text-alt text-error text-sm">{errors.newPassword}</span>
                      </label>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control">
                    <label htmlFor="confirmPassword" className="label py-1">
                      <span className="label-text text-sm font-medium text-base-content">
                        Confirm New Password <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`input input-sm input-bordered w-full text-sm focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                          errors.confirmPassword ? 'input-error' : ''
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <label className="label py-1">
                        <span className="label-text-alt text-error text-sm">{errors.confirmPassword}</span>
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-base-300 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button 
                type="button" 
                onClick={() => {
                  fetchProfileData();
                  setShowPasswordSection(false);
                  setErrors({});
                  setMessage({ type: "", text: "" });
                }}
                disabled={isLoading}
                className="btn btn-ghost btn-sm text-xs rounded-sm hover:bg-base-200"
              >
                Reset Changes
              </button>
              <button 
                type="button"
                disabled={isLoading}
                onClick={handleSubmit}
                className="btn btn-ghost btn-sm text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 transition-colors rounded-sm shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}