"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { fetchEmissionsFactors } from "@/services/emissionsFactors";
import { EmissionsFactorCategories, EmissionsFactorCategory, EmissionsFactor } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

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
  searchTerm: string;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
}

interface CategoryProps {
  category: EmissionsFactorCategory;
  expandedInitial: boolean;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
}

interface EmissionsFactorListProps {
  emissionsFactors: EmissionsFactor[];
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
}

interface EmissionsFactorProps {
  emissionsFactor: EmissionsFactor;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
}

export default function CategorySelector({
  emissionsFactor,
  setEmissionsFactor,
  variant = "outline",
}: CategorySelectorProps) {
  const { companyId } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("All");
  
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch("");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [categories, setCategories] = useState<EmissionsFactorCategories | undefined>(undefined);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors(companyId, debouncedTerm);
      setCategories(response);
    }
    fetchCategories();
  }, [companyId, debouncedTerm]);

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

        <div className="relative px-2 mt-2 flex border-b">
          {["All", "Favorites", "History"].map((tab) => (
            <Button
              key={tab}
              variant="tab"
              active={activeTab === tab}
              onClick={() => {
                setActiveTab(tab)
              }}
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === "All" ? (
          <CategoryList
            categories={categories?.all || []}
            searchTerm={debouncedTerm}
            setEmissionsFactor={setEmissionsFactor}
            setIsOpen={setIsOpen}
          />
        ) : (
          <EmissionsFactorList
            emissionsFactors={(activeTab === "Favorites" ? categories?.favorites.emissions_factors : categories?.history.emissions_factors) || []}
            setEmissionsFactor={setEmissionsFactor}
            setIsOpen={setIsOpen}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function CategoryList({ categories, searchTerm, setEmissionsFactor, setIsOpen }: CategoryListProps) {
  return (
    <div className={styles.categoryList}>
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategoryItem key={`${category.name}-${category.emissions_factors.length}`} category={category} expandedInitial={searchTerm !== ""} setEmissionsFactor={setEmissionsFactor} setIsOpen={setIsOpen} />
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function CategoryItem({ category, setEmissionsFactor, setIsOpen, expandedInitial = false }: CategoryProps) {
  const [expanded, setExpanded] = useState<boolean>(expandedInitial);

  return (
    <>
      <Button variant="ghost" className={styles.dropdownButton} onClick={() => setExpanded(!expanded)}>
        {category.name}
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>
      {expanded && <EmissionsFactorList emissionsFactors={category.emissions_factors} setEmissionsFactor={setEmissionsFactor} setIsOpen={setIsOpen} />}
    </>
  )
}

function EmissionsFactorList({ emissionsFactors, setEmissionsFactor, setIsOpen }: EmissionsFactorListProps) {
  return (
    <div>
      {emissionsFactors.length > 0 ? (
        emissionsFactors.map((emissionsFactor) => (
          <EmissionsFactorItem key={emissionsFactor.name} emissionsFactor={emissionsFactor} setEmissionsFactor={setEmissionsFactor} setIsOpen={setIsOpen} />
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function EmissionsFactorItem({ emissionsFactor, setEmissionsFactor, setIsOpen }: EmissionsFactorProps) {
  return (
    <>
      <Button key={emissionsFactor.name} variant="ghost" className={styles.dropdownButton} onClick={() => { setEmissionsFactor(emissionsFactor); setIsOpen(false); }}>
        • {emissionsFactor.name}
      </Button>
    </>
  )
}

const styles = {
  button: "flex gap-8",
  chevronDown: "h-4 w-4 opacity-50",
  popoverContent: "w-96 p-2",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input: "pl-10 border-none focus:ring-0",
  categoryList: "py-2 max-h-60 overflow-y-auto",
  backButton:
    "w-full flex gap-x-2 items-center justify-start py-2 mb-3 text-left",
  dropdownButton:
    "w-full flex justify-between items-center px-3 py-2 text-left",
  dropdownContent: "min-w-[400px] w-64 max-h-96 overflow-y-auto",
  factorButton:
    "text-left px-4 py-2 whitespace-normal break-words flex justify-start",
  noResults: "px-2 text-gray-500 text-sm",
};
