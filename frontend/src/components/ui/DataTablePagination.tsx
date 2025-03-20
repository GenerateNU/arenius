import { PaginationState, Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination: PaginationState;
  total_count: number;
}

export function DataTablePagination<TData>({
  table,
  pagination,
  total_count,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end px-2 mt-4">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              if (table.getState().pagination.pageSize !== Number(value)) {
                table.setPageSize(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100, 200].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pagination.pageIndex + 1} of{" "}
          {getNumberPages(pagination, total_count)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canGetPreviousPage(pagination)}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!canGetPreviousPage(pagination)}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!canGetNextPage(pagination, total_count)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() =>
              table.setPageIndex(getNumberPages(pagination, total_count) - 1)
            }
            disabled={!canGetNextPage(pagination, total_count)}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getNumberPages(
  pagination: PaginationState,
  total_count: number
): number {
  if (pagination.pageSize <= 0) return 0;
  if (total_count == 0) return 1;
  return Math.ceil(total_count / pagination.pageSize);
}

function canGetNextPage(
  pagination: PaginationState,
  total_count: number
): boolean {
  return (pagination.pageIndex + 1) * pagination.pageSize < total_count;
}

function canGetPreviousPage(pagination: PaginationState): boolean {
  return pagination.pageIndex + 1 > 1;
}
