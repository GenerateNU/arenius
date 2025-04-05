"use client";

import * as React from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDateRange } from "@/context/DateRangeContext";
import { CalendarIcon } from "lucide-react";

const quickSelectOptions = [
  {
    label: "All time",
    getRange: () => {
      const today = new Date();
      return { from: new Date(2000, 1, 1), to: today };
    },
  },
  {
    label: "This Week",
    getRange: () => {
      const today = new Date();
      return { from: startOfWeek(today), to: endOfWeek(today) };
    },
  },
  {
    label: "Quarter 1",
    getRange: () => {
      const year = new Date().getFullYear();
      return {
        from: new Date(year, 0, 1), // Jan 1
        to: new Date(year, 2, 31), // Mar 31
      };
    },
  },
  {
    label: "Quarter 2",
    getRange: () => {
      const year = new Date().getFullYear();
      return {
        from: new Date(year, 3, 1), // Apr 1
        to: new Date(year, 5, 30), // Jun 30
      };
    },
  },
  {
    label: "Quarter 3",
    getRange: () => {
      const year = new Date().getFullYear();
      return {
        from: new Date(year, 6, 1), // Jul 1
        to: new Date(year, 8, 30), // Sep 30
      };
    },
  },
  {
    label: "Quarter 4",
    getRange: () => {
      const year = new Date().getFullYear();
      return {
        from: new Date(year, 9, 1), // Oct 1
        to: new Date(year, 11, 31), // Dec 31
      };
    },
  },
  {
    label: "This Year",
    getRange: () => {
      const year = new Date().getFullYear();
      return {
        from: new Date(year, 0, 1), // Jan 1
        to: new Date(year, 11, 31), // Dec 31
      };
    },
  },
  {
    label: "Last Year",
    getRange: () => {
      const year = new Date().getFullYear() - 1;
      return {
        from: new Date(year, 0, 1), // Jan 1 of previous year
        to: new Date(year, 11, 31), // Dec 31 of previous year
      };
    },
  },
];

export function DatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { dateRange, setDateRange } = useDateRange();

  const handleQuickSelect = (getRange: () => { from: Date; to: Date }) => {
    const range = getRange();
    setDateRange(range);
  };

  return (
    <div className={cn("grid gap-2 font-[Montserrat]", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center space-x-3">
            <Button
              id="date-from"
              variant={"outline"}
              className={cn(
                "justify-center text-left font-normal w-52 rounded-lg border-green-900 border-2",
                !dateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-4 w-4" />
              {dateRange?.from ? (
                format(dateRange.from, "MM/dd/yy")
              ) : (
                <span>Start date</span>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">-</span>
            <Button
              id="date-to"
              variant={"outline"}
              className={cn(
                "justify-center text-left font-normal w-52 rounded-lg border-green-900 border-2",
                !dateRange?.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-4 w-4" />
              {dateRange?.to ? (
                format(dateRange.to, "MM/dd/yy")
              ) : (
                <span>End date</span>
              )}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 translate-x-[-50px] font-[Montserrat]"
          align="start"
        >
          <div className="flex">
            {/* Left column with quick select buttons */}
            <div className="flex flex-col p-2 border-r bg-muted/20">
              {quickSelectOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="mb-2 justify-start text-sm whitespace-nowrap"
                  onClick={() => handleQuickSelect(option.getRange)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              classNames={{
                month: "space-y-4 font-[Arimo]",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-bold",
                day_selected:
                  "bg-green-900 text-white hover:bg-green-600 rounded-none",
                day_range_middle: "bg-green-900 text-white rounded-none",
                day_range_end:
                  "bg-green-900 text-white hover:bg-green-600 rounded-r-full",
                day_range_start:
                  "bg-green-900 text-white hover:bg-green-600 rounded-l-full",
                day_outside: "invisible bg-transparent border-transparent",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
