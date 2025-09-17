// deps
import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Image, Platform } from "react-native";
import { H1, P, Input, Button, ErrorText, LinkText } from "../../components/UI";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../../core/authClient";

// helper
function useQueryParam(name: string) {
  const route = useRoute<any>();
  const url: string | undefined = route?.params?.initialUrl || route?.params?.url;

  return useMemo(() => {
    try {
      const raw =
        url ?? (Platform.OS === "web" ? window.location.href : "http://localhost");
      const u = new URL(raw);

      return (
        u.searchParams.get(name) ||
        u.hash.split(`${name}=`)[1]?.split("&")[0] ||
        null
      );
    } catch {
      return null;
    }
  }, [url, name]);
}

// ui
export default function ResetPassword() {
  const nav = useNavigation();
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const accessToken = useQueryParam("access_token");
  const refreshToken = useQueryParam("refresh_token");

  useEffect(() => {
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [accessToken, refreshToken]);

  async function onSubmit() {
    setErr(null);
    if (!pwd1 || pwd1.length < 8) {
      setErr("Mot de passe trop court (min. 8 caractères).");
      return;
    }
    if (pwd1 !== pwd2) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      setBusy(true);
      const { error } = await supabase.auth.updateUser({ password: pwd1 });
      if (error) throw error;
      setOk(true);
    } catch (e: any) {
      setErr(e?.message || "Impossible de mettre à jour le mot de passe.");
    } finally {
      setBusy(false);
    }
  }

  async function goLogin() {
    await supabase.auth.signOut();
    nav.reset({
      index: 0,
      routes: [{ name: "Login" as never }],
    });
  }

  return (
    <View style={s.wrap}>
      <Image source={require("../../../assets/logo.png")} style={s.logo} />
      <H1>Réinitialiser</H1>
      {ok ? (
        <>
          <P style={{ textAlign: "center", marginTop: 8 }}>
            Mot de passe mis à jour. Vous pouvez maintenant vous connecter.
          </P>
          <Button label="Aller à la connexion" onPress={goLogin} style={{ marginTop: 16 }} />
        </>
      ) : (
        <>
          <P style={{ textAlign: "center", marginTop: 8 }}>
            Saisissez votre nouveau mot de passe (via le lien sécurisé reçu).
          </P>
          <Input
            placeholder="Nouveau mot de passe"
            value={pwd1}
            onChangeText={setPwd1}
            secureTextEntry
          />
          <Input
            placeholder="Confirmer le mot de passe"
            value={pwd2}
            onChangeText={setPwd2}
            secureTextEntry
          />
          {err && <ErrorText style={{ marginTop: 8 }}>{err}</ErrorText>}
          <Button
            label="Changer mon mot de passe"
            onPress={onSubmit}
            disabled={busy}
            style={{ marginTop: 12 }}
          />
          <LinkText onPress={goLogin} style={{ marginTop: 10 }}>
            Retour connexion
          </LinkText>
        </>
      )}
    </View>
  );
}

// styles
const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#0f3d1e",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: { width: 96, height: 96, resizeMode: "contain", marginBottom: 8 },
});
