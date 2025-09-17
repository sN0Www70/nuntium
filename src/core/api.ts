// deps
import { ENV } from "./env";
import { getToken } from "./storage";

// helpers
async function handle(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// base
async function req(path: string, init: RequestInit = {}) {
  const url = `${ENV.BASE_URL}${path}`;
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  } as Record<string, string>;
  return fetch(url, { ...init, headers }).then(handle);
}

// api
export const api = {
  // auth
  register: (body: any) => req("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  verifyEmail: (body: any) => req("/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => req("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => req("/auth/me", { method: "GET" }),
};
