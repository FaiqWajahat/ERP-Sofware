

'use client'
import React, { useMemo, useRef, useState } from 'react'
import {
  Tag,
  Percent,
  Calendar,
  TicketPercent,
  Layers,
  Hash,
  CircleDollarSign,
  ShoppingCart,
  Grid3x3,
  Wand2,
  Info,
} from 'lucide-react'

// Checkbox-based multi-select component for a better UX than the default <select multiple>
const CheckboxSelect = ({ label, items, value, onChange, icon: Icon }) => (
  <div className="relative">
    <label className="text-sm mb-1 flex items-center gap-1">
      {Icon && <Icon className="w-4 h-4 text-base-content/50" />}
      {label}
    </label>
    <div className="dropdown dropdown-bottom w-full">
      <div tabIndex={0} role="button" className="btn btn-sm btn-outline rounded-lg w-full justify-start text-sm font-normal h-9">
        {value.length > 0 ? `${value.length} selected` : 'Select items...'}
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <label className="label cursor-pointer p-2">
              <span className="label-text">{item.name}</span>
              <input
                type="checkbox"
                checked={value.includes(item.id)}
                onChange={() => {
                  const newValue = value.includes(item.id)
                    ? value.filter((id) => id !== item.id)
                    : [...value, item.id]
                  onChange(newValue)
                }}
                className="checkbox checkbox-primary checkbox-xs"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

export default function AddDiscount({
  onSave,
  categories = [
    { id: 'cat-1', name: 'Clothing' },
    { id: 'cat-2', name: 'Shoes' },
    { id: 'cat-3', name: 'Accessories' },
    { id: 'cat-4', name: 'Electronics' },
    { id: 'cat-5', name: 'Home Goods' },
    { id: 'cat-6', name: 'Books' },
  ],
  products = [
    { id: 'prod-1', name: 'T-shirt' },
    { id: 'prod-2', name: 'Sneakers' },
    { id: 'prod-3', name: 'Backpack' },
    { id: 'prod-4', name: 'Headphones' },
    { id: 'prod-5', name: 'Desk Lamp' },
    { id: 'prod-6', name: 'Novel' },
  ],
  currencySymbol = 'Rs',
}) {
  const modalRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    appliesTo: 'all',
    categories: [],
    products: [],
    usageLimit: '',
    minOrderValue: '',
    startDate: '',
    endDate: '',
    status: 'Active',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const open = () => modalRef.current?.showModal()
  const close = () => modalRef.current?.close()
  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const sanitizeCode = (raw) =>
    raw
      .toUpperCase()
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9_-]/g, '')
      .slice(0, 24)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'code') return setField('code', sanitizeCode(value))
    if (['value', 'usageLimit', 'minOrderValue'].includes(name)) {
      return setField(name, value.replace(/[^\d.]/g, ''))
    }
    setField(name, value)
  }

  const handleMulti = (key, value) => {
    setField(key, value)
  }

  const generateCode = () => {
    const base = form.name.trim().length >= 3 ? form.name.trim() : 'DISCOUNT'
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    setField('code', sanitizeCode(`${base}-${rand}`))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim() || form.name.trim().length < 3) next.name = 'Name must be at least 3 characters.'
    const valueNum = Number(form.value)
    if (Number.isNaN(valueNum) || valueNum <= 0) {
      next.value = 'Enter a positive number.'
    } else if (form.type === 'percentage' && (valueNum <= 0 || valueNum > 100)) {
      next.value = 'Percentage must be between 1 and 100.'
    }
    if (form.appliesTo === 'categories' && form.categories.length === 0) {
      next.categories = 'Select at least one category.'
    }
    if (form.appliesTo === 'products' && form.products.length === 0) {
      next.products = 'Select at least one product.'
    }
    if (form.usageLimit !== '') {
      const u = Number(form.usageLimit)
      if (!Number.isInteger(u) || u < 0) next.usageLimit = 'Usage limit must be a positive integer.'
    }
    if (form.minOrderValue !== '') {
      const m = Number(form.minOrderValue)
      if (Number.isNaN(m) || m < 0) next.minOrderValue = 'Min order must be 0 or more.'
    }
    if (form.startDate && form.endDate) {
      const s = new Date(form.startDate)
      const e = new Date(form.endDate)
      if (s > e) next.endDate = 'End date must be after start date.'
    }
    setErrors(next)
    return next
  }

  const errorCount = useMemo(() => Object.keys(errors).length, [errors])

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length > 0) return

    setSubmitting(true)

    const payload = {
      id: `DISC-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim() || null,
      type: form.type,
      value: Number(form.value),
      appliesTo: form.appliesTo,
      categories: form.appliesTo === 'categories' ? form.categories : [],
      products: form.appliesTo === 'products' ? form.products : [],
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      minOrderValue: form.minOrderValue === '' ? null : Number(form.minOrderValue),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
      automatic: !form.code.trim(),
      createdAt: new Date().toISOString(),
    }

    onSave?.(payload)
    close()
    setForm({
      name: '',
      code: '',
      type: 'percentage',
      value: '',
      appliesTo: 'all',
      categories: [],
      products: [],
      usageLimit: '',
      minOrderValue: '',
      startDate: '',
      endDate: '',
      status: 'Active',
    })
    setErrors({})
    setSubmitting(false)
  }

  const generatedCodePreview = useMemo(() => {
    if (form.code) return form.code
    const base = form.name.trim().length >= 3 ? form.name.trim() : 'DISCOUNT'
    return sanitizeCode(`${base}-XXXX`)
  }, [form.name, form.code])

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={open}
        className="btn btn-primary text-white rounded-lg gap-2 text-sm font-medium shadow-sm"
      >
        <TicketPercent className="w-4 h-4" /> Add Discount
      </button>

      {/* Modal */}
      <dialog ref={modalRef} className="modal w-full modal-middle h-full">
        <div className="modal-box max-w-3xl rounded-2xl p-0 bg-base-200 shadow-xl animate-fadeIn overflow-x-hidden flex flex-col text-sm">
          {/* Header */}
          <div className="px-6 py-4 bg-primary rounded-md shadow-xl w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full">
                <TicketPercent className="w-5 h-5 text-primary-content" />
              </div>
              <div>
                <h3 className="font-bold text-base text-primary-content">Create Discount</h3>
                <p className="text-xs text-primary-content/80">
                  Set up a new discount code or automatic discount for your customers.
                </p>
              </div>
            </div>
            <form method="dialog" className="absolute right-4 top-4 ">
              <button className="btn btn-sm btn-primary btn-circle text-primary-content ">✕</button>
            </form>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-4 py-4 flex-1 space-y-6 overflow-y-scroll overflow-x-hidden">
            {/* Errors */}
            {errorCount > 0 && (
              <div role="alert" className="alert alert-error text-sm">
                <Info className="w-5 h-5" />
                <span className="text-sm">
                  Please fix{' '}
                  <span className="font-bold">{errorCount} field{errorCount > 1 ? 's' : ''}</span>{' '}
                  before saving.
                </span>
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-3 bg-base-100 px-4 py-5 rounded-lg shadow-md">
              <h4 className="text-xs uppercase tracking-wide font-semibold">Basic Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <Tag className="w-4 h-4 text-base-content/60" /> Discount Name
                    </span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="E.g., Summer Sale"
                    className={`input input-sm input-bordered rounded-lg  ${errors.name ? 'input-error' : ''}`}
                  />
                  {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <Hash className="w-4 h-4 text-base-content/60" /> Code
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="Automatic discount"
                      className="input input-sm input-bordered w-full font-mono rounded-lg grow"
                    />
                    <button type="button" onClick={generateCode} className="btn btn-sm btn-ghost btn-circle tooltip tooltip-left" data-tip="Generate Random Code">
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-base-content/50 mt-1">
                    Preview: <span className="font-mono text-xs">{generatedCodePreview}</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Discount Details */}
            <section className="space-y-3 bg-base-100 px-4 py-5 rounded-lg shadow-md">
              <h4 className="text-xs uppercase tracking-wide font-semibold">Discount Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <Percent className="w-4 h-4 text-base-content/60" /> Type
                    </span>
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="select select-sm select-bordered rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <CircleDollarSign className="w-4 h-4 text-base-content/60" /> Value
                    </span>
                  </label>
                  <div className={`input input-sm input-bordered flex items-center gap-2 rounded-lg ${errors.value ? 'input-error' : ''}`}>
                    <input
                      type="number"
                      name="value"
                      value={form.value}
                      onChange={handleChange}
                      placeholder={form.type === 'percentage' ? '10 for 10%' : '500'}
                      className="grow"
                    />
                    <span className="text-xs text-base-content/70 font-semibold">{form.type === 'percentage' ? '%' : currencySymbol}</span>
                  </div>
                  {errors.value && <p className="text-error text-xs mt-1">{errors.value}</p>}
                </div>
              </div>
            </section>

            {/* Eligibility */}
            <section className="space-y-3 bg-base-100 px-4 py-5 rounded-lg shadow-md">
              <h4 className="text-xs uppercase tracking-wide font-semibold">Eligibility</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <Layers className="w-4 h-4 text-base-content/60" /> Applies To
                    </span>
                  </label>
                  <select
                    name="appliesTo"
                    value={form.appliesTo}
                    onChange={handleChange}
                    className="select select-sm select-bordered rounded-lg"
                  >
                    <option value="all">All Products</option>
                    <option value="categories">Specific Categories</option>
                    <option value="products">Specific Products</option>
                  </select>
                </div>

                {(form.appliesTo === 'categories' || form.appliesTo === 'products') && (
                  <div className="form-control">
                    {form.appliesTo === 'categories' ? (
                      <CheckboxSelect
                        label="Categories"
                        items={categories}
                        value={form.categories}
                        onChange={(val) => handleMulti('categories', val)}
                        icon={Grid3x3}
                      />
                    ) : (
                      <CheckboxSelect
                        label="Products"
                        items={products}
                        value={form.products}
                        onChange={(val) => handleMulti('products', val)}
                        icon={ShoppingCart}
                      />
                    )}
                    {errors.categories && <p className="text-error text-xs mt-1">{errors.categories}</p>}
                    {errors.products && <p className="text-error text-xs mt-1">{errors.products}</p>}
                  </div>
                )}
              </div>
            </section>

            {/* Usage & Limits */}
            <section className="space-y-3 bg-base-100 px-4 py-5 rounded-lg shadow-md">
              <h4 className="text-xs uppercase tracking-wide font-semibold">Usage & Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <TicketPercent className="w-4 h-4 text-base-content/60" /> Usage Limit
                      <div className="tooltip tooltip-right" data-tip="The total number of times this discount can be used. Leave blank for unlimited.">
                        <Info className="w-3 h-3 text-base-content/40" />
                      </div>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    className={`input input-sm input-bordered rounded-lg ${errors.usageLimit ? 'input-error' : ''}`}
                  />
                  {errors.usageLimit && <p className="text-error text-xs mt-1">{errors.usageLimit}</p>}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <CircleDollarSign className="w-4 h-4 text-base-content/60" /> Min Order Value
                      <div className="tooltip tooltip-right" data-tip="The minimum order value required to use this discount. Leave blank for no minimum.">
                        <Info className="w-3 h-3 text-base-content/40" />
                      </div>
                    </span>
                  </label>
                  <div className={`input input-sm input-bordered flex items-center gap-2 rounded-lg ${errors.minOrderValue ? 'input-error' : ''}`}>
                    <input
                      type="number"
                      name="minOrderValue"
                      value={form.minOrderValue}
                      onChange={handleChange}
                      placeholder="0"
                      className="grow"
                    />
                    <span className="text-xs text-base-content/70 font-semibold">{currencySymbol}</span>
                  </div>
                  {errors.minOrderValue && <p className="text-error text-xs mt-1">{errors.minOrderValue}</p>}
                </div>
              </div>
            </section>

            {/* Schedule & Status */}
            <section className="space-y-3 bg-base-100 px-4 py-5 rounded-lg shadow-md">
              <h4 className="text-xs uppercase tracking-wide font-semibold">Schedule & Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4 text-base-content/60" /> Start Date
                    </span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="input input-sm input-bordered rounded-lg"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4 text-base-content/60" /> End Date
                    </span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={`input input-sm input-bordered rounded-lg ${errors.endDate ? 'input-error' : ''}`}
                  />
                  {errors.endDate && <p className="text-error text-xs mt-1">{errors.endDate}</p>}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-1 text-sm">
                      <TicketPercent className="w-4 h-4 text-base-content/60" /> Status
                    </span>
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="select select-sm select-bordered rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Footer */}
      
          </form>
                <div className="flex justify-end gap-2 py-3 bg-base-100 px-4 rounded-md">
              <button type="button" onClick={close} className="btn btn-ghost btn-sm text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm flex items-center gap-1 text-sm rounded-lg"
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    <span className="ml-1 text-sm">Saving...</span>
                  </>
                ) : (
                  <>
                    <TicketPercent className="w-4 h-4" /> <span className="ml-1">Save Discount</span>
                  </>
                )}
              </button>
            </div>
        </div>
      </dialog>
    </>
  )
}