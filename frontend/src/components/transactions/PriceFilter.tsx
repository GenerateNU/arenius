"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLineItems } from "@/context/LineItemsContext";


export default function PriceFilter() {
  const { filters, setFilters } = useLineItems();
  const [minPrice, setMinPrice] = useState(filters.minPrice || undefined);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || undefined);

  const handleApply = () => {
    const updatedFilters = {
      minPrice: minPrice ?? 0,
      maxPrice: maxPrice ?? Number.MAX_SAFE_INTEGER,
    };
    setFilters(updatedFilters); // Updates filters only when "Apply" is pressed
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Filter by Price</Button>
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
  );
}
