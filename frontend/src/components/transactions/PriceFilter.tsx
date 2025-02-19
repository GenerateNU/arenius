"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PriceFilterProps {
  onApply: (prices: { min: string; max: string }) => void;
}

export default function PriceFilter({ onApply }: PriceFilterProps) {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Enter min price"
          />
          <label className="text-sm font-medium">Max Price</label>
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Enter max price"
          />
          <Button onClick={() => onApply({ min: minPrice, max: maxPrice })}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
