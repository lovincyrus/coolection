import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useClipboardUrl } from "../use-clipboard-url";

const mockReadText = vi.fn();

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { readText: mockReadText },
    writable: true,
    configurable: true,
  });
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useClipboardUrl", () => {
  it("calls onUrlDetected when clipboard contains a valid URL", async () => {
    mockReadText.mockResolvedValue("https://example.com");
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));

    // Wait for the async clipboard read to resolve
    await act(() => Promise.resolve());

    expect(onUrlDetected).toHaveBeenCalledWith("https://example.com");
  });

  it("does not call onUrlDetected for invalid URLs", async () => {
    mockReadText.mockResolvedValue("not a url");
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));

    await act(() => Promise.resolve());

    expect(onUrlDetected).not.toHaveBeenCalled();
  });

  it("does not call onUrlDetected for empty clipboard", async () => {
    mockReadText.mockResolvedValue("");
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));

    await act(() => Promise.resolve());

    expect(onUrlDetected).not.toHaveBeenCalled();
  });

  it("trims whitespace from clipboard text", async () => {
    mockReadText.mockResolvedValue("  https://example.com  ");
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));

    await act(() => Promise.resolve());

    expect(onUrlDetected).toHaveBeenCalledWith("https://example.com");
  });

  it("does not prompt again for the same URL in the same session", async () => {
    mockReadText.mockResolvedValue("https://example.com");
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));
    await act(() => Promise.resolve());

    expect(onUrlDetected).toHaveBeenCalledTimes(1);

    // Re-render with the same clipboard content
    const { unmount } = renderHook(() => useClipboardUrl(onUrlDetected));
    await act(() => Promise.resolve());

    // Should not be called again because the URL is dismissed in sessionStorage
    expect(onUrlDetected).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("silently ignores clipboard permission errors", async () => {
    mockReadText.mockRejectedValue(new DOMException("Not allowed"));
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));

    await act(() => Promise.resolve());

    expect(onUrlDetected).not.toHaveBeenCalled();
  });

  it("checks clipboard again on window focus", async () => {
    mockReadText.mockResolvedValue("not a url");
    const onUrlDetected = vi.fn();

    renderHook(() => useClipboardUrl(onUrlDetected));
    await act(() => Promise.resolve());

    expect(onUrlDetected).not.toHaveBeenCalled();

    // Change clipboard content and trigger focus
    mockReadText.mockResolvedValue("https://newsite.com");
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });

    expect(onUrlDetected).toHaveBeenCalledWith("https://newsite.com");
  });
});
