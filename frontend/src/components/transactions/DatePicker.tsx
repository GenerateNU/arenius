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
import { useLineItems } from "@/context/LineItemsContext";
import { ChevronDown } from "lucide-react";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { filters, setFilters } = useLineItems();
  const [date, setDate] = React.useState<DateRange | undefined>(filters.dates);

  const handleFilterChange = (e: DateRange | undefined) => {
    setFilters({ ...filters, dates: e });
    setDate(e);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={styles.button}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>All dates</span>
            )}
            <ChevronDown className={styles.chevronDown} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-gray-200 shadow-lg rounded-lg" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleFilterChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const styles = {
  button: "flex gap-8",
  chevronDown: "h-4 w-4 opacity-50",
};
