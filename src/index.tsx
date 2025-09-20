// deps
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppProvider from "./app/AppProvider";
import { navigationRef } from "./app/navigation/RootNavigator";

// linking
const linking = {
  prefixes: [
    "nuntium://",             // mobile
    "http://localhost:8081",  // web
    "exp://127.20.10.4:8081"   // expo go
  ],
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
          Help: "help"
        }
      }
    }
  }
};

// app
export default function App() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <AppProvider />
    </NavigationContainer>
  );
}
