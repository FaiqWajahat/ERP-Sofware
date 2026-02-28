'use client';
import React from 'react';
import Image from 'next/image';

const EmployeeDetail = () => {
const employee = {
    name: "John Doe",
    role: "Software Engineer",
    phone: "+1 234 567 890",
    email: " decnd@nkwddn",
    salary: 75000,
    profilePic: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80",
    active: true,
    joinedAt: "2023-05-15",
  };


  if (!employee) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-base-100 shadow-xl rounded-2xl overflow-hidden border border-base-300">
      {/* Image */}
      <div className="w-full h-52 relative bg-base-200">
        <Image
          src={employee.profilePic}
          alt={employee.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Name & Role */}
        <div>
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-sm text-base-content/70">{employee.role}</p>
        </div>

        {/* Divider */}
        <div className="divider my-2"></div>

        {/* Info fields */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Phone:</span>
            <span>{employee.phone}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span>{employee.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Salary:</span>
            <span className="text-success font-semibold">
              Rs. {employee.salary?.toLocaleString() || '—'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Status:</span>
            {employee.active ? (
              <span className="badge badge-success text-white">Active</span>
            ) : (
              <span className="badge badge-error text-white">Inactive</span>
            )}
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Joined At:</span>
            <span>{employee.joinedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
