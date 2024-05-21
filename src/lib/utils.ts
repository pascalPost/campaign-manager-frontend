import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createConnectTransport } from "@connectrpc/connect-web";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function catchError(func: Promise<void>) {
  return () => {
    func.catch((error) => {
      console.error(error);
    });
  };
}

export const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});
