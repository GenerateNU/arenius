"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { fetchEmissionsFactors } from "@/services/emissionsFactors";
import { EmissionsFactorCategory, EmissionsFactor } from "@/types";

interface CategorySelectorProps {
  emissionsFactor?: EmissionsFactor;
  setEmissionsFactor: (factor: EmissionsFactor) => void;
  variant?:
    | "link"
    | "secondary"
    | "destructive"
    | "outline"
    | "default"
    | "ghost"
    | null
    | undefined;
}

interface CategoryListProps {
  categories: EmissionsFactorCategory[];
  setIsOpen: (value: boolean) => void;
  setValue: (value: EmissionsFactor) => void;
}

export default function CategorySelector({
  emissionsFactor,
  setEmissionsFactor,
  variant = "outline",
}: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<EmissionsFactorCategory[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors();
      setCategories(response.sort((a, b) => a.name.localeCompare(b.name)));
    }
    fetchCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.emissions_factors?.some((factor) =>
        factor.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className={styles.button} variant={variant}>
          {emissionsFactor?.name || "Select emissions factor"}
          <ChevronDown className={styles.chevronDown} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={styles.popoverContent}
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <div className="relative px-2">
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            autoFocus
          />
        </div>
        <CategoryList
          categories={filteredCategories}
          setIsOpen={setIsOpen}
          setValue={setEmissionsFactor}
        />
      </PopoverContent>
    </Popover>
  );
}

function CategoryList({ categories, setIsOpen, setValue }: CategoryListProps) {
  return (
    <div className={styles.categoryList}>
      {categories.length > 0 ? (
        categories.map((category) => (
          <DropdownMenu key={category.name}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={styles.dropdownButton}>
                {category.name}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              className={styles.dropdownContent}
            >
              {category.emissions_factors.map((factor: EmissionsFactor) => (
                <Button
                  className={styles.factorButton}
                  key={factor.activity_id}
                  variant="ghost"
                  size={"dropdown"}
                  onClick={() => {
                    setIsOpen(false);
                    setValue(factor);
                  }}
                >
                  {factor.name}
                </Button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

const styles = {
  button: "flex gap-8",
  chevronDown: "h-4 w-4 opacity-50",
  popoverContent: "w-96 p-2",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input: "pl-10 border-none focus:ring-0",
  categoryList: "py-2 max-h-60 overflow-y-auto",
  dropdownButton:
    "w-full flex justify-between items-center px-3 py-2 text-left",
  dropdownContent: "min-w-[400px] w-64 max-h-96 overflow-y-auto",
  factorButton:
    "text-left px-4 py-2 whitespace-normal break-words flex justify-start",
  noResults: "px-2 text-gray-500 text-sm",
};
