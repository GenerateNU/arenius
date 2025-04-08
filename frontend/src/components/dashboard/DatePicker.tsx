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
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { LineItemFilters } from "@/types";

const quickSelectOptions = [
  {
    label: "All time",
    getRange: () => {
      const today = new Date();
      return { from: new Date(2000, 0, 1), to: today };
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

export type DatePickerProps = {
  dateRange: DateRange;
  setDateRange: (range: DateRange | undefined) => void;
  className?: string;
  showClearAndApply?: boolean;
  filters: LineItemFilters;
};

export function DatePicker({
  dateRange,
  setDateRange,
  className,
  showClearAndApply = false,
  filters
}: DatePickerProps) {
  const handleQuickSelect = (getRange: () => { from: Date; to: Date }) => {
    const range = getRange();
    setLocalDateRange(range);
  };
  
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(dateRange)

  const handleApply = () => {
    if (localDateRange) {
      setDateRange(localDateRange)
    }
  }

  const handleClear = () => {
    setLocalDateRange(undefined);
    setDateRange(undefined)
  }

  useEffect(() => {
    if (!filters.dates) {
      setLocalDateRange(undefined);
    }
  }, [filters]);

  return (
    <div className={cn("grid gap-2 font-[Montserrat]", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center space-x-3">
            <DateButton
              id="date-from"
              date={localDateRange?.from}
              placeholder="Start date"
            />
            <span className="text-sm text-muted-foreground">–</span>
            <DateButton
              id="date-to"
              date={localDateRange?.to}
              placeholder="End date"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 translate-x-[-50px] font-[Montserrat]"
          align="start"
        >
          <div className="flex">
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
              defaultMonth={localDateRange?.from || new Date()}
              selected={localDateRange}
              onSelect={setLocalDateRange}
              numberOfMonths={2}
              classNames={{
                month: "space-y-4 font-[Arimo]",
                day: "font-body h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-bold",
                day_selected:
                  "bg-moss text-white hover:bg-green-600 rounded-none",
                day_range_middle: "bg-moss text-white rounded-none",
                day_range_end:
                  "bg-moss text-white hover:bg-green-600 rounded-r-full",
                day_range_start:
                  "bg-moss text-white hover:bg-green-600 rounded-l-full",
                day_outside: "invisible bg-transparent border-transparent",
              }}
            />
          </div>
          {showClearAndApply &&
              <div className="flex justify-end">
                <Button onClick={handleClear} variant="ghost" className="text-xs underline text-gray-500 mb-4">Clear Filter</Button>
                <Button onClick={handleApply} className="text-xs mr-4 ml-4 mb-4">Apply</Button>
              </div>
            }
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DateButton({
  id,
  date,
  placeholder,
  onClick,
}: {
  id: string;
  date?: Date;
  placeholder: string;
  onClick?: () => void;
}) {
  return (
    <Button
      id={id}
      variant={"ghost"}
      className={cn(
        "bg-white justify-center text-left font-medium w-40 rounded-lg shadow-md"
      )}
      onClick={onClick}
    >
      <CalendarIcon className="mr-1 h-4 w-4" />
      {date ? format(date, "MM/dd/yy") : <span>{placeholder}</span>}
    </Button>
  );
}
