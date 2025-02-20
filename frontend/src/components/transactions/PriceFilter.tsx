"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLineItems } from "@/context/LineItemsContext";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


export default function PriceFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { filters, setFilters } = useLineItems();
  const [minPrice, setMinPrice] = useState(filters.minPrice || undefined);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || undefined);

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
      <Button className={styles.button} variant="outline">
          {minPrice || maxPrice ? `${minPrice} - ${maxPrice}` : "All Amounts"}
          <ChevronDown className={styles.chevronDown} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Min Price</label>
          <Input
            type="number"
            value={minPrice ?? ""}
            onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter min price"
          />
          <label className="text-sm font-medium">Max Price</label>
          <Input
            type="number"
            value={maxPrice ?? ""}
            onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter max price"
          />
          <Button onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}

const styles = {
  button: "flex gap-8",
  chevronDown: "h-4 w-4 opacity-50",
};
