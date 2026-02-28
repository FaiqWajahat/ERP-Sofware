'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from "lucide-react";

const CustomDropdown = ({ 
  value, 
  setValue, 
  dropdownMenu = [], 
  placeholder = "Select Option",
  className = "" 
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (item) => {
    setValue(item);
    setOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          group flex items-center justify-between w-full md:min-w-[180px] px-4 py-2.5 text-sm font-medium 
          bg-base-100 border rounded-sm transition-all duration-200 ease-in-out cursor-pointer
          ${open 
            ? 'border-[var(--primary-color)] ring-1 ring-[var(--primary-color)] shadow-sm' 
            : 'border-base-300 hover:border-base-content/30'
          }
        `}
      >
        <span className={`truncate ${!value ? 'text-base-content/50' : 'text-base-content'}`}>
          {value || placeholder}
        </span>
        
        <ChevronDown 
          className={`
            w-4 h-4 ml-2 text-base-content/50 transition-transform duration-200
            ${open ? 'rotate-180 text-[var(--primary-color)]' : ''}
            group-hover:text-base-content/80
          `}
        />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`
          absolute right-0 left-0 mt-2 origin-top-right bg-base-100 
          border border-base-200 rounded-sm shadow-xl z-50 overflow-hidden
          transition-all duration-200 ease-out transform
          ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        <ul className="py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
          {dropdownMenu && dropdownMenu.length > 0 ? (
            dropdownMenu.map((item, index) => {
              const isSelected = value === item;
              return (
                <li
                  key={index}
                  onClick={() => handleSelect(item)}
                  className={`
                    relative px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150
                    flex items-center justify-between
                    ${isSelected 
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium' 
                      : 'text-base-content hover:bg-base-200'
                    }
                  `}
                >
                  <span className="truncate mr-2">{item}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </li>
              );
            })
          ) : (
            <li className="px-4 py-3 text-sm text-base-content/40 text-center italic">
              No options available
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default CustomDropdown;