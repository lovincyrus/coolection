import React, { createContext, useContext, useState } from "react";
import { useHotkeys } from "reakeys";

interface GlobalsContextType {
  toggleSearch: boolean;
  setToggleSearch: (_toggleSearch: boolean) => void;
  openNewItemDialog: boolean;
  setOpenNewItemDialog: (_openNewItemDialog: boolean) => void;
}

const GlobalsContext = createContext<GlobalsContextType | undefined>(undefined);

export const GlobalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toggleSearch, setToggleSearch] = useState<boolean>(true);
  const [openNewItemDialog, setOpenNewItemDialog] = useState<boolean>(false);

  useHotkeys([
    {
      name: "Open new item dialog",
      keys: "c",
      callback: (event) => {
        event?.preventDefault();
        setOpenNewItemDialog(true);
      },
    },
  ]);

  return (
    <GlobalsContext.Provider
      value={{
        toggleSearch,
        setToggleSearch,
        openNewItemDialog,
        setOpenNewItemDialog,
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
