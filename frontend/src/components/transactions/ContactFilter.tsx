"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost">
              {"All User Groups"}
              <ChevronDown className={styles.chevronDown} />
            </Button>
          </PopoverTrigger>
        </PopoverTrigger>
        <PopoverContent className="w-80"></PopoverContent>
      </Popover>
    </div>
  );
}

const styles = {
  chevronDown: "h-4 w-4 opacity-50",
};
