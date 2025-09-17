import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { supabase } from "../../core/authClient";
import type { Session } from "@supabase/supabase-js";

type SessionCtx = {
  session: Session | null;
  loading: boolean;
  recovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
    school?: string;
    join?: boolean;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearRecovery: () => void;
};

const AuthContext = createContext<SessionCtx>({
  session: null,
  loading: true,
  recovery: false,
  signIn: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  clearRecovery: () => {},
});

export function useSession() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("⚡ Auth event:", event, session);

      if (event === "PASSWORD_RECOVERY") {
        setRecovery(true);
        setSession(session ?? null);
        return;
      }

      if (event === "SIGNED_OUT") {
        setSession(null);
        setRecovery(false);
        return;
      }

      setSession(session ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSession(data.session ?? null);
  };

  const signUp = async ({
    firstname,
    lastname,
    email,
    password,
    phone,
    school,
    join,
  }: any) => {
    const redirectTo =
      Platform.OS === "web"
        ? "http://localhost:8081/verified"
        : "nuntium://verified";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { firstname, lastname, phone, school, join },
      },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const redirectTo =
      Platform.OS === "web"
        ? "http://localhost:8081/reset-password"
        : "nuntium://reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    console.log(">>> signOut called");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setRecovery(false);
  };

  const clearRecovery = () => setRecovery(false);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        recovery,
        signIn,
        signUp,
        resetPassword,
        signOut,
        clearRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
