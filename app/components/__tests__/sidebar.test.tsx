import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    onClick?: (_e: React.MouseEvent) => void;
    [key: string]: any;
  }) => (
    <a
      href={href}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockLists = [
  { id: "list-1", name: "Design" },
  { id: "list-2", name: "Work" },
  { id: "list-3", name: "Read Later" },
];

vi.mock("../../hooks/use-lists", () => ({
  useLists: () => ({ data: mockLists }),
}));

const mockSetSidebarOpen = vi.fn();
const mockSetOpenNewListDialog = vi.fn();
let mockSidebarOpen = true;

vi.mock("../provider/globals-provider", () => ({
  useGlobals: () => ({
    sidebarOpen: mockSidebarOpen,
    setSidebarOpen: mockSetSidebarOpen,
    setOpenNewListDialog: mockSetOpenNewListDialog,
  }),
}));

vi.mock("../ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("../ui/button", () => ({
  Button: ({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: () => void; [key: string]: any }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// --- Tests ---

describe("Sidebar", () => {
  beforeEach(() => {
    mockPathname = "/home";
    mockSidebarOpen = true;
    mockSetSidebarOpen.mockReset();
    mockSetOpenNewListDialog.mockReset();
  });

  afterEach(() => {
    // Restore viewport width in case a test overrode it
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
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
    it("renders All Bookmarks link pointing to /home", () => {
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
    });

    it("highlights the active list", () => {
      mockPathname = "/lists/list-1";
      render(<Sidebar />);
      const designLink = screen.getByText("Design").closest("a");
      expect(designLink?.className).toContain("bg-gray-100");
      const workLink = screen.getByText("Work").closest("a");
      expect(workLink?.className).not.toContain("bg-gray-100");
    });

    it("does not highlight All Bookmarks on a list page", () => {
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
      expect(document.querySelector(".bg-black\\/20")).toBeInTheDocument();
    });

    it("hides backdrop when closed", () => {
      mockSidebarOpen = false;
      render(<Sidebar />);
      expect(document.querySelector(".bg-black\\/20")).not.toBeInTheDocument();
    });

    it("calls setSidebarOpen(false) when backdrop is clicked", () => {
      mockSidebarOpen = true;
      render(<Sidebar />);
      fireEvent.click(document.querySelector(".bg-black\\/20")!);
      expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
    });

    it("calls setSidebarOpen(false) when close button is clicked", () => {
      mockSidebarOpen = true;
      render(<Sidebar />);
      fireEvent.click(screen.getByLabelText("Close sidebar"));
      expect(mockSetSidebarOpen).toHaveBeenCalledWith(false);
    });

    it("closes sidebar when a link is clicked on mobile", () => {
      Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
      render(<Sidebar />);
      fireEvent.click(screen.getByText("Design"));
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
