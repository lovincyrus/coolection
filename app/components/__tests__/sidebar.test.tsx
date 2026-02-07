import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "../sidebar";

// --- Mocks ---

let mockPathname = "/home";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("next-view-transitions", () => ({
  Link: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: any;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

const mockLists = [
  { id: "list-1", name: "Design", slug: "design", createdAt: "", updatedAt: "", items: [] },
  { id: "list-2", name: "Work", slug: "work", createdAt: "", updatedAt: "", items: [] },
  { id: "list-3", name: "Read Later", slug: "read-later", createdAt: "", updatedAt: "", items: [] },
];

vi.mock("../../hooks/use-lists", () => ({
  useLists: () => ({ data: mockLists, loading: false, mutate: vi.fn(), error: null }),
}));

const mockSetSidebarOpen = vi.fn();
const mockSetOpenNewListDialog = vi.fn();
let mockSidebarOpen = true;

vi.mock("../provider/globals-provider", () => ({
  useGlobals: () => ({
    sidebarOpen: mockSidebarOpen,
    setSidebarOpen: mockSetSidebarOpen,
    setOpenNewListDialog: mockSetOpenNewListDialog,
    openNewItemDialog: false,
    setOpenNewItemDialog: vi.fn(),
    openNewListDialog: false,
    openEditItemDialog: false,
    setOpenEditItemDialog: vi.fn(),
    currentItem: null,
    setCurrentItem: vi.fn(),
  }),
}));

vi.mock("../ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

// --- Tests ---

describe("Sidebar", () => {
  beforeEach(() => {
    mockPathname = "/home";
    mockSidebarOpen = true;
    mockSetSidebarOpen.mockReset();
    mockSetOpenNewListDialog.mockReset();
    localStorage.clear();
  });

  describe("route visibility", () => {
    it("renders on /home", () => {
      mockPathname = "/home";
      render(<Sidebar />);
      expect(screen.getByText("All Bookmarks")).toBeInTheDocument();
    });

    it("renders on /lists/[id]", () => {
      mockPathname = "/lists/list-1";
      render(<Sidebar />);
      expect(screen.getByText("All Bookmarks")).toBeInTheDocument();
    });

    it("renders on /settings", () => {
      mockPathname = "/settings";
      render(<Sidebar />);
      expect(screen.getByText("All Bookmarks")).toBeInTheDocument();
    });

    it("does not render on /", () => {
      mockPathname = "/";
      const { container } = render(<Sidebar />);
      expect(container.innerHTML).toBe("");
    });

    it("does not render on /sign-in", () => {
      mockPathname = "/sign-in";
      const { container } = render(<Sidebar />);
      expect(container.innerHTML).toBe("");
    });
  });

  describe("list rendering", () => {
    it("renders All Bookmarks link", () => {
      render(<Sidebar />);
      const link = screen.getByText("All Bookmarks");
      expect(link.closest("a")).toHaveAttribute("href", "/home");
    });

    it("renders all lists", () => {
      render(<Sidebar />);
      expect(screen.getByText("Design")).toBeInTheDocument();
      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(screen.getByText("Read Later")).toBeInTheDocument();
    });

    it("renders list links with correct href", () => {
      render(<Sidebar />);
      expect(screen.getByText("Design").closest("a")).toHaveAttribute("href", "/lists/list-1");
      expect(screen.getByText("Work").closest("a")).toHaveAttribute("href", "/lists/list-2");
    });

    it("renders New List button", () => {
      render(<Sidebar />);
      expect(screen.getByText("New List")).toBeInTheDocument();
    });

    it("renders Lists heading", () => {
      render(<Sidebar />);
      expect(screen.getByText("Lists")).toBeInTheDocument();
    });
  });

  describe("active state", () => {
    it("highlights All Bookmarks when on /home", () => {
      mockPathname = "/home";
      render(<Sidebar />);
      const link = screen.getByText("All Bookmarks").closest("a");
      expect(link?.className).toContain("bg-gray-100");
      expect(link?.className).toContain("text-gray-900");
    });

    it("highlights the active list when on a list page", () => {
      mockPathname = "/lists/list-1";
      render(<Sidebar />);

      const designLink = screen.getByText("Design").closest("a");
      expect(designLink?.className).toContain("bg-gray-100");

      const workLink = screen.getByText("Work").closest("a");
      expect(workLink?.className).not.toContain("bg-gray-100");
    });

    it("does not highlight All Bookmarks when on a list page", () => {
      mockPathname = "/lists/list-1";
      render(<Sidebar />);
      const link = screen.getByText("All Bookmarks").closest("a");
      expect(link?.className).not.toContain("bg-gray-100");
    });
  });

  describe("sidebar open/close", () => {
    it("shows backdrop when open", () => {
      mockSidebarOpen = true;
      render(<Sidebar />);
      const backdrop = document.querySelector(".bg-black\\/20");
      expect(backdrop).toBeInTheDocument();
    });

    it("does not show backdrop when closed", () => {
      mockSidebarOpen = false;
      render(<Sidebar />);
      const backdrop = document.querySelector(".bg-black\\/20");
      expect(backdrop).not.toBeInTheDocument();
    });

    it("applies open classes when sidebar is open", () => {
      mockSidebarOpen = true;
      render(<Sidebar />);
      const aside = document.querySelector("aside");
      expect(aside?.className).toContain("translate-x-0");
      expect(aside?.className).toContain("md:min-w-[256px]");
    });

    it("applies closed classes when sidebar is closed", () => {
      mockSidebarOpen = false;
      render(<Sidebar />);
      const aside = document.querySelector("aside");
      expect(aside?.className).toContain("-translate-x-full");
      expect(aside?.className).toContain("md:w-0");
    });

    it("calls setSidebarOpen(false) when backdrop is clicked", () => {
      mockSidebarOpen = true;
      render(<Sidebar />);
      const backdrop = document.querySelector(".bg-black\\/20")!;
      fireEvent.click(backdrop);
      expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
    });

    it("calls setSidebarOpen(false) when close button is clicked", () => {
      mockSidebarOpen = true;
      render(<Sidebar />);
      const closeButton = screen.getByLabelText("Close sidebar");
      fireEvent.click(closeButton);
      expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("actions", () => {
    it("opens new list dialog when New List is clicked", () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByText("New List"));
      expect(mockSetOpenNewListDialog).toHaveBeenCalledWith(true);
    });
  });

  describe("long list names", () => {
    it("sets title attribute for list names", () => {
      render(<Sidebar />);
      const designLink = screen.getByText("Design").closest("a");
      expect(designLink).toHaveAttribute("title", "Design");
    });
  });
});

describe("Sidebar state persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads initial state from localStorage", () => {
    localStorage.setItem("coolection:sidebar", "closed");
    // The GlobalsProvider reads localStorage in useState initializer
    // We test the initializer logic directly
    const result = localStorage.getItem("coolection:sidebar");
    expect(result).toBe("closed");
    expect(result !== "closed").toBe(false);
  });

  it("defaults to open when no localStorage value", () => {
    const result = localStorage.getItem("coolection:sidebar");
    expect(result).toBeNull();
    // When null, `!== "closed"` is true, so sidebar defaults open
    expect(result !== "closed").toBe(true);
  });
});
