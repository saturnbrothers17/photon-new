// Simple utility helpers shared across the project
// Inspired by shadcn UI utils
import { clsx } from "clsx";
import { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}
