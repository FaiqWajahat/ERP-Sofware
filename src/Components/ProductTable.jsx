"use client";

import { Edit, Trash, Star } from "lucide-react";
import Image from "next/image";



export default function ProductsTable({ products  }) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full table-md">
        {/* head */}
        <thead className="text-xs font-semibold text-base-content/70 bg-base-200 uppercase tracking-wide">
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Ratings</th>
            <th>Orders</th>
            <th>Stock</th>
            <th className="hidden md:table-cell">Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => (
            <tr key={idx} className="hover:bg-base-200/40 transition">
              {/* Product ID */}
              <td className="font-medium whitespace-nowrap">{product.id}</td>

              {/* Product (Image + Name) */}
              <td>
                <div className="flex items-center gap-3">
                 <div className="avatar">
                                       <div className="w-10 h-10 rounded-lg overflow-hidden ring ring-base-300 ring-offset-base-100 ring-offset-2">
                                         <Image
                                           src={product.image}
                                           alt={product.name}
                                           width={50}
                                           height={50}
                                           className="object-cover"
                                         />
                                       </div>
                                     </div>
                  <div className="flex h-full flex-col">
                    <div>
                      <h3 className="font-medium text-xs ">{product.name || product.title}</h3>
                      <div>
                        {product.inStock || product.stock > 0 ? (
                          <span className="text-success text-xs">In Stock</span>
                        ) : (
                          <span className="text-error text-xs">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="flex flex-col gap-1">
                <div className="text-xs font-medium">
                  <h5> {product.category} </h5>
                </div>
                <div className="text-gray-400 text-xs">
                  <span>
 
                      {product.subCategory}
                  
                  </span>
                 
                </div>
              </td>

              {/* Price */}
              <td className=" ">
                ${typeof product.price === 'number' 
                  ? product.price.toFixed(2) 
                  : parseFloat(product.price || 0).toFixed(2)}
              </td>

              {/* Ratings */}
              <td>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">
                    {product.rating || product.ratings || '0.0'}
                  </span>
                  {product.reviewCount && (
                    <span className="text-xs text-base-content/60">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              </td>

              {/* Orders */}
              <td className="font-medium">
                {product.orders || product.orderCount || 0}
              </td>

              {/* Stock */}
              <td>
                <div className="flex items-center gap-1">
                  <span className={`font-medium ${
                    (product.stock || 0) <= 5 
                      ? 'text-error' 
                      : (product.stock || 0) <= 20 
                      ? 'text-warning' 
                      : 'text-success'
                  }`}>
                    {product.stock || 0}
                  </span>
                  {(product.stock || 0) <= 5 && (
                    <span className="badge badge-error  badge-xs">Low</span>
                  )}
                </div>
              </td>

              {/* Created At */}
              <td className="hidden md:table-cell text-sm">
                {product.createdAt || product.joinedAt || 'N/A'}
              </td>

              {/* Actions */}
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
    </div>
  );
}

