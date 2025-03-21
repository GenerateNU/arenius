import { useState, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";

export function useDebouncedSearch(initialValue: string = "", delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  const updateDebouncedTerm = useMemo(() => {
    return debounce((newTerm) => {
      setDebouncedTerm(newTerm);
    }, delay);
  }, [delay]);

  useEffect(() => {
    updateDebouncedTerm(searchTerm);
    return () => updateDebouncedTerm.cancel(); // Cleanup to avoid memory leaks
  }, [searchTerm, updateDebouncedTerm]);


  return { searchTerm, setSearchTerm, debouncedTerm };
}
