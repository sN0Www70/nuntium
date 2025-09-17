// deps
import * as SecureStore from "expo-secure-store";

// key
const TK = "nuntium:token";
const isWeb = typeof window !== "undefined";

// save
export async function saveToken(token: string) {
  if (isWeb) {
    localStorage.setItem(TK, token);
  } else {
    await SecureStore.setItemAsync(TK, token);
  }
}

// get
export async function getToken(): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(TK);
  } else {
    return await SecureStore.getItemAsync(TK);
  }
}

// clear
export async function clearToken() {
  if (isWeb) {
    localStorage.removeItem(TK);
  } else {
    await SecureStore.deleteItemAsync(TK);
  }
}
