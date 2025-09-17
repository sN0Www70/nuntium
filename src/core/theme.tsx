// deps
import React, { createContext, useContext } from "react";

// theme
const theme = {
  colors: { bg: "#0f3d1e", text: "#eaf7f0", primary: "#3be18d" },
  spacing: (n: number) => n * 8,
};

// ctx
const ThemeContext = createContext(theme);
export function useTheme(){ return useContext(ThemeContext); }

// provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
