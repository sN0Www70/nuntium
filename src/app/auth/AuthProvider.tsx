// deps
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../core/authClient";

// types
type SessionCtx = {
  session: any;
  loading: boolean;
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
};

// ctx
const AuthContext = createContext<SessionCtx>({
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

// hook
export function useSession() {
  return useContext(AuthContext);
}

// provider
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // init session + listener
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, data) => {
      setSession(data.session ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // sign in
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSession(data.session ?? null);
  };

  // sign up
  const signUp = async ({
    firstname,
    lastname,
    email,
    password,
    phone,
    school,
    join,
  }: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:8081/verified",
        data: { firstname, lastname, phone, school, join },
      },
    });
    if (error) throw error;
  };

  // reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:8081/reset-password",
    });
    if (error) throw error;
  };

  // sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, signIn, signUp, resetPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
