import React from "react";
import AuthProvider from "./auth/AuthProvider";
import RootNavigator from "./navigation/RootNavigator";
import { ThemeProvider } from "../core/theme";
import NotificationProvider from "./notifications/NotificationProvider";

export default function AppProvider() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
