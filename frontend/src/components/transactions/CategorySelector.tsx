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
import {
  fetchEmissionsFactors,
  setEmissionFactorFavorite,
} from "@/services/emissionsFactors";
import {
  EmissionsFactorCategories,
  EmissionsFactorCategory,
  EmissionsFactor,
} from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import Image from "next/image";
import { getHistory, addToHistory } from "@/hooks/useReconciliationHistory";

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
  categoriesList: EmissionsFactorCategory[];
  searchTerm: string;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
  categories: EmissionsFactorCategories | undefined;
  setCategories: (Value: EmissionsFactorCategories) => void;
}

interface CategoryItemProps {
  category: EmissionsFactorCategory;
  expandedInitial: boolean;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
  categories: EmissionsFactorCategories | undefined;
  setCategories: (Value: EmissionsFactorCategories) => void;
}

interface EmissionsFactorListProps {
  emissionsFactors: EmissionsFactor[];
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
  categories: EmissionsFactorCategories | undefined;
  setCategories: (Value: EmissionsFactorCategories) => void;
}

interface EmissionsFactorProps {
  emissionsFactor: EmissionsFactor;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
  categories: EmissionsFactorCategories | undefined;
  setCategories: (Value: EmissionsFactorCategories) => void;
}

interface FavoriteStarProps {
  emissionsFactor: EmissionsFactor;
  categories: EmissionsFactorCategories | undefined;
  setCategories: (Value: EmissionsFactorCategories) => void;
}

