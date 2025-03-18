"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronRight, Search } from "lucide-react";
import { fetchEmissionsFactors } from "@/services/emissionsFactors";
import { EmissionsFactorCategories, EmissionsFactorCategory, EmissionsFactor } from "@/types";
import { useAuth } from "@/context/AuthContext";

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
  setCategory: (value: EmissionsFactorCategory) => void;
}

interface EmissionsFactorListProps {
  category: EmissionsFactorCategory;
  searchTerm: string;
  setIsOpen: (value: boolean) => void;
  setCategory: (value: EmissionsFactorCategory | undefined) => void;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setActiveTab: (value: string) => void;
}

export default function CategorySelector({
  emissionsFactor,
  setEmissionsFactor,
  variant = "outline",
}: CategorySelectorProps) {
  const { companyId } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("All");

  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
  const [emissionsFactorSearchTerm, setEmissionsFactorSearchTerm] = useState<string>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [selectedCategory, setSelectedCategory] = useState<EmissionsFactorCategory | undefined>(undefined);

  const [categories, setCategories] = useState<EmissionsFactorCategories | undefined>(undefined);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors(companyId);
      setCategories(response);
    }
    fetchCategories();
  }, [companyId]);

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
            value={selectedCategory === undefined ? categorySearchTerm : emissionsFactorSearchTerm}
            onChange={(e) => selectedCategory === undefined ? setCategorySearchTerm(e.target.value) : setEmissionsFactorSearchTerm(e.target.value)}
            className={styles.input}
            autoFocus
          />
        </div>

        {(selectedCategory === undefined || selectedCategory.name == "Favorites" || selectedCategory.name == "History") && (
          <div className="relative px-2 mt-2 flex border-b">
            {["All", "Favorites", "History"].map((tab) => (
              <Button
                key={tab}
                variant="tab"
                active={activeTab === tab}
                onClick={() => {
                  setActiveTab(tab)
                  switch (tab) {
                    case "All": setSelectedCategory(undefined); break;
                    case "Favorites": setSelectedCategory(categories?.favorites); break;
                    case "History": setSelectedCategory(categories?.history); break;
                  }
                }}
              >
                {tab}
              </Button>
            ))}
          </div>
        )}

        {selectedCategory === undefined ? (
          <>
            <CategoryList
              categories={categories?.all || []}
              searchTerm={categorySearchTerm}
              setCategory={setSelectedCategory}
            />
          </>
        ) : (
          <EmissionsFactorList
            category={selectedCategory}
            searchTerm={emissionsFactorSearchTerm}
            setIsOpen={setIsOpen}
            setCategory={setSelectedCategory}
            setEmissionsFactor={setEmissionsFactor}
            setActiveTab={setActiveTab}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function CategoryList({ categories, searchTerm, setCategory }: CategoryListProps) {
  const filteredCategories = categories.filter(
    (category) => category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.categoryList}>
      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <Button key={category.name} variant="ghost" className={styles.dropdownButton} onClick={() => setCategory(category)}>
            {category.name}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function EmissionsFactorList({ category, searchTerm, setIsOpen, setCategory, setEmissionsFactor, setActiveTab }: EmissionsFactorListProps) {
  const filteredEmissionsFactors = category.emissions_factors.filter(
    (emissionsFactor) => emissionsFactor.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className={styles.categoryList}>
      {(category.name !== "Favorites" && category.name !== "History") && <Button variant="ghost" className={styles.backButton} onClick={() => { setCategory(undefined); setActiveTab("All"); }}>
        <ChevronLeft className="w-4 h-4" />
        {category.name}
      </Button>}
      {filteredEmissionsFactors.length > 0 ? (
        filteredEmissionsFactors.map((emissionsFactor) => (
          <Button key={emissionsFactor.name} variant="ghost" className={styles.dropdownButton} onClick={() => { setEmissionsFactor(emissionsFactor); setIsOpen(false); }}>
            {emissionsFactor.name}
          </Button>
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
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
