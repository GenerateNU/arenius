"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTransactionsContext } from "@/context/TransactionContext";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "./RangeSlider";
import { cn } from "@/lib/utils";

export default function PriceFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { filters, setFilters } = useTransactionsContext();

  const [localValues, setLocalValues] = useState<
    [number | undefined, number | undefined]
  >([filters.minPrice, filters.maxPrice]);

  const minPrice = localValues[0];
  const maxPrice = localValues[1];

  const handleApply = () => {
    setFilters({
      ...filters,
      minPrice,
      maxPrice,
    });
  };

  const handleClear = () => {
    setFilters({
      ...filters,
      minPrice: undefined,
      maxPrice: undefined
    })
  }

  useEffect(() => {
    if (!filters.minPrice && !filters.maxPrice) {
      setLocalValues([undefined, undefined]);
    }
  }, [filters]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="dropdown" className={cn(className)}>
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
        <Slider
          defaultValue={[minPrice || 0, maxPrice || 10_000]}
          minStepsBetweenThumbs={100}
          max={10_000}
          min={0}
          step={1}
          onValueChange={(newValues: (number | undefined)[]) =>
            setLocalValues([
              newValues[0] === 0 ? undefined : newValues[0],
              newValues[1] === 10_000 ? undefined : newValues[1],
            ])
          }
          className={cn("w-full")}
        />
        <div className="flex justify-between items-center my-4 font-body">
          <PriceInput
            label="Min"
            value={minPrice}
            onChange={(value) => setLocalValues((prev) => [value, prev[1]])}
          />
          <PriceInput
            label="Max"
            value={maxPrice}
            onChange={(value) => setLocalValues((prev) => [prev[0], value])}
          />
        </div>
        <div className="flex justify-between">
          <Button onClick={handleClear} variant="ghost" className="text-xs underline text-gray-500">Clear Filter</Button>
          <Button onClick={handleApply} className="text-xs">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <label className="text-sm font-medium">{label}</label>
      <Input
        className="w-24 text-center"
        type="number"
        min={0}
        value={value === undefined ? "" : value}
        onChange={(e) => {
          const inputValue = e.target.value;
          if (inputValue === "") {
            onChange(undefined);
          } else {
            const parsedValue = parseFloat(inputValue);
            if (!isNaN(parsedValue) && parsedValue >= 0) {
              onChange(parsedValue);
            }
          }
        }}
        placeholder="$"
      />
    </div>
  );
}

const styles = {
  chevronDown: "h-4 w-4 opacity-50",
};
