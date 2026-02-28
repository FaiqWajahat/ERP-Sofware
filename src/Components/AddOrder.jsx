"use client";
import React, { useState, useMemo, useRef } from "react";
import {
  ShoppingCart,
  User,
  Package,
  DollarSign,
  Calendar,
  Info,
  Tag,
} from "lucide-react";

export default function AddOrder({ onSave }) {
  const modalRef = useRef(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "",
    productSKU: "",
    quantity: "",
    price: "",
    orderDate: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const open = () => modalRef.current?.showModal();
  const close = () => modalRef.current?.close();
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const validate = () => {
    const next = {};
    if (!form.customerName.trim()) next.customerName = "Customer name is required.";
    if (!form.customerEmail.trim()) next.customerEmail = "Customer email is required.";
    if (!form.productName.trim()) next.productName = "Product name is required.";
    if (!form.productSKU.trim()) next.productSKU = "Product SKU is required.";
    if (!form.quantity || Number(form.quantity) <= 0) next.quantity = "Enter valid quantity.";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter valid price.";
    if (!form.orderDate) next.orderDate = "Select an order date.";
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
      id: `ORD-${Date.now()}`,
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone.trim(),
      productName: form.productName.trim(),
      productSKU: form.productSKU.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      orderDate: form.orderDate,
      status: form.status,
      createdAt: new Date().toISOString(),
    };

    onSave?.(payload);
    close();

    setForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      productName: "",
      productSKU: "",
      quantity: "",
      price: "",
      orderDate: "",
      status: "Pending",
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
        <ShoppingCart className="w-5 h-5" /> Add Order
      </button>

      {/* Modal */}
      <dialog ref={modalRef} className="modal modal-middle w-full h-full">
        <div className="modal-box text-sm max-w-3xl rounded-2xl p-0 bg-base-200 shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-primary rounded-t-2xl shadow-md relative">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-primary-content" />
              <div>
                <h3 className="font-bold text-xl text-primary-content">
                  Add New Order
                </h3>
                <p className="text-sm text-primary-content/80">
                  Fill in the order details.
                </p>
              </div>
            </div>
            <form method="dialog" className="absolute right-4 top-4">
              <button className="btn btn-sm btn-primary btn-circle text-primary-content text-lg">
                ✕
              </button>
            </form>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-5 py-5 flex-1 space-y-8 text-sm overflow-y-auto"
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

            {/* Customer Info */}
            <section className="space-y-5 bg-base-100 px-5 py-6 rounded-lg shadow-sm">
              <h4 className="text-base uppercase tracking-wide font-semibold text-base-content/80">
                Customer Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <User className="w-5 h-5 text-base-content/60" /> Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={(e) => setField("customerName", e.target.value)}
                    placeholder="John Doe"
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.customerName ? "input-error" : ""
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-error text-sm mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">📧 Email</span>
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={form.customerEmail}
                    onChange={(e) => setField("customerEmail", e.target.value)}
                    placeholder="john@example.com"
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.customerEmail ? "input-error" : ""
                    }`}
                  />
                  {errors.customerEmail && (
                    <p className="text-error text-sm mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">📞 Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={(e) => setField("customerPhone", e.target.value)}
                    placeholder="+92 300 1234567"
                    className="input input-bordered input-sm w-full rounded-lg"
                  />
                </div>
              </div>
            </section>

            {/* Product Info */}
            <section className="space-y-5 bg-base-100 px-5 py-6 rounded-lg shadow-sm">
              <h4 className="text-base uppercase tracking-wide font-semibold text-base-content/80">
                Product Info
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Package className="w-5 h-5 text-base-content/60" /> Product Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={(e) => setField("productName", e.target.value)}
                    placeholder="Smart Watch"
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.productName ? "input-error" : ""
                    }`}
                  />
                  {errors.productName && (
                    <p className="text-error text-sm mt-1">{errors.productName}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Tag className="w-5 h-5 text-base-content/60" /> SKU
                    </span>
                  </label>
                  <input
                    type="text"
                    name="productSKU"
                    value={form.productSKU}
                    onChange={(e) => setField("productSKU", e.target.value)}
                    placeholder="PROD-001"
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.productSKU ? "input-error" : ""
                    }`}
                  />
                  {errors.productSKU && (
                    <p className="text-error text-sm mt-1">{errors.productSKU}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Package className="w-5 h-5 text-base-content/60" /> Quantity
                    </span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    placeholder="1"
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.quantity ? "input-error" : ""
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-error text-sm mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-base-content/60" /> Price
                    </span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="0.00"
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.price ? "input-error" : ""
                    }`}
                  />
                  {errors.price && (
                    <p className="text-error text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-base-content/60" /> Order Date
                    </span>
                  </label>
                  <input
                    type="date"
                    name="orderDate"
                    value={form.orderDate}
                    onChange={(e) => setField("orderDate", e.target.value)}
                    className={`input input-bordered input-sm w-full rounded-lg ${
                      errors.orderDate ? "input-error" : ""
                    }`}
                  />
                  {errors.orderDate && (
                    <p className="text-error text-sm mt-1">{errors.orderDate}</p>
                  )}
                </div>

                <div>
                  <label className="label text-sm">
                    <span className="label-text flex items-center gap-2">Status</span>
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                    className="select select-bordered select-sm w-full rounded-lg"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </div>
              </div>
            </section>
          </form>

          {/* Footer */}
          <div className="flex justify-end gap-3 py-4 bg-base-100 px-5 rounded-b-2xl text-sm">
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
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Save Order
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
