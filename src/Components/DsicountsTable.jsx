import { Edit, Trash } from 'lucide-react'
import React from 'react'

const DsicountsTable = ({discounts}) => {
  return (
  <>
     <table className="table w-full table-md">
        {/* Table Head */}
        <thead className="text-sm font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Applies To</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {discounts.map((disc) => (
            <tr key={disc.id} className="hover:bg-base-200/40 transition">
              <td className="font-medium whitespace-nowrap">{disc.id}</td>
              <td>{disc.code}</td>
              <td className="capitalize">{disc.type}</td>
              <td>
                {disc.type === "percentage"
                  ? `${disc.value}%`
                  : `$${disc.value}`}
              </td>
              <td className="capitalize">{disc.appliesTo}</td>
              <td>{disc.startDate}</td>
              <td>{disc.endDate}</td>
              <td>
                <span
                  className={`${
                    disc.status === "Active" ? "text-success" : "text-error"
                  }`}
                >
                  {disc.status}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <button className="btn btn-ghost btn-circle btn-xs hover:bg-base-300 p-1">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="btn btn-ghost btn-circle btn-xs hover:bg-base-300 hover:text-error p-1">
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  </>
  )
}

export default DsicountsTable