// deps
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../auth/AuthProvider";

// ui
export default function ForgotPassword() {
  const nav = useNavigation();
  const { resetPassword } = useSession();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSend = async () => {
    setMsg(null);
    if (!email) {
      setMsg("E-mail requis");
      return;
    }
    try {
      setBusy(true);
      await resetPassword(email.trim());
      setMsg("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    } catch (e: any) {
      setMsg(e?.message || "Erreur lors de l’envoi du lien.");
    } finally {
      setBusy(false);
    }
  };

  const goLogin = () => {
    nav.reset({
      index: 0,
      routes: [{ name: "Login" as never }],
    });
  };

  return (
    <View style={s.wrap}>
      <Image source={require("../../../assets/logo.png")} style={s.logo} />
      <Text style={s.h1}>Mot de passe oublié</Text>
      <TextInput
        style={s.input}
        placeholder="E-mail"
        placeholderTextColor="#9bb8a5"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        style={[s.btn, busy && { opacity: 0.5 }]}
        disabled={busy}
        onPress={onSend}
      >
        <Text style={s.btnText}>Envoyer le lien</Text>
      </TouchableOpacity>
      {msg ? <Text style={s.info}>{msg}</Text> : null}
      <Text style={s.link} onPress={goLogin}>
        Retour connexion
      </Text>
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
  logo: { width: 120, height: 120, resizeMode: "contain", marginBottom: 16 },
  h1: { fontSize: 26, color: "#fff", fontWeight: "800", marginBottom: 10 },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: {
    marginTop: 14,
    color: "#d7ffe7",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  info: { color: "#d7ffe7", marginTop: 10, textAlign: "center" },
});
