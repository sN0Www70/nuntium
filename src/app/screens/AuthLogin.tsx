// deps
import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { H1, P, Input, Button, LinkText, ErrorText } from "../../components/UI";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../auth/AuthProvider";

// ui
export default function AuthLogin() {
  const nav = useNavigation();
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onLogin() {
    setErr(null);
    if (!email.trim() || !password) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }
    try {
      setBusy(true);
      await signIn(email.trim(), password);
    } catch (e: any) {
      setErr("E-mail ou mot de passe incorrect.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../../assets/logo.png")} style={styles.logo} />

      <H1>Se connecter</H1>
      <P style={{ marginBottom: 12 }}>
        Nouveau sur ce site ?{" "}
        <LinkText onPress={() => nav.navigate("Register" as never)}>
          S’inscrire
        </LinkText>
      </P>

      <Input
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <LinkText
        onPress={() => nav.navigate("ForgotPassword" as never)}
        style={{ alignSelf: "flex-start", marginTop: 8 }}
      >
        Mot de passe oublié ?
      </LinkText>

      {err && <ErrorText style={{ marginTop: 8 }}>{err}</ErrorText>}

      <Button
        label="Se connecter"
        onPress={onLogin}
        disabled={busy}
        style={{ marginTop: 12 }}
      />

      {/* Social login */}
      <View style={styles.socials}>
        <TouchableOpacity style={styles.socialItem}>
          <Image
            source={require("../../../assets/icons/facebook.png")}
            style={styles.socialIcon}
          />
          <P>Facebook</P>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialItem}>
          <Image
            source={require("../../../assets/icons/google.png")}
            style={styles.socialIcon}
          />
          <P>Google</P>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f3d1e",
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 8,
    resizeMode: "contain",
  },
  socials: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  socialItem: {
    alignItems: "center",
    marginHorizontal: 24,
  },
  socialIcon: {
    width: 28,
    height: 28,
    marginBottom: 6,
    resizeMode: "contain",
  },
});
