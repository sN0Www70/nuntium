// deps
import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { H1, Input, Button, LinkText, P, ErrorText, Checkbox } from "../../components/UI";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../auth/AuthProvider";
import { Picker } from "@react-native-picker/picker";

// ui
export default function AuthRegister() {
  const nav = useNavigation();
  const { signUp } = useSession();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState<string>("");
  const [password, setPassword] = useState("");
  const [join, setJoin] = useState(true);
  const [accept, setAccept] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const strong = (v: string) =>
    v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v);

  async function onRegister() {
    setErr(null);
    if (!firstname.trim() || !lastname.trim() || !email.trim() || !password) {
      setErr("Tous les champs sont obligatoires.");
      return;
    }
    if (!strong(password)) {
      setErr("Mot de passe faible (8+, maj, min, chiffre).");
      return;
    }
    if (!accept) {
      setErr("Merci d’accepter la politique de confidentialité.");
      return;
    }
    try {
      setBusy(true);
      await signUp({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        password,
        phone,
        school,
        join,
      });
      nav.navigate("VerifyEmail" as never, { email: email.trim() } as never);
    } catch (e: any) {
      setErr(e?.message || "Erreur lors de l’inscription.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.wrap}>
      <Image source={require("../../../assets/logo.png")} style={s.logo} />
      <H1>Inscription</H1>

      <Input placeholder="Prénom" value={firstname} onChangeText={setFirstname} />
      <Input placeholder="Nom de famille" value={lastname} onChangeText={setLastname} />
      <Input
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        placeholder="Téléphone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Input
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={s.pickerBox}>
        <Picker
          selectedValue={school}
          onValueChange={(v) => setSchool(v)}
          style={s.picker}
        >
          <Picker.Item label="Choisissez une école" value="" />
          <Picker.Item label="INSA" value="INSA" />
          <Picker.Item label="EPITA" value="EPITA" />
          <Picker.Item label="HEC" value="HEC" />
        </Picker>
      </View>

      <Checkbox label="Rejoindre la communauté" value={join} onChange={setJoin} />
      <Checkbox
        label="J’accepte la politique de confidentialité"
        value={accept}
        onChange={setAccept}
      />

      {err && <ErrorText style={{ marginTop: 8 }}>{err}</ErrorText>}
      <Button
        label="Créer un compte"
        onPress={onRegister}
        disabled={busy}
        style={{ marginTop: 12 }}
      />

      <P style={{ marginTop: 10 }}>
        Déjà un compte ?{" "}
        <LinkText onPress={() => nav.navigate("Login" as never)}>
          Se connecter
        </LinkText>
      </P>
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
  pickerBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 12,
    overflow: "hidden",
  },
  picker: { width: "100%", height: 48 },
});
