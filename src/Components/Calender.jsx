import React, { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startDay = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
  const totalDays = endOfMonth.date();

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  // Fill empty slots before first day
  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col min-h-96  h-full p-4 bg-base-100 rounded-xl text-sm shadow-xl  mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-ghost btn-circle" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-lg md:text-md font-semibold">
          {currentDate.format("MMMM YYYY")}
        </span>
        <button className="btn btn-ghost btn-circle" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-500">
        {weekdays.map((day) => (
          <div key={day} className="py-1 md:py-2 text-sm md:text-base">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mt-6 flex-1 overflow-y-auto">
        {calendarDays.map((day, i) => {
          const isToday =
            day === dayjs().date() &&
            currentDate.month() === dayjs().month() &&
            currentDate.year() === dayjs().year();
          const isSelected =
            day === selectedDate.date() &&
            currentDate.month() === selectedDate.month() &&
            currentDate.year() === selectedDate.year();

          return (
            <div
              key={i}
              onClick={() =>
                day && setSelectedDate(currentDate.date(day))
              }
              className={`flex sm-py-0 md-py-2 lg-py-0 justify-center items-center cursor-pointer transition-colors duration-200 rounded-md   text-sm md:text-base ${
                isSelected
                  ? "bg-[var(--primary-color)] text-white"
                  : isToday
                  ? "bg-[var(--primary-color)]/30 text-[var(--primary-color)] font-semibold"
                  : "hover:bg-base-300"
              }`}
            >
              {day || ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;

