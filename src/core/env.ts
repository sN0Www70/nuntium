// env.ts
import { Platform } from "react-native";

export const SUPABASE_URL = "https://dyugbyghzskyhwyntbdt.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dWdieWdoenNreWh3eW50YmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgzODcsImV4cCI6MjA3MzYyNDM4N30.ZzQeMCwnZf06-3OEKJik811k4oOGYNJBE85VLtV_9EA";

// redirect
export const RESET_REDIRECT_URL =
  Platform.OS === "web"
    ? window.location.origin
    : "nuntium://reset-password";
