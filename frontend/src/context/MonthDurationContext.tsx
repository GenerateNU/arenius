"use client";

import { Month } from "date-fns";
import { createContext, useContext, useState } from "react";

interface MonthDurationProviderType {
    monthDuration: number;
    setMonthDuration: (monthDuration: number) => void;
}

const MonthDurationContext = createContext<MonthDurationProviderType>({} as MonthDurationProviderType);

export const MonthDurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [monthDuration, setMonthDuration] = useState<number>(12)

    return (
        <MonthDurationContext.Provider value={{ monthDuration, setMonthDuration }}>
        {children}
        </MonthDurationContext.Provider>
    );
}

export const useMonthDuration = (): MonthDurationProviderType => {
  const context = useContext(MonthDurationContext);
  if (!context) {
    throw new Error("useMonthDuration must be used within an MonthDurationContext");
  }
  return context;
};