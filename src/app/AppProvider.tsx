// deps
import React from "react";
import AuthProvider from "./auth/AuthProvider";
import RootNavigator from "./navigation/RootNavigator";
import { ThemeProvider } from "../core/theme";

// app
export default function AppProvider() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
