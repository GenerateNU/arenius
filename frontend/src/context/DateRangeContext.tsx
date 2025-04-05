"use client";

import { createContext, useContext, useState } from "react";
import { DateRange } from "react-day-picker";

interface DateRangeProviderType {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  formattedDateRange: string;
}

const DateRangeContext = createContext<DateRangeProviderType>(
  {} as DateRangeProviderType
);

export const DateRangeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultStartDate,
    to: defaultEndDate,
  });

  const formattedDateRange = dateRange
    ? dateRange.from?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
      " - " +
      dateRange.to?.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <DateRangeContext.Provider
      value={{ dateRange, setDateRange, formattedDateRange }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = (): DateRangeProviderType => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};
