"use client";
import React, { useState, useMemo, useRef } from "react";
import {
  ShoppingBag,
  Tag,
  Layers,
  Package,
  DollarSign,
  FileText,
  ImagePlus,
  Info,
  X,
} from "lucide-react";

export default function AddProduct({ onSave }) {
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    subCategory: "",
    price: "",
    quantity: "",
    colors: "",
    sizes: "",
    tags: "",
    description: "",
    images: [],
    status: "Active",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");

  const open = () => modalRef.current?.showModal();
  const close = () => modalRef.current?.close();
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (form.images.length + files.length > 4) {
      setImageError("You can upload up to 4 images only.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setField("images", [...form.images, ...newImages]);
    setImageError("");
  };

  const handleRemoveImage = (index) => {
    const updated = [...form.images];
    updated.splice(index, 1);
    setField("images", updated);
  };

  // Validation
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.category) next.category = "Select a category.";
    if (!form.subCategory) next.subCategory = "Select a sub-category.";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter a valid price.";
    if (!form.quantity || Number(form.quantity) < 0) next.quantity = "Enter product quantity.";
    setErrors(next);
    return next;
  };

  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);

    const payload = {
      id: `PROD-${Date.now()}`,
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      subCategory: form.subCategory,
      price: Number(form.price),
      quantity: Number(form.quantity),
      colors: form.colors.split(" ").map((c) => c.trim()).filter(Boolean),
      sizes: form.sizes.split(" ").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(" ").map((t) => t.trim()).filter(Boolean),
      description: form.description.trim(),
      images: form.images.map((img) => img.file),
      status: form.status,
      createdAt: new Date().toISOString(),
    };

    onSave?.(payload);
    close();

    setForm({
      name: "",
      sku: "",
      category: "",
      subCategory: "",
      price: "",
      quantity: "",
      colors: "",
      sizes: "",
      tags: "",
      description: "",
      images: [],
      status: "Active",
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
        <ShoppingBag className="w-4 h-4" /> Add Product
      </button>

      {/* Modal */}
      <dialog ref={modalRef} className="modal modal-middle w-full h-full">
        <div className="modal-box text-sm max-w-3xl rounded-2xl p-0 bg-base-200 shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-primary rounded-t-2xl shadow-md relative">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary-content" />
              <div>
                <h3 className="font-bold text-xl text-primary-content">
                  Add New Product
                </h3>
                <p className="text-xs text-primary-content/80">
                  Fill in the details to add a new product.
                </p>
              </div>
            </div>
            <form method="dialog" className="absolute right-4 top-4">
              <button className="btn btn-xs btn-primary btn-circle text-primary-content text-sm">
                ✕
              </button>
            </form>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-5 py-5 flex-1 space-y-7 overflow-y-auto"
          >
            {errorCount > 0 && (
              <div role="alert" className="alert alert-error text-sm">
                <Info className="w-4 h-4" />
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
            <section className="space-y-4 bg-base-100 px-5 py-5 rounded-lg shadow-sm">
              <h4 className="text-base uppercase tracking-wide font-semibold">
                Basic Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Product Name */}
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Tag className="w-4 h-4 text-base-content/60" /> Product Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="E.g., Smart Watch"
                    className={`input input-sm input-bordered w-full rounded-lg ${
                      errors.name ? "input-error" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-error text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Tag className="w-4 h-4 text-base-content/60" /> SKU
                    </span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                    placeholder="E.g., PROD-001"
                    className="input input-sm input-bordered w-full rounded-lg"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Layers className="w-4 h-4 text-base-content/60" /> Category
                    </span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    className={`select select-sm select-bordered rounded-lg w-full ${
                      errors.category ? "select-error" : ""
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Accessories</option>
                    <option>Books</option>
                  </select>
                  {errors.category && (
                    <p className="text-error text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                {/* Sub-Category */}
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Layers className="w-4 h-4 text-base-content/60" /> Sub-Category
                    </span>
                  </label>
                  <select
                    name="subCategory"
                    value={form.subCategory}
                    onChange={(e) => setField("subCategory", e.target.value)}
                    className={`select select-sm select-bordered rounded-lg w-full ${
                      errors.subCategory ? "select-error" : ""
                    }`}
                  >
                    <option value="">Select Sub-Category</option>
                    <option>Smartphones</option>
                    <option>Laptops</option>
                    <option>Men's Wear</option>
                    <option>Women's Wear</option>
                    <option>Watches</option>
                  </select>
                  {errors.subCategory && (
                    <p className="text-error text-xs mt-1">{errors.subCategory}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-base-content/60" /> Price
                    </span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="0.00"
                    className={`input input-sm input-bordered w-full rounded-lg ${
                      errors.price ? "input-error" : ""
                    }`}
                  />
                  {errors.price && (
                    <p className="text-error text-xs mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Package className="w-4 h-4 text-base-content/60" /> Quantity
                    </span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    placeholder="0"
                    className={`input input-sm input-bordered w-full rounded-lg ${
                      errors.quantity ? "input-error" : ""
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-error text-xs mt-1">{errors.quantity}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Details Section */}
            <section className="space-y-4 bg-base-100 px-5 py-5 rounded-lg shadow-sm">
              <h4 className="text-base uppercase tracking-wide font-semibold">
                Details
              </h4>

              <div>
                <label className="label text-sm">
                  <span className="label-text flex items-center gap-2">
                    <FileText className="w-4 h-4 text-base-content/60" /> Description
                  </span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Enter product description"
                  className="textarea textarea-sm textarea-bordered w-full rounded-lg"
                  rows={4}
                ></textarea>
              </div>

              <div>
                <label className="label text-sm">
                  <span className="label-text flex items-center gap-2">🎨 Colors</span>
                </label>
                <input
                  type="text"
                  name="colors"
                  value={form.colors}
                  onChange={(e) => setField("colors", e.target.value)}
                  placeholder="Red Blue Green"
                  className="input input-sm input-bordered w-full rounded-lg"
                />
              </div>

              <div>
                <label className="label text-sm">
                  <span className="label-text flex items-center gap-2">📏 Sizes</span>
                </label>
                <input
                  type="text"
                  name="sizes"
                  value={form.sizes}
                  onChange={(e) => setField("sizes", e.target.value)}
                  placeholder="S M L XL"
                  className="input input-sm input-bordered w-full rounded-lg"
                />
              </div>

              <div>
                <label className="label text-sm">
                  <span className="label-text flex items-center gap-2">
                    <Package className="w-4 h-4 text-base-content/60" /> Tags
                  </span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                  placeholder="New Sale Trending"
                  className="input input-sm input-bordered w-full rounded-lg"
                />
              </div>
            </section>

            {/* Images Section */}
            <section className="space-y-4 bg-base-100 px-5 py-5 rounded-lg shadow-sm">
              <h4 className="text-base uppercase tracking-wide font-semibold">Images</h4>
              <div>
                <label className="label text-sm">
                  <span className="label-text flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-base-content/60" /> Upload Images (Max 4)
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input file-input-sm file-input-bordered w-full rounded-lg"
                />
                {imageError && <p className="text-error text-xs mt-2">{imageError}</p>}

                {form.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {form.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative border rounded-lg overflow-hidden group"
                      >
                        <img
                          src={img.preview}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 bg-error text-white rounded-full p-1 opacity-80 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-3 py-3 bg-base-100 px-5 rounded-b-2xl">
            <button type="button" onClick={close} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm flex items-center gap-2 rounded-lg"
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Save Product
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
