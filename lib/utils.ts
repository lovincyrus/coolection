import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function replaceNewlinesWithSpaces(text: string) {
  return text.replace(/\n/g, " ");
}
