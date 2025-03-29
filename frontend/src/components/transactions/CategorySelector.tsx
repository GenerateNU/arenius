"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Factory, Search } from "lucide-react";
import { fetchEmissionsFactors, setEmissionFactorFavorite } from "@/services/emissionsFactors";
import { EmissionsFactorCategories, EmissionsFactorCategory, EmissionsFactor } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import Image from "next/image";

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
  categories: EmissionsFactorCategories | undefined;
  setCategories: (Value: EmissionsFactorCategories) => void;
  searchTerm: string;
  setEmissionsFactor: (value: EmissionsFactor) => void;
  setIsOpen: (value: boolean) => void;
}

interface CategoryProps {
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

  const [activeTab, setActiveTab] = useState<string>("All");
  
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch("");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [categories, setCategories] = useState<EmissionsFactorCategories | undefined>(undefined);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetchEmissionsFactors(debouncedTerm, companyId);
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
            categoriesList={categories?.all || []}
            searchTerm={debouncedTerm}
            setEmissionsFactor={setEmissionsFactor}
            setIsOpen={setIsOpen}
            categories={categories}
            setCategories={setCategories}
          />
        ) : (
          <EmissionsFactorList
            emissionsFactors={(activeTab === "Favorites" ? categories?.favorites.emissions_factors : categories?.history.emissions_factors) || []}
            setEmissionsFactor={setEmissionsFactor}
            setIsOpen={setIsOpen}
            categories={categories}
            setCategories={setCategories}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function CategoryList({ categoriesList, searchTerm, setEmissionsFactor, setIsOpen, categories, setCategories }: CategoryListProps) {
  return (
    <div className={styles.categoryList}>
      {categoriesList.length > 0 ? (
        categoriesList.map((category) => (
          <CategoryItem key={`${category.name}-${category.emissions_factors.length}`}
            category={category} expandedInitial={searchTerm !== ""} 
            setEmissionsFactor={setEmissionsFactor} 
            setIsOpen={setIsOpen} 
            categories={categories} 
            setCategories={setCategories} />
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function CategoryItem({ category, setEmissionsFactor, setIsOpen, categories, setCategories, expandedInitial = false }: CategoryProps) {
  const [expanded, setExpanded] = useState<boolean>(expandedInitial);

  return (
    <>
      <Button variant="ghost" className={styles.dropdownButton} onClick={() => setExpanded(!expanded)}>
        {category.name}
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>
      {expanded && <EmissionsFactorList emissionsFactors={category.emissions_factors} setEmissionsFactor={setEmissionsFactor} setIsOpen={setIsOpen} categories={categories} setCategories={setCategories} />}
    </>
  )
}

function EmissionsFactorList({ emissionsFactors, setEmissionsFactor, setIsOpen, categories, setCategories }: EmissionsFactorListProps) {
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
            setCategories={setCategories} />
        ))
      ) : (
        <p className={styles.noResults}>No results found</p>
      )}
    </div>
  );
}

function EmissionsFactorItem({ emissionsFactor, setEmissionsFactor, setIsOpen, categories, setCategories }: EmissionsFactorProps) {
  return (
    <span className="flex items-center">
      <Button key={emissionsFactor.name} variant="ghost" className={styles.dropdownButton} onClick={() => { setEmissionsFactor(emissionsFactor); setIsOpen(false); }}>
        • {emissionsFactor.name}
      </Button>
      <FavoriteStar emissionsFactor={emissionsFactor} categories={categories} setCategories={setCategories} />
    </span>
  )
}

function FavoriteStar({emissionsFactor, categories, setCategories }: FavoriteStarProps) {
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
      if (newFavoriteState && categories) {
        // then it is true, so add it to favorites
        const updatedFavoriteFactors = [...(categories.favorites.emissions_factors || []), emissionsFactor];
  
        // Sort the list by name
        updatedFavoriteFactors.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        const updatedHistoryFactors = (categories.history.emissions_factors || []).map((factor) => {
          if (factor.id === emissionsFactor.id) {
            return emissionsFactor
          } else{
            return factor
          }
        })

        const updatedAllFactors = (categories.all.map((category) => {
          return {
            ...category,
            emission_factors: category.emissions_factors.map((factor) => {
              if (factor.id === emissionsFactor.id) {
                return emissionsFactor
              } else{
                return factor
              }
            })
          }
        }))
        
        setCategories({
          ...categories, 
          all: updatedAllFactors,
          favorites: {
            ...categories.favorites, 
            emissions_factors: updatedFavoriteFactors
          },
          history: {
            ...categories.history,
            emissions_factors: updatedHistoryFactors
          }
        });
      } else if (categories) {
        // then it is false, so remove it from favorites
        const updatedHistoryFactors = (categories.history.emissions_factors || []).map((factor) => {
          if (factor.id === emissionsFactor.id) {
            return emissionsFactor
          } else{
            return factor
          }
        })

        const updatedAllFactors = (categories.all.map((category) => {
          return {
            ...category,
            emission_factors: category.emissions_factors.map((factor) => {
              if (factor.id === emissionsFactor.id) {
                return emissionsFactor
              } else{
                return factor
              }
            })
          }
        }))

        setCategories({
          ...categories, 
          all: updatedAllFactors,
          favorites: {
            ...categories.favorites, 
            emissions_factors: categories.favorites.emissions_factors.filter(
              factor => factor.id !== emissionsFactor.id
            )
          },
          history: {
            ...categories.history,
            emissions_factors: updatedHistoryFactors
          }
        });
      }
    } catch (error) {
      console.error("Failed to update favorite status", error);
    }
  };

  if (isFavorite) {
    return (
      <Button variant="ghost" onClick={toggleFavorite}>
        <Image
            src="/filled_star.svg"
            alt="Remove from favorites"
            width={18}
            height={18}
        />
      </Button>
    )
  }
  return (
    <Button variant="ghost" onClick={toggleFavorite}>
      <Image
          src="/Star.svg"
          alt="Add to favorites"
          width={18}
          height={18}
      />
    </Button>
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
    "w-full flex justify-between items-center px-3 py-2 text-left text-wrap",
  dropdownContent: "min-w-[400px] w-64 max-h-96 overflow-y-auto",
  factorButton:
    "text-left px-4 py-2 whitespace-normal break-words flex justify-start",
  noResults: "px-2 text-gray-500 text-sm",
};
