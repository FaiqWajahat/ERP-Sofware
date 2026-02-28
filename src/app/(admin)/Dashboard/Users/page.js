'use client'

import React, { useEffect, useState } from "react";
// 1. Added Shield icon to imports
import { Plus, Trash2, X, Loader2, Search, User, Eye, EyeOff, Shield } from "lucide-react";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import { errorToast, sucessToast } from "@/lib/toast";
import axios from "axios";
import CustomLoader from "@/Components/CustomLoader";

export default function UsersPage() {
  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Users", href: "/Dashboard/Users" },
  ];

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);

  // 2. Updated formData to include role
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User' // Default value
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Validate Role
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const response = await axios.get('/api/user/getUser');
      const success = response.data.sucess;
      
      if (!success) {
        errorToast(response.data.message || 'Failed to fetch users. Please try again.');
        return;
      }
      
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      errorToast(error.response?.data?.message || 'Failed to fetch users. Please try again.');
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/api/user/createUser', formData);
      const success = response.data.sucess;
      
      if (!success) {
        const errorMessage = response.data.message || 'Failed to add user. Please try again.';
        setErrors({ submit: errorMessage });
        errorToast(errorMessage);
        return;
      }
      
      const newUser = response.data.user;
      sucessToast(response.data.message || 'User added successfully.');

      setUsers(prev => [...prev, newUser]);
      setIsModalOpen(false);
      // Reset form including role
      setFormData({ name: '', email: '', password: '', role: 'User' });
      setErrors({});

    } catch (error) {
      console.error('Error adding user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add user. Please try again.';
      setErrors({ submit: errorMessage });
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);

    try {
      const response = await axios.delete('/api/user/deleteUser', {
        data: { userId: userToDelete._id }
      });
      
      const success = response.data.sucess;
      
      if (!success) {
        errorToast(response.data.message || 'Failed to delete user. Please try again.');
        return;
      }

      sucessToast(response.data.message || 'User deleted successfully.');
      setUsers(prev => prev.filter(user => user._id !== userToDelete._id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

    } catch (error) {
      console.error('Error deleting user:', error);
      errorToast(error.response?.data?.message || 'Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeAddModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'User' });
      setErrors({});
      setShowPassword(false); 
    }
  };

  const closeDeleteModal = () => {
    if (!deleteLoading) {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  if(isFetchingUsers) return <CustomLoader text={"Loading users..."}/>

  else return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Users" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Total Users</div>
            <div className="stat-value text-2xl">
              {isFetchingUsers ? 0 : users.length}
            </div>
            <div className="stat-desc">All registered users</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">New This Month</div>
            <div className="stat-value text-2xl" style={{ color: 'var(--primary-color)' }}>
              {isFetchingUsers ? 0 : users.filter(u => {
                const created = new Date(u.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="stat-desc" style={{ color: 'var(--primary-color)' }}>Recently added</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title text-xs">Search Results</div>
            <div className="stat-value text-2xl text-info">{filteredUsers.length}</div>
            <div className="stat-desc text-info">Matching users</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full bg-base-100 rounded-xl shadow-lg p-4 lg:p-6 mt-6">
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between mb-6 md:px-2">
          {/* Search */}
          <div className="w-full md:w-auto justify-center md:justify-start flex">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm input-bordered w-full md:w-64 pl-9 text-sm"
                disabled={isFetchingUsers}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
            </div>
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-sm text-white rounded-sm"
            style={{ backgroundColor: 'var(--primary-color)' }}
            disabled={isFetchingUsers}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="w-full overflow-x-auto">
          {isFetchingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
               <CustomLoader text={"Loading Users..."}/>
              </div>
            </div>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200">
                  <th className="text-xs font-semibold text-base-content/70">User</th>
                  <th className="text-xs font-semibold text-base-content/70">Email</th>
                  {/* 3. Added Role Header */}
                  <th className="text-xs font-semibold text-base-content/70">Role</th>
                  <th className="text-xs font-semibold text-base-content/70">Joined</th>
                  <th className="text-xs font-semibold text-base-content/70 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-base-content/60">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        {searchQuery ? 'No users found matching your search' : 'No users found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-base-200/50 border-b border-base-300">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-md">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name} className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                  <User size={20} className="text-base-content/40" />
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="font-medium text-sm text-base-content">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-sm text-base-content/70">{user.email}</td>
                      
                      {/* 3. Added Role Column Data */}
                      <td>
                        <div className={`badge badge-sm gap-2 ${user.role === 'Admin' ? 'badge-primary text-white' : 'badge-ghost'}`}>
                          {user.role === 'Admin' && <Shield size={10} />}
                          {user.role || 'User'}
                        </div>
                      </td>

                      <td className="text-sm text-base-content/70">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-base-content">Add New User</h3>
              <button
                onClick={closeAddModal}
                className="btn btn-sm btn-circle btn-ghost"
                disabled={isLoading}
              >
                <X size={18} />
              </button>
            </div>

            {errors.submit && (
              <div className="alert alert-error mb-4 text-xs py-2">
                <span>{errors.submit}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`input input-sm input-bordered w-full text-sm ${
                    errors.name ? 'input-error' : ''
                  }`}
                />
                {errors.name && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error text-xs">{errors.name}</span>
                  </label>
                )}
              </div>

              {/* Email Field */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Email <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`input input-sm input-bordered w-full text-sm ${
                    errors.email ? 'input-error' : ''
                  }`}
                />
                {errors.email && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error text-xs">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* 4. Role Dropdown Field (New) */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Role <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`select select-sm select-bordered w-full text-sm font-normal ${
                    errors.role ? 'select-error' : ''
                  }`}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error text-xs">{errors.role}</span>
                  </label>
                )}
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">
                    Password <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`input input-sm input-bordered w-full text-sm pr-10 ${
                      errors.password ? 'input-error' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {errors.password && (
                  <label className="label py-1">
                    <span className="label-text-alt text-error text-xs">{errors.password}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="modal-action mt-6">
              <button
                onClick={closeAddModal}
                className="btn btn-ghost btn-sm text-xs"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={isLoading}
                className="btn btn-sm text-xs text-white"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add User
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeAddModal} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg text-base-content mb-4">Confirm Delete</h3>
            
            <div className="flex items-center gap-3 p-4 bg-base-200 rounded-lg mb-4">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  {userToDelete.profileImage ? (
                    <img src={userToDelete.profileImage} alt={userToDelete.name} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-base-300 flex items-center justify-center">
                      <User size={24} className="text-base-content/40" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-base-content">{userToDelete.name}</p>
                <div className="flex items-center gap-2">
                   <p className="text-xs text-base-content/60">{userToDelete.email}</p>
                   <span className="text-xs opacity-50">•</span>
                   <p className="text-xs text-base-content/60 font-medium">{userToDelete.role || 'User'}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-base-content/70 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            <div className="modal-action mt-4">
              <button
                onClick={closeDeleteModal}
                className="btn btn-ghost btn-sm text-xs"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="btn btn-error btn-sm text-xs text-white"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeDeleteModal} />
        </div>
      )}
    </>
  );
}