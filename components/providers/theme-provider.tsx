"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      themes={["light", "dark", "neon", "midnight", "sunset"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
