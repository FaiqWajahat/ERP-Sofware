"use client";
import React from "react";
import { Search } from "lucide-react";

const DashboardSearch = ({ placeholder, value, onChange }) => {
  return (
    <>
      <label className="input text-sm h-8 flex items-center gap-2">
        <Search stroke="currentColor" className="w-5 h-5" />
        <input 
          type="search" 
          placeholder={placeholder} 
          className="text-sm w-full grow" 
          value={value}
          onChange={onChange}
        />
      </label>
    </>
  );
};

export default DashboardSearch;