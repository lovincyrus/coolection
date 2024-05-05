import React, { createContext, useContext, useState } from "react";

interface GlobalsContextType {
  toggleSearch: boolean;
  setToggleSearch: (_toggleSearch: boolean) => void;
}

const GlobalsContext = createContext<GlobalsContextType | undefined>(undefined);

export const GlobalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toggleSearch, setToggleSearch] = useState<boolean>(true);

  return (
    <GlobalsContext.Provider
      value={{
        toggleSearch,
        setToggleSearch,
      }}
    >
      {children}
    </GlobalsContext.Provider>
  );
};

export const useGlobals = () => {
  const context = useContext(GlobalsContext);
  if (context === undefined) {
    throw new Error("useGlobals must be used within a GlobalsProvider");
  }
  return context;
};
