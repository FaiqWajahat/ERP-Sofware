"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import DashboardPageHeader from "@/Components/DashboardPageHeader";
import { ArrowLeft, Calendar, X, Loader2, AlertCircle } from "lucide-react";
import DashboardSearch from "@/Components/DashboardSearch";
import CustomDropdown from "@/Components/CustomDropdown";
import CustomLoader from "@/Components/CustomLoader";
import Avatar from "@/Components/Avatar";

const statusOptions = ["All", "Present", "Absent", "Leave"];

export default function MonthAttendancePage() {
  const params = useParams();
  const { year, month } = params;

  // Data State
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // --- 1. Fetch Real Data ---
  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/attendance/month", {
          params: { year, month },
        });

        if (response.data.success) {
          setAttendance(response.data.records || []);
        }
      } catch (err) {
        console.error("Error loading month data:", err);
        setError("Failed to load attendance records.");
      } finally {
        setLoading(false);
      }
    };

    if (year && month) {
      fetchMonthData();
    }
  }, [year, month]);

  // --- 2. Robust Search Handler (Fixes the crash) ---
  const handleSearchChange = (e) => {
    // If your DashboardSearch returns an event, extract value.
    // If it returns a string directly, use it.
    const value = e?.target ? e.target.value : e;
    setSearch(value);
  };

  // --- 3. Filter Logic (Using useMemo for performance & stability) ---
  const filteredAttendance = useMemo(() => {
    return attendance.filter((rec) => {
      // Safety Check: Ensure fields exist before calling toLowerCase()
      const nameMatch = (rec.employeeName || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      // Check both 'iqama' (backend field) and 'iqamaNumber' (possible frontend variation)
      const iqamaStr = (rec.iqama || rec.iqamaNumber || "").toString();
      const iqamaMatch = iqamaStr.includes(search);

      const matchesSearch = nameMatch || iqamaMatch;

      const matchesStatus =
        statusFilter === "All" || rec.status === statusFilter;

      const matchesDate = !dateFilter || rec.date.startsWith(dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [attendance, search, statusFilter, dateFilter]);

  // --- 4. Statistics Calculation ---
  const stats = useMemo(
    () => ({
      total: attendance.length,
      present: attendance.filter((r) => r.status === "Present").length,
      absent: attendance.filter((r) => r.status === "Absent").length,
      leave: attendance.filter((r) => r.status === "Leave").length,
    }),
    [attendance]
  );

  const attendancePercentage =
    stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  // Generate days for the date filter
  const getDaysInMonth = () => {
    try {
      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const days = new Date(year, monthIndex + 1, 0).getDate();

      return [
        "All Days",
        ...Array.from({ length: days }, (_, i) => {
          const day = (i + 1).toString().padStart(2, "0");
          const m = (monthIndex + 1).toString().padStart(2, "0");
          return `${year}-${m}-${day}`;
        }),
      ];
    } catch (e) {
      return ["All Days"];
    }
  };

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Attendance", href: "/Dashboard/Attendance" },
    {
      name: `${month} ${year}`,
      href: `/Dashboard/Attendance/Month/${year}/${month}`,
    },
  ];

  const clearFilters = () => {
    setDateFilter("");
    setStatusFilter("All");
    setSearch("");
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-error" />
        <h3 className="font-semibold text-lg">{error}</h3>
        <Link href="/Dashboard/Attendance" className="btn btn-sm btn-outline">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <>
      <DashboardPageHeader breadData={breadData} heading="Attendance Details" />

      <div className="w-full space-y-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat">
              <div className="stat-title text-xs">Total Records</div>
              <div className="stat-value text-2xl">{stats.total}</div>
              <div className="stat-desc">
                {month} {year}
              </div>
            </div>
          </div>

          <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat">
              <div className="stat-title text-xs">Present Days</div>
              <div className="stat-value text-2xl text-success">
                {stats.present}
              </div>
              <div className="stat-desc text-success">Attended</div>
            </div>
          </div>

          <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat">
              <div className="stat-title text-xs">Absent Days</div>
              <div className="stat-value text-2xl text-error">
                {stats.absent}
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

        {/* Main Content Card */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-base mb-1">
                  {month} {year} Records
                </h2>
                <p className="text-base-content/70 text-xs">
                  Detailed daily attendance logs
                </p>
              </div>
              <Link
                href="/Dashboard/Attendance"
                className="btn btn-ghost rounded-sm btn-sm gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
              <div className="w-full lg:w-auto">
                <DashboardSearch
                  placeholder={"Search Name or Iqama..."}
                  value={search}
                  // --- FIX APPLIED HERE ---
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex items-center gap-4 mx-auto md:mx-0 w-full lg:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <label className="font-medium text-sm whitespace-nowrap hidden sm:block">
                    Day:
                  </label>
                  <CustomDropdown
                    value={dateFilter || "All Days"}
                    setValue={(value) =>
                      setDateFilter(value === "All Days" ? "" : value)
                    }
                    dropdownMenu={getDaysInMonth()}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-medium text-sm whitespace-nowrap hidden sm:block">
                    Status:
                  </label>
                  <CustomDropdown
                    value={statusFilter}
                    setValue={setStatusFilter}
                    dropdownMenu={statusOptions}
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(dateFilter || statusFilter !== "All" || search) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-base-200 rounded-lg">
                <span className="text-sm font-medium">Filters:</span>

                {search && (
                  <div className="badge badge-neutral gap-2">
                    Search: {search}
                    <button
                      onClick={() => setSearch("")}
                      className="hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {dateFilter && (
                  <div className="badge badge-primary gap-2">
                    Day: {new Date(dateFilter).getDate()}
                    <button
                      onClick={() => setDateFilter("")}
                      className="hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {statusFilter !== "All" && (
                  <div className="badge badge-secondary gap-2">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("All")}
                      className="hover:text-error"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <button
                  onClick={clearFilters}
                  className="text-xs text-error hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table table-md">
                <thead className="bg-base-200/50">
                  <tr>
                    <th className="text-xs font-semibold uppercase">
                      Employee
                    </th>
                    <th className="text-xs font-semibold uppercase">
                      Iqama Number
                    </th>
                    <th className="text-xs font-semibold uppercase">Date</th>
                    <th className="text-xs font-semibold uppercase">Status</th>
                    <th className="text-xs font-semibold uppercase">Project</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-base-200 rounded-full p-6">
                            <Calendar className="w-10 h-10 text-base-content/40" />
                          </div>
                          <h3 className="font-semibold text-base">
                            No Records Found
                          </h3>
                          <p className="text-sm text-base-content/70">
                            No attendance records found for the selected filters
                          </p>
                          <button
                            onClick={clearFilters}
                            className="btn btn-sm btn-link"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec, index) => (
                      <tr key={index} className="hover:bg-base-200">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <Avatar name={rec.employeeName } size="md" />
                            </div>

                            <span className="font-medium text-sm">
                              {rec.employeeName || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-sm whitespace-nowrap opacity-80">
                            {rec.iqama || rec.iqamaNumber || "-"}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm whitespace-nowrap">
                            {new Date(rec.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </td>
                        <td>
                          {rec.status === "Present" && (
                            <div className="badge badge-success badge-sm gap-1 text-xs">
                              Present
                            </div>
                          )}
                          {rec.status === "Absent" && (
                            <div className="badge badge-error badge-sm gap-1 text-xs">
                              Absent
                            </div>
                          )}
                          {rec.status === "Leave" && (
                            <div className="badge badge-warning badge-sm gap-1 text-xs">
                              Leave
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="text-xs opacity-70">
                            {rec.projectName || "No Project"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
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
              <div className="flex items-center gap-4 mt-2">
                <div className="stat-value text-3xl text-warning">
                  {stats.leave}
                </div>
                <div className="text-sm text-base-content/70">
                  Total leave days
                  <br /> in {month}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h3 className="card-title text-sm">Monthly Goal</h3>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Target: 90%</span>
                  <span className="text-sm font-semibold">
                    {attendancePercentage}%
                  </span>
                </div>
                <progress
                  className="progress progress-accent w-full"
                  value={attendancePercentage}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
