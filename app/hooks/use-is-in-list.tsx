import { usePathname } from "next/navigation";

export function useIsInList() {
  const pathname = usePathname();
  return pathname !== "/home";
}
