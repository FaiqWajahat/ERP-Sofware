"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  Loader,
  Calendar,
 
  FileText,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import DashboardPageHeader from "@/Components/DashboardPageHeader";

import CustomLoader from "@/Components/CustomLoader";
import axios from "axios";
import { errorToast } from "@/lib/toast";

// Utility function for number formatting
const formatCurrency = (amount) =>
  `SAR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;


// Data Table Component
const DataTable = ({ title, data, type }) => {
  const isExpense = type === "expense";
  const colorClass = isExpense ? "text-error" : "text-success";

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
      <div className="p-4 border-b border-base-200 bg-base-50/50">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-base-100   ">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th className="text-right">Amount (SAR)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="font-medium text-xs   ">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="  ">{item.description}</td>
                <td className={`text-right font-bold ${colorClass}`}>
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-base-50/50 border-t border-base-200">
            <tr>
              <td colSpan="2" className="font-semibold   ">
                Total
              </td>
              <td className={`text-right font-bold ${colorClass}`}>
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.amount, 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// Monthly Breakdown Component
const MonthlyBreakdown = ({ expenses, income }) => {
  const getMonthlyData = () => {
    const monthlyMap = {};

    [...expenses, ...income].forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, expenses: 0, income: 0 };
      }

      if (expenses.includes(item)) {
        monthlyMap[monthKey].expenses += item.amount;
      } else {
        monthlyMap[monthKey].income += item.amount;
      }
    });

    return Object.values(monthlyMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  };

  const monthlyData = getMonthlyData();

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
      <div className="p-4 border-b border-base-200 bg-base-50/50">
        <h3 className="font-semibold   ">
          Monthly Financial Breakdown
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-base-100   ">
            <tr>
              <th>Month</th>
              <th className="text-right">Income</th>
              <th className="text-right">Expenses</th>
              <th className="text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((data, index) => {
              const net = data.income - data.expenses;
              return (
                <tr key={index}>
                  <td className="font-medium   ">
                    {new Date(data.month + "-01").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </td>
                  <td className="text-right font-bold text-success">
                    {formatCurrency(data.income)}
                  </td>
                  <td className="text-right font-bold text-error">
                    {formatCurrency(data.expenses)}
                  </td>
                  <td
                    className={`text-right font-bold ${
                      net >= 0 ? "text-[var(--primary-color)]" : "text-warning"
                    }`}
                  >
                    {net >= 0 ? "+" : ""}
                    {formatCurrency(net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Component
export default function ProjectSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const response = await axios.get(`/api/project/${projectId}/get`);
       const success = response.data.success;
        if (!success) {
          errorToast(response.data.message || "Something went wrong");
          setLoading(false);
          router.back();
          return;
        }
        setProject(response.data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
        error("Failed to load project data");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const calculateMetrics = () => {
    if (!project) return null;

    const totalExpenses =
      project.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const totalIncome =
      project.income?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const balance = totalIncome - totalExpenses;
    const budgetUsed = project.estimatedBudget
      ? (totalExpenses / project.estimatedBudget) * 100
      : 0;
    const profitMargin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
    const avgExpense =
      project.expenses?.length > 0
        ? totalExpenses / project.expenses.length
        : 0;
    const avgIncome =
      project.income?.length > 0 ? totalIncome / project.income.length : 0;

    return {
      totalExpenses,
      totalIncome,
      balance,
      budgetUsed,
      profitMargin,
      avgExpense,
      avgIncome,
      expenseCount: project.expenses?.length || 0,
      incomeCount: project.income?.length || 0,
    };
  };

  const exportToExcel = () => {
    if (!project) return;

    setDownloading(true);

    try {
      const metrics = calculateMetrics();

      // Project Summary Sheet
      const summaryData = [
        ["PROJECT FINANCIAL SUMMARY REPORT"],
        [""],
        ["Project Name", project.name],
        ["Client Name", project.clientName],
        ["Location", project.location],
        ["Start Date", new Date(project.startDate).toLocaleDateString()],
        ["Estimated Budget", formatCurrency(project.estimatedBudget || 0)],
        ["Status", `${project.status || "active"}`],
        [""],
        ["FINANCIAL OVERVIEW"],
        ["Total Income", formatCurrency(metrics.totalIncome)],
        ["Total Expenses", formatCurrency(metrics.totalExpenses)],
        ["Net Profit/Loss", formatCurrency(metrics.balance)],
        ["Budget Utilized", `${metrics.budgetUsed.toFixed(2)}%`],
        ["Profit Margin", `${metrics.profitMargin.toFixed(2)}%`],
        [""],
        ["TRANSACTION STATISTICS"],
        ["Total Income Transactions", metrics.incomeCount],
        ["Total Expense Transactions", metrics.expenseCount],
        ["Average Income per Transaction", formatCurrency(metrics.avgIncome)],
        ["Average Expense per Transaction", formatCurrency(metrics.avgExpense)],
      ];

      // Expenses Sheet
      const expensesData = [
        ["Date", "Description", "Amount (SAR)"],
        ...(project.expenses || []).map((e) => [
          new Date(e.date).toLocaleDateString(),
          e.description,
          e.amount,
        ]),
        ["", "TOTAL", metrics.totalExpenses],
      ];

      // Income Sheet
      const incomeData = [
        ["Date", "Description", "Amount (SAR)"],
        ...(project.income || []).map((i) => [
          new Date(i.date).toLocaleDateString(),
          i.description,
          i.amount,
        ]),
        ["", "TOTAL", metrics.totalIncome],
      ];

      // Monthly Breakdown Sheet
      const monthlyMap = {};
      [...(project.expenses || []), ...(project.income || [])].forEach(
        (item) => {
          const date = new Date(item.date);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

          if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { month: monthKey, expenses: 0, income: 0 };
          }

          if ((project.expenses || []).includes(item)) {
            monthlyMap[monthKey].expenses += item.amount;
          } else {
            monthlyMap[monthKey].income += item.amount;
          }
        }
      );

      const monthlyData = [
        ["Month", "Income (SAR)", "Expenses (SAR)", "Net (SAR)"],
        ...Object.values(monthlyMap)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map((data) => [
            new Date(data.month + "-01").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            }),
            data.income,
            data.expenses,
            data.income - data.expenses,
          ]),
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      const wsExpenses = XLSX.utils.aoa_to_sheet(expensesData);
      const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
      const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);

      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
      XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");
      XLSX.utils.book_append_sheet(wb, wsIncome, "Income");
      XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Breakdown");

      // Generate filename
      const filename = `${project.name.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_Financial_Report_${new Date().toISOString().split("T")[0]}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const breadData = [
    { name: "Dashboard", href: "/Dashboard" },
    { name: "Projects", href: "/Dashboard/Projects" },
    {
      name: project?.name || "Project",
      href: `/Dashboard/Projects/${projectId}/Dashboard`,
    },
    { name: "Summary Report", href: "#" },
  ];

  if (loading) {
    return <CustomLoader text={"Loading project summary..."} />;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <button
            onClick={() => router.push("/Dashboard/Projects")}
            className="btn btn-sm bg-[var(--primary-color)] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <>
      <DashboardPageHeader
        breadData={breadData}
        heading="Financial Summary Report"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 box-border mt-10">
        <div className="stats shadow bg-base-100 overflow-x-auto">
          <div className="stat">
            <div className="stat-title text-xs">Total Income</div>
            <div className="stat-value text-2xl text-success">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <div className="stat-desc">{`${metrics.incomeCount} transactions`}</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100 overflow-x-auto">
          <div className="stat">
            <div className="stat-title text-xs">Total Expenses</div>
            <div className="stat-value text-2xl text-error">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <div className="stat-desc ">{`${metrics.expenseCount} transactions`}</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100 overflow-x-auto">
          <div className="stat">
            <div className="stat-title text-xs">Net Profit / Loss</div>
            <div className="stat-value text-2xl text-[var(--primary-color)]">
              {`${metrics.balance >= 0 ? "+" : ""}${formatCurrency(
                metrics.balance
              )}`}
            </div>
            <div className="stat-desc text-danger">{`${metrics.profitMargin.toFixed(
              1
            )}% margin`}</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100 overflow-x-auto">
          <div className="stat">
            <div className="stat-title text-xs">Budget Utalization</div>
            <div
              style={{
                color: metrics.balance >= 0 ? "var(--primary-color)" : "",
              }}
              className="stat-value text-2xl"
            >
              {`${metrics.budgetUsed.toFixed(1)}%`}
            </div>
            <div className="stat-desc text-danger">{`of ${formatCurrency(
              project.estimatedBudget || 0
            )}`}</div>
          </div>
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 mb-6">
        {/* Top: Project Info + Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section — Project Details */}
          <div>
            <h2 className="text-2xl font-bold    mb-2">
              {project.name}
            </h2>

            <div className="flex flex-wrap gap-4 text-sm   ">
              <span className="flex items-center gap-2">
                <FileText size={16} />
                Client: <strong>{project.clientName}</strong>
              </span>

              <span className="flex items-center gap-2">
                <Calendar size={16} />
                Started:{" "}
                <strong>
                  {new Date(project.startDate).toLocaleDateString()}
                </strong>
              </span>
            </div>
          </div>

          {/* Right Section — Buttons */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end lg:items-start gap-3">
            <button
              onClick={() => router.back()}
              className="btn btn-sm btn-ghost w-full sm:w-auto"
            >
              <ArrowLeft size={16} />
              Back 
            </button>

            <button
              onClick={exportToExcel}
              disabled={downloading}
              className="btn btn-sm bg-[var(--primary-color)] text-white border-none hover:brightness-110 shadow-sm w-full sm:w-auto"
            >
              {downloading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download Excel Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

     
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-5">
          <h4 className="font-semibold    mb-4">
            Transaction Averages
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm   ">Average Income</span>
              <span className="font-bold text-success">
                {formatCurrency(metrics.avgIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm   ">Average Expense</span>
              <span className="font-bold text-error">
                {formatCurrency(metrics.avgExpense)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-5">
          <h4 className="font-semibold    mb-4">Project Status</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm   ">Progress</span>
              <span className="font-bold text-[var(--primary-color)]">
                {project.status === "active" ? 50 : 100}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={project.status === "active" ? 50 : 100}
              max="100"
            ></progress>
            <div className="flex justify-between items-center">
              <span className="text-sm   ">Status</span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  project.status === "active"
                    ? "text-primary"
                    : project.status === "completed"
                    ? "text-success"
                    : "  "
                }`}
              >
                {project.status === "active" ? (
                  <Loader size={16} className="animate-spin" />
                ) : project.status === "completed" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}

                {project.status === "active"
                  ? "Active"
                  : project.status === "completed"
                  ? "Completed"
                  : project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="mb-6">
        <MonthlyBreakdown
          expenses={project.expenses || []}
          income={project.income || []}
        />
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Income Records"
          data={(project.income || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )}
          type="income"
        />
        <DataTable
          title="Expense Records"
          data={(project.expenses || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )}
          type="expense"
        />
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-base-200 rounded-lg text-center text-sm   ">
        Report generated on {new Date().toLocaleDateString()} at{" "}
        {new Date().toLocaleTimeString()}
      </div>
    </>
  );
}
