'use client'
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// --- Configuration ---
const primaryColor = "#aea488"; 

// UPDATED: Uses your new global CSS variables for dynamic theming
const tooltipStyle = {
  backgroundColor: 'var(--tooltip-bg)', 
  borderColor: 'var(--tooltip-border)',
  color: 'var(--tooltip-text)', // Ensures text matches theme (optional but recommended)
  borderRadius: '6px',
  borderWidth: '1px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
};

export default function AttendanceChart() {
  const [view, setView] = useState("month"); // 'month' or 'year'
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/chart?view=${view}`);
        const result = await res.json();
        if (result.success) {
          setChartData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch chart data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [view]);

  return (
    <div className="w-full max-w-full mx-auto rounded-xl shadow-lg p-4 lg:p-6 bg-base-100 text-base-content text-sm transition-colors duration-300">
      
      {/* Header + Switch */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold">
            {view === "month" ? "Daily Attendance" : "Monthly Man-Days"}
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            {view === "month" ? "Headcount per day" : "Total days worked per month"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-base-300 rounded-full p-1">
          <button
            onClick={() => setView("month")}
            className={`px-4 py-1 rounded-full font-semibold text-sm transition-all 
              ${view === 'month' ? 'text-white' : 'text-base-content'}`}
            style={view === 'month' ? { backgroundColor: primaryColor } : {}}
          >
            Month
          </button>

          <button
            onClick={() => setView("year")}
            className={`px-4 py-1 rounded-full font-semibold text-sm transition-all 
              ${view === 'year' ? 'text-white' : 'text-base-content'}`}
            style={view === 'year' ? { backgroundColor: primaryColor } : {}}
          >
            Year
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[340px] w-full">
        {loading ? (
           // --- SKELETON LOADER ---
           <div className="w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-2 pb-6 animate-pulse">
             {[...Array(view === 'month' ? 15 : 12)].map((_, i) => (
               <div 
                 key={i} 
                 className="w-full bg-base-300/70 rounded-t-md"
                 style={{ 
                   height: `${((i * 37) % 60) + 20}%` 
                 }}
               ></div>
             ))}
           </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="name"
                stroke="currentColor" 
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={view === 'month' ? 1 : 0} 
              />

              <YAxis
                stroke="currentColor"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip
                cursor={{ fill: primaryColor, opacity: 0.1 }} // Subtle highlight
                contentStyle={tooltipStyle}
                itemStyle={{ color: primaryColor, fontWeight: 600 }}
                formatter={(value) => [value, "Present"]}
              />

              <Bar
                dataKey="present"
                fill={primaryColor}
                radius={[6, 6, 0, 0]}
                barSize={view === 'month' ? 12 : 32} 
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}