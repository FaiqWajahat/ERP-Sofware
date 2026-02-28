"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import Axios
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import CustomDropdown from "@/Components/CustomDropdown";
import { CalendarCheck, Loader2 } from "lucide-react";
import CustomLoader from "@/Components/CustomLoader";

export default function AttendanceDashboard() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // State for API Data
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- API FETCHING LOGIC ---
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/attendance/stats", {
          params: { year: selectedYear },
        });
        
        if (response.data.success) {
          setFetchedData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setFetchedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear]);

  // --- CALCULATIONS ---
  const yearlyTotals = useMemo(() => {
    // Use fetchedData instead of the hardcoded object
    return fetchedData.reduce(
      (acc, month) => ({
        present: acc.present + month.present,
        absent: acc.absent + month.absent,
        leave: acc.leave + month.leave,
      }),
      { present: 0, absent: 0, leave: 0 }
    );
  }, [fetchedData]);

  const attendancePercentage = useMemo(() => {
    const total =
      yearlyTotals.present + yearlyTotals.absent + yearlyTotals.leave;
    if (total === 0) return 0;
    return ((yearlyTotals.present / total) * 100).toFixed(1);
  }, [yearlyTotals]);

  const handleMarkAttendance = () => {
    router.push("/Dashboard/Attendance/Mark");
  };

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Attendance", href: "/Dashboard/Attendance" },
  ];

  const hasData = fetchedData.length > 0;

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Attendance" />

      <div className="w-full space-y-6">
        {/* Control Bar */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4">
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <label className="font-medium text-sm mr-2">Year:</label>
                <CustomDropdown
                  value={selectedYear}
                  setValue={setSelectedYear}
                  dropdownMenu={years}
                />
              </div>
              <button
                onClick={handleMarkAttendance}
                className="btn bg-[var(--primary-color)] rounded-sm text-white btn-sm"
              >
                <CalendarCheck className="w-4 h-4 mr-1" />
                Mark Attendance
              </button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
           <CustomLoader/>
          </div>
        ) : hasData ? (
          <>
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stats shadow bg-base-100 border border-base-200">
                <div className="stat">
                  <div className="stat-title text-xs">Total Records</div>
                  <div className="stat-value text-2xl">
                    {yearlyTotals.present +
                      yearlyTotals.absent +
                      yearlyTotals.leave}
                  </div>
                  <div className="stat-desc">{selectedYear}</div>
                </div>
              </div>

              <div className="stats shadow bg-base-100 border border-base-200">
                <div className="stat">
                  <div className="stat-title text-xs">Present Days</div>
                  <div className="stat-value text-2xl text-success">
                    {yearlyTotals.present}
                  </div>
                  <div className="stat-desc text-success">Attended</div>
                </div>
              </div>

              <div className="stats shadow bg-base-100 border border-base-200">
                <div className="stat">
                  <div className="stat-title text-xs">Absent Days</div>
                  <div className="stat-value text-2xl text-error">
                    {yearlyTotals.absent}
                  </div>
                  <div className="stat-desc text-error">Not attended</div>
                </div>
              </div>

              <div className="stats shadow bg-base-100 border border-base-200">
                <div className="stat">
                  <div className="stat-title text-xs">Attendance Rate</div>
                  <div className="stat-value text-2xl text-[var(--primary-color)]">
                    {attendancePercentage}%
                  </div>
                  <div className="stat-desc text-[var(--primary-color)]">
                    Overall performance
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body">
                <h2 className="font-semibold text-base mb-4">
                  Monthly Summary
                </h2>

                <div className="overflow-x-auto">
                  <table className="table table-md">
                    <thead className="bg-base-200">
                      <tr>
                        <th className="text-xs font-semibold uppercase">
                          Month
                        </th>
                        <th className="text-xs font-semibold uppercase">
                          Present
                        </th>
                        <th className="text-xs font-semibold uppercase">
                          Absent
                        </th>
                        <th className="text-xs font-semibold uppercase">
                          Leave
                        </th>
                        <th className="text-xs font-semibold uppercase">
                          Total
                        </th>
                        <th className="text-xs font-semibold uppercase">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchedData.map((month, index) => {
                        const total =
                          month.present + month.absent + month.leave;
                        const rate =
                          total > 0
                            ? ((month.present / total) * 100).toFixed(0)
                            : 0;

                        return (
                          <tr
                            key={index}
                            className="hover:bg-base-200 cursor-pointer"
                            onClick={() => {
                              router.push(
                                "/Dashboard/Attendance/Month/" +
                                  selectedYear +
                                  "/" +
                                  month.month
                              );
                            }}
                          >
                            <td>
                              <span className="font-medium">{month.month}</span>
                            </td>
                            <td className="">
                              <span className="font-semibold text-success">
                                {month.present}
                              </span>
                            </td>
                            <td className="">
                              <span className="font-semibold text-error">
                                {month.absent}
                              </span>
                            </td>
                            <td className="">
                              <span className="font-semibold text-warning">
                                {month.leave}
                              </span>
                            </td>
                            <td className="">
                              <span className="font-medium">{total}</span>
                            </td>
                            <td className="">
                              <div className="text-[var(--primary-color)] font-medium">
                                {rate}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body">
                  <h3 className="card-title text-sm">Leave Summary</h3>
                  <div className="stat-value text-3xl text-warning mt-2">
                    {yearlyTotals.leave}
                  </div>
                  <p className="text-sm text-base-content/70 mt-2">
                    Total leave days taken in {selectedYear}
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body">
                  <h3 className="card-title text-sm">Performance Status</h3>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Attendance Goal
                      </span>
                      <span className="text-sm font-semibold">
                        {attendancePercentage}% / 90%
                      </span>
                    </div>
                    <progress
                      className="progress progress-accent w-full"
                      value={attendancePercentage}
                      max="100"
                    ></progress>
                    <p className="text-xs text-base-content/70 mt-2">
                      {parseFloat(attendancePercentage) >= 90
                        ? "Excellent attendance record!"
                        : `${(90 - parseFloat(attendancePercentage)).toFixed(
                            1
                          )}% more to reach goal`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body items-center text-center py-16">
              <div className="bg-base-200 rounded-full p-6 mb-4">
                <svg
                  className="w-12 h-12 text-base-content/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="card-title text-lg">No Data Available</h3>
              <p className="text-base-content/70 mb-6">
                No attendance records found for {selectedYear}
              </p>
              <button
                onClick={handleMarkAttendance}
                className="btn btn-warning btn-sm"
              >
                Start Marking Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}