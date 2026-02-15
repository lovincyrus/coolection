import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, expect, vi } from "vitest";

// Fail tests on React warnings (duplicate keys, invalid props, etc.)
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  const reactWarnings = consoleErrorSpy.mock.calls.filter(
    (args) =>
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") || args[0].includes("Encountered two children with the same key")),
  );
  consoleErrorSpy.mockRestore();
  if (reactWarnings.length > 0) {
    expect.fail(
      `React warning detected:\n${reactWarnings.map((args) => args.join(" ")).join("\n")}`,
    );
  }
});