export default function CategorySelector({
  emissionsFactor,
  setEmissionsFactor,
  variant = "outline",
}: CategorySelectorProps) {
  const { companyId } = useAuth();
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [categories, setCategories] = useState<EmissionsFactorCategories>();
  const [historyFactors, setHistoryFactors] = useState<EmissionsFactor[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors(debouncedTerm, companyId);
      setCategories(response);
    }
    fetchCategories();
  }, [companyId, debouncedTerm]);

  useEffect(() => {
    if (activeTab === "History") {
      setHistoryFactors(getHistory());
    }
  }, [activeTab]);

  const handleSelectFactor = (factor: EmissionsFactor) => {
    setEmissionsFactor(factor);
    setIsOpen(false);
    addToHistory(factor);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
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
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === "All" ? (
          <CategoryList
            categoriesList={categories?.all || []}
            searchTerm={debouncedTerm}
            setEmissionsFactor={handleSelectFactor}
            setIsOpen={setIsOpen}
            categories={categories}
            setCategories={setCategories}
          />
        ) : (
          <EmissionsFactorList
            emissionsFactors={
              activeTab === "Favorites"
                ? categories?.favorites.emissions_factors || []
                : historyFactors
            }
            setEmissionsFactor={handleSelectFactor}
            setIsOpen={setIsOpen}
            categories={categories}
            setCategories={setCategories}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function CategoryList({
  categoriesList,
  searchTerm,
  setEmissionsFactor,
  setIsOpen,
  categories,
  setCategories,
}: CategoryListProps) {
  return (
    <div className={styles.categoryList}>
      {categoriesList.length > 0 ? (
        categoriesList.map((category) => (
          <CategoryItem
            key={`${category.name}-${category.emissions_factors.length}`}
            category={category}
            expandedInitial={searchTerm !== ""}
            setEmissionsFactor={setEmissionsFactor}
            setIsOpen={setIsOpen}
            categories={categories}
            setCategories={setCategories}
          />
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function CategoryItem({
  category,
  expandedInitial,
  setEmissionsFactor,
  setIsOpen,
  categories,
  setCategories,
}: CategoryItemProps) {
  const [expanded, setExpanded] = useState<boolean>(expandedInitial);

  return (
    <>
      <Button
        variant="ghost"
        className={styles.dropdownButton}
        onClick={() => setExpanded(!expanded)}
      >
        <p className="text-wrap">{category.name}</p>
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
      {expanded && (
        <EmissionsFactorList
          emissionsFactors={category.emissions_factors}
          setEmissionsFactor={setEmissionsFactor}
          setIsOpen={setIsOpen}
          categories={categories}
          setCategories={setCategories}
        />
      )}
    </>
  );
}

function EmissionsFactorList({
  emissionsFactors,
  setEmissionsFactor,
  setIsOpen,
  categories,
  setCategories,
}: EmissionsFactorListProps) {
  return (
    <div>
      {emissionsFactors.length > 0 ? (
        emissionsFactors.map((emissionsFactor) => (
          <EmissionsFactorItem
            key={emissionsFactor.name}
            emissionsFactor={emissionsFactor}
            setEmissionsFactor={setEmissionsFactor}
            setIsOpen={setIsOpen}
            categories={categories}
            setCategories={setCategories}
          />
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function EmissionsFactorItem({
  emissionsFactor,
  setEmissionsFactor,
  setIsOpen,
  categories,
  setCategories,
}: EmissionsFactorProps) {
  return (
    <span key={emissionsFactor.id} className="flex items-center">
      <Button
        variant="ghost"
        className={styles.dropdownButton}
        onClick={() => {
          setEmissionsFactor(emissionsFactor);
          setIsOpen(false);
          addToHistory(emissionsFactor);
        }}
      >
        • {emissionsFactor.name}
      </Button>
      <FavoriteStar
        emissionsFactor={emissionsFactor}
        categories={categories}
        setCategories={setCategories}
      />
    </span>
  );
}

function FavoriteStar({
  emissionsFactor,
  categories,
  setCategories,
}: FavoriteStarProps) {
  const [isFavorite, setIsFavorite] = useState(emissionsFactor.favorite);

  const toggleFavorite = async () => {
    if (!emissionsFactor.company_id || !emissionsFactor.id) return;

    const newFavoriteState = !isFavorite;

    try {
      await setEmissionFactorFavorite(
        emissionsFactor.company_id,
        emissionsFactor.id,
        newFavoriteState
      );
      setIsFavorite(newFavoriteState);

      const updatedFactor = {
        ...emissionsFactor,
        favorite: newFavoriteState,
      };

      const updateList = (list: EmissionsFactor[]) =>
        list.map((f) => (f.id === updatedFactor.id ? updatedFactor : f));

      const removeFromList = (list: EmissionsFactor[]) =>
        list.filter((f) => f.id !== updatedFactor.id);

      if (categories) {
        const updatedFavorites = newFavoriteState
          ? [...(categories.favorites.emissions_factors || []), updatedFactor]
          : removeFromList(categories.favorites.emissions_factors || []);

        const updatedAll = categories.all.map((cat) => ({
          ...cat,
          emissions_factors: updateList(cat.emissions_factors),
        }));

        setCategories({
          ...categories,
          all: updatedAll,
          favorites: {
            ...categories.favorites,
            emissions_factors: updatedFavorites.sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
          },
        });
      }
    } catch (error) {
      console.error("Failed to update favorite", error);
    }
  };

  return (
    <Button variant="ghost" onClick={toggleFavorite}>
      <Image
        src={isFavorite ? "/filled_star.svg" : "/Star.svg"}
        alt={isFavorite ? "Remove from favorites" : "Add to favorites"}
        width={18}
        height={18}
      />
    </Button>
  );
}

const styles = {
  button: "flex gap-8 text-wrap text-left h-auto",
  chevronDown: "h-4 w-4 opacity-50",
  popoverContent: "w-96 p-2 max-h-[400px] overflow-y-auto",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input: "pl-10 border-none focus:ring-0",
  categoryList: "py-2 max-h-60 overflow-y-auto",
  dropdownButton:
    "flex justify-between items-center px-3 py-2 text-left text-wrap",
  noResults: "px-2 text-gray-500 text-sm",
};
