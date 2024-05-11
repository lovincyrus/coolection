import { useEffect, useState } from "react";

/**
 * The loading state will only show if the loading takes longer than 1 second.
 * This is useful for preventing the loading state from flickering.
 */
export function useLoadingWithTimeout(
  isLoading: boolean,
  timeout = 1_000,
): boolean {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => setLoading(true), timeout);
      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }

    return () => {};
  }, [isLoading, timeout]);

  return loading;
}
