import React, { createContext, useContext, useState } from "react";
import { useHotkeys } from "reakeys";

import { CoolectionItem } from "../../types";

interface GlobalsContextType {
  openNewItemDialog: boolean;
  setOpenNewItemDialog: (_openNewItemDialog: boolean) => void;
  openEditItemDialog: boolean;
  setOpenEditItemDialog: (_openEditItemDialog: boolean) => void;
  currentItem: CoolectionItem | null;
  setCurrentItem: (_currentItem: CoolectionItem | null) => void;
}

const GlobalsContext = createContext<GlobalsContextType | undefined>(undefined);

export const GlobalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openNewItemDialog, setOpenNewItemDialog] = useState<boolean>(false);
  const [openEditItemDialog, setOpenEditItemDialog] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<CoolectionItem | null>(null);

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
        openNewItemDialog,
        setOpenNewItemDialog,
        openEditItemDialog,
        setOpenEditItemDialog,
        currentItem,
        setCurrentItem,
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
