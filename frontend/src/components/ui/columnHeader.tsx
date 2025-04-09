import React from "react";
import { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Button } from "./button";
import { Tooltip } from "./tooltip";


type TooltipContent = {
  title: string;
  body: string;
};

type ColumnHeaderProps<T extends object> = {
  column: Column<T>;
  name: string;
  className?: string;
  tooltipContent?: TooltipContent;
};

const ColumnHeader = <T extends object>({
  column,
  name,
  className,
  tooltipContent,
}: ColumnHeaderProps<T>) => {
  return (
    <div className={className}>
      <Button
        className="font-bold font-[Arimo]"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {name}

        {tooltipContent && (
          <Tooltip textContent={tooltipContent}>
            <HelpCircle className="w-2 h-2 text-gray-500" />
          </Tooltip>
        )}

        {column.getIsSorted() == "asc" ? <ChevronUp /> : <ChevronDown />}
      </Button>
    </div>
  );
};
export { ColumnHeader };
