"use client";
import React, { useRef, useState, useMemo } from "react";
import { Layers, List, FolderPlus, ToggleLeft, ToggleRight, Info } from "lucide-react";

export default function AddCategory({ onSave }) {
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    subcategories: "",
    status: "Active",
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
      id: `CAT-${Date.now()}`,
      name: form.name.trim(),
      subcategories: form.subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status,
      createdAt: new Date().toISOString(),
    };

    onSave?.(finalData);
    close();

    setForm({ name: "", subcategories: "", status: "Active" });
    setErrors({});
    setSubmitting(false);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={open}
        className="btn btn-primary text-white rounded-lg gap-2 text-md font-medium shadow-sm"
      >
        <FolderPlus className="w-5 h-5" /> Add Category
      </button>

      {/* Modal */}
      <dialog ref={modalRef} className="modal text-sm  w-full modal-middle h-full">
        <div className="modal-box w-11/12 max-w-3xl rounded-xl p-0 bg-base-200 shadow-xl animate-fadeIn overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-primary rounded-md shadow-xl relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full">
                <FolderPlus className="w-6 h-6 text-primary-content" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary-content">Create Category</h3>
                <p className="text-sm  text-primary-content/80">
                  Add a new category and optional subcategories.
                </p>
              </div>
            </div>
            <form method="dialog" className="absolute right-4 top-4">
              <button className="btn btn-sm btn-primary btn-circle text-primary-content">
                ✕
              </button>
            </form>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-6 flex-1 space-y-8 overflow-y-auto text-base"
          >
            {errorCount > 0 && (
              <div role="alert" className="alert alert-error text-base">
                <Info className="w-5 h-5" />
                <span>
                  Please fix{" "}
                  <span className="font-bold">
                    {errorCount} field{errorCount > 1 ? "s" : ""}
                  </span>{" "}
                  before saving.
                </span>
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-4 bg-base-100 px-4 py-6 rounded-lg shadow-md">
              <h4 className="text-sm  uppercase tracking-wide font-semibold">Basic Info</h4>
              <div className="space-y-4 w-full">
                {/* Name */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text  flex items-center gap-2">
                      <Layers className="w-5 h-5 text-base-content/60" /> Name
                    </span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="E.g., Clothing"
                    className={`input w-full input-bordered rounded-lg text-sm  ${
                      errors.name ? "input-error" : ""
                    }`}
                  />
                  {errors.name && <p className="text-error text-sm  mt-1">{errors.name}</p>}
                </div>

                {/* Subcategories */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <List className="w-5 h-5 text-base-content/60" /> Subcategories
                    </span>
                  </label>
                  <input
                    name="subcategories"
                    value={form.subcategories}
                    onChange={handleChange}
                    placeholder="E.g., T-Shirts, Jeans, Jackets"
                    className="input input-bordered w-full rounded-lg text-sm "
                  />
                  {form.subcategories && (
                    <p className="text-sm  text-base-content/50 mt-1">
                      {form.subcategories
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean).length}{" "}
                      subcategory(s) added
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Status */}
            <section className="space-y-4 bg-base-100 px-4 py-6 rounded-lg shadow-md">
              <h4 className="text-sm  uppercase tracking-wide font-semibold">Status</h4>
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    {form.status === "Active" ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-red-500" />
                    )}
                    Status
                  </span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="select select-bordered w-full rounded-lg text-base"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </section>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-2 py-3 bg-base-100 px-4 rounded-md">
            <button type="button" onClick={close} className="btn btn-ghost text-md">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex items-center gap-2 rounded-lg text-xs"
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FolderPlus className="w-5 h-5" /> Save Category
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
