import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useFetchItems } from "@/app/hooks/use-fetch-items";

import { CoolectionItemWithSimilarity } from "../../types";

interface ResultsContextType {
  results: Array<CoolectionItemWithSimilarity>;
  updateResults: (_newResults: Array<CoolectionItemWithSimilarity>) => void;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [results, setResults] = useState<Array<CoolectionItemWithSimilarity>>(
    [],
  );

  const { items, loading: _itemsLoading, error: _itemsError } = useFetchItems();

  useEffect(() => {
    setResults(items);
  }, [items]);

  const updateResults = useCallback(
    (newResults: Array<CoolectionItemWithSimilarity>) => {
      setResults(newResults);
    },
    [],
  );

  return (
    <ResultsContext.Provider value={{ results, updateResults }}>
      {children}
    </ResultsContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (context === undefined) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
};
