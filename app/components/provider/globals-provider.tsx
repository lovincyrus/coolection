import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHotkeys } from "reakeys";

import { Item } from "../../types";

interface GlobalsContextType {
  openNewItemDialog: boolean;
  setOpenNewItemDialog: (_openNewItemDialog: boolean) => void;
  openNewListDialog: boolean;
  setOpenNewListDialog: (_openNewListDialog: boolean) => void;
  openEditItemDialog: boolean;
  setOpenEditItemDialog: (_openEditItemDialog: boolean) => void;
  currentItem: Item | null;
  setCurrentItem: (_currentItem: Item | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalsContext = createContext<GlobalsContextType | undefined>(undefined);

export const GlobalsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openNewItemDialog, setOpenNewItemDialog] = useState<boolean>(false);
  const [openNewListDialog, setOpenNewListDialog] = useState<boolean>(false);
  const [openEditItemDialog, setOpenEditItemDialog] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("coolection:sidebar") !== "closed";
  });

  useEffect(() => {
    localStorage.setItem("coolection:sidebar", sidebarOpen ? "open" : "closed");
  }, [sidebarOpen]);

  useHotkeys([
    {
      name: "Open new item dialog",
      keys: "c",
      callback: (event) => {
        event?.preventDefault();
        setOpenNewItemDialog(true);
      },
    },
    {
      name: "Open new list dialog",
      keys: "l",
      callback: (event) => {
        event?.preventDefault();
        setOpenNewListDialog(true);
      },
    },
  ]);

  const contextValue = useMemo(
    () => ({
      openNewItemDialog,
      setOpenNewItemDialog,
      openNewListDialog,
      setOpenNewListDialog,
      openEditItemDialog,
      setOpenEditItemDialog,
      currentItem,
      setCurrentItem,
      sidebarOpen,
      setSidebarOpen,
    }),
    [openNewItemDialog, openNewListDialog, openEditItemDialog, currentItem, sidebarOpen],
  );

  return (
    <GlobalsContext.Provider value={contextValue}>
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
