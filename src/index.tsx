// deps
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppProvider from "./app/AppProvider";

// linking
const linking = {
  prefixes: ["http://localhost:8082", "exp://127.0.0.1:19000"],
  config: {
    screens: {
      Login: "login",
      Register: "register",
      VerifyEmail: "verified",
      ResetPassword: "reset-password",
      App: {
        screens: {
          Feed: "feed",
          Events: "events",
          Groups: "groups",
          Messages: "messages",
          Profile: "profile",
          Help: "help",
        },
      },
    },
  },
};

// app
export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <AppProvider />
    </NavigationContainer>
  );
}
