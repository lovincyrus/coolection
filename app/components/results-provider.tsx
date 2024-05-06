import React, { createContext, useCallback, useContext, useState } from "react";

import { CoolectionItemWithSimilarity } from "../types";

interface ResultsContextType {
  results: Array<CoolectionItemWithSimilarity>;
  updateResults: (_newResults: Array<CoolectionItemWithSimilarity>) => void;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [results, setResults] = useState<Array<CoolectionItemWithSimilarity>>(
    []
  );

  const updateResults = useCallback(
    (newResults: Array<CoolectionItemWithSimilarity>) => {
      newResults.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setResults(newResults);
    },
    []
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
