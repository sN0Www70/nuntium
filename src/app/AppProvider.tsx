// src/app/AppProvider.tsx
import React from "react";
import AuthProvider from "./auth/AuthProvider";
import RootNavigator from "./navigation/RootNavigator";
import { ThemeProvider } from "../core/theme";
import NotificationProvider from "./notifications/NotificationProvider";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

export default function AppProvider() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <RootNavigator />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
