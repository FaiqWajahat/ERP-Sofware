function calculateSalaryPeriodMonth(fromDate, toDate) {
  
  const date = new Date(fromDate);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default calculateSalaryPeriodMonth;