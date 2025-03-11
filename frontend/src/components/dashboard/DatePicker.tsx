"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMonthDuration } from "@/context/MonthDurationContext";
import { ChevronDown } from "lucide-react";

export function DatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { monthDuration, setMonthDuration } = useMonthDuration();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 3);

    setDateRange({ from: startDate, to: today });
    setMounted(true);
  }, []);

  const updateMonthDuration = (newRange: DateRange | undefined) => {
    // TODO: this is broken!
    // TODO: change the endpoint to take a date range
    if (newRange?.from && newRange?.to) {
        const monthsDiff = 
            (newRange.to.getFullYear() - newRange.from.getFullYear()) * 12 +
            (newRange.to.getMonth() - newRange.from.getMonth()) +
            (newRange.to.getDate() >= newRange.from.getDate() ? 1 : 0);

      setMonthDuration(monthsDiff < 1 ? 3 : monthsDiff);
    } else {
      setMonthDuration(3); // default to 3 months
    }
  };

  const handleDateChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
    updateMonthDuration(newRange);
  };

  if (!mounted) return null;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant={"ghost"}>
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>All dates</span>
            )}
            <ChevronDown className={styles.chevronDown} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-gray-200 shadow-lg rounded-lg"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const styles = {
  chevronDown: "h-4 w-4 opacity-50",
};
