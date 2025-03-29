"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactionsContext } from "@/context/TransactionContext";

export default function PriceFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { filters, setFilters } = useTransactionsContext();
  const [minPrice, setMinPrice] = useState(filters.minPrice || undefined);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || undefined);

  // TODO: replace local states to directly read from filters in context
  useEffect(() => {
    if (!filters.maxPrice) {
      setMaxPrice(undefined);
    }
    if (!filters.minPrice) {
      setMinPrice(undefined);
    }
  }, [filters]);

  const handleApply = () => {
    const min = minPrice || 0;
    const max = maxPrice || Number.MAX_SAFE_INTEGER;
    setFilters({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost">
            {minPrice !== undefined && maxPrice !== undefined
              ? `Price: $${minPrice} - $${maxPrice}`
              : minPrice === undefined && maxPrice !== undefined
              ? `Price: < $${maxPrice}`
              : maxPrice === undefined && minPrice !== undefined
              ? `Price: > $${minPrice}`
              : "All Amounts"}
            <ChevronDown className={styles.chevronDown} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium">Min Price</label>
            <Input
              type="number"
              value={minPrice ?? ""}
              onChange={(e) =>
                setMinPrice(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Enter min price"
            />
            <label className="text-sm font-medium">Max Price</label>
            <Input
              type="number"
              value={maxPrice ?? ""}
              onChange={(e) =>
                setMaxPrice(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Enter max price"
            />
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const styles = {
  chevronDown: "h-4 w-4 opacity-50",
};
