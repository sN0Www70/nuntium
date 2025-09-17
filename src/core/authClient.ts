// deps
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

// storage
const rnStorage =
  Platform.OS === "web"
    ? undefined
    : {
        getItem: (k: string) => AsyncStorage.getItem(k),
        setItem: (k: string, v: string) => AsyncStorage.setItem(k, v),
        removeItem: (k: string) => AsyncStorage.removeItem(k),
      };

// client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: rnStorage as any,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
