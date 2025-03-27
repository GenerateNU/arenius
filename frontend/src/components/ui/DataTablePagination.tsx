import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./button";
import { useTransactionsContext } from "@/context/TransactionContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  page: number;
  pageLimit: number;
  total_count: number;
  setPage: (page: number) => void;
  setPageLimit: (limit: number) => void;
}

export function DataTablePagination<TData>({
  table,
  page,
  pageLimit,
  total_count,
  setPage,
  setPageLimit,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end px-2 mt-4">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageLimit}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value)); // Update TanStack table state
              setPage(1); // Reset to first page
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageLimit} />
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
          Page {page} of {getNumberPages(pageLimit, total_count)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(page + 1)}
            disabled={page * pageLimit >= total_count}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(getNumberPages(pageLimit, total_count))}
            disabled={page * pageLimit >= total_count}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getNumberPages(pageSize: number, total_count: number): number {
  return Math.ceil(total_count / pageSize);
}
