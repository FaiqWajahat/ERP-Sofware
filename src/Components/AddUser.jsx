"use client";
import React, { useRef, useState, useMemo } from "react";
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  Shield,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";

export default function AddUser({ onSave }) {
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "User",
    status: "Active",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const open = () => modalRef.current?.showModal();
  const close = () => modalRef.current?.close();
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 3)
      next.name = "Name must be at least 3 characters.";
    if (!form.email.includes("@")) next.email = "A valid email is required.";
    if (!form.password || form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return next;
  };

  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);

    const finalData = {
      id: `USR-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      createdAt: new Date().toISOString(),
    };

    onSave?.(finalData);
    close();

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "User",
      status: "Active",
      password: "",
    });
    setErrors({});
    setSubmitting(false);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={open}
        className="btn btn-primary text-white rounded-lg gap-2 text-sm font-medium shadow-sm"
      >
        <UserPlus className="w-5 h-5" /> Add User
      </button>

      {/* Modal */}
      <dialog ref={modalRef} className="modal w-full modal-middle h-full">
        <div className="modal-box text-sm max-w-3xl rounded-2xl p-0 bg-base-200 shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-primary rounded-md relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full">
                <UserPlus className="w-6 h-6 text-primary-content" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-primary-content">
                  Create User
                </h3>
                <p className="text-xs text-primary-content/80">
                  Add a new user to the system with role and status.
                </p>
              </div>
            </div>
            <form method="dialog" className="absolute right-4 top-4">
              <button className="btn btn-sm btn-circle text-primary-content bg-primary/40 hover:bg-primary/60 border-none">
                ✕
              </button>
            </form>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-6 flex-1 space-y-6 overflow-y-auto"
          >
            {errorCount > 0 && (
              <div role="alert" className="alert alert-error text-sm">
                <Info className="w-5 h-5" />
                <span>
                  Please fix{" "}
                  <span className="font-semibold">
                    {errorCount} field{errorCount > 1 ? "s" : ""}
                  </span>{" "}
                  before saving.
                </span>
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-4 bg-base-100 px-4 py-5 rounded-lg shadow-sm">
              <h4 className="text-base font-semibold tracking-wide">
                Basic Information
              </h4>
              <div className="space-y-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-sm">
                      <UserPlus className="w-4 h-4 text-base-content/60" /> Name
                    </span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`input input-bordered rounded-lg w-full text-sm ${
                      errors.name ? "input-error" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-error text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-base-content/60" /> Email
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className={`input input-bordered rounded-lg w-full text-sm ${
                      errors.email ? "input-error" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-error text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-base-content/60" /> Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+123456789"
                    className="input input-bordered rounded-lg w-full text-sm"
                  />
                </div>

                {/* Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-base-content/60" /> Password
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="******"
                    className={`input input-bordered rounded-lg w-full text-sm ${
                      errors.password ? "input-error" : ""
                    }`}
                  />
                  {errors.password && (
                    <p className="text-error text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Role & Status */}
            <section className="space-y-4 bg-base-100 px-4 py-5 rounded-lg shadow-sm">
              <h4 className="text-base font-semibold tracking-wide">
                Role & Status
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-base-content/60" /> Role
                    </span>
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="select select-bordered rounded-lg text-sm"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {/* Status */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 text-sm">
                      {form.status === "Active" ? (
                        <ToggleRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-red-500" />
                      )}
                      Status
                    </span>
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="select select-bordered rounded-lg text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </section>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-2 py-3 bg-base-100 px-4 border-t">
            <button
              type="button"
              onClick={close}
              className="btn btn-ghost text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex items-center gap-2 rounded-lg text-sm"
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Save User
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
