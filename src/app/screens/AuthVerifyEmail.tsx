// deps
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { H1, P, Button, LinkText } from "../../components/UI";
import { useNavigation, useRoute } from "@react-navigation/native";

// ui
export default function AuthVerifyEmail() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const email = route?.params?.email ?? "";

  function goLogin() {
    nav.reset({
      index: 0,
      routes: [{ name: "Login" as never }],
    });
  }

  function goRegister() {
    nav.reset({
      index: 0,
      routes: [{ name: "Register" as never }],
    });
  }

  return (
    <View style={s.wrap}>
      <Image source={require("../../../assets/logo.png")} style={s.logo} />
      <H1>Vérification</H1>
      <P style={{ textAlign: "center", marginTop: 8 }}>
        Un e-mail a été envoyé à {email || "votre adresse e-mail"}. Cliquez sur
        le lien pour confirmer.
      </P>
      <Button
        label="Retour connexion"
        onPress={goLogin}
        style={{ marginTop: 16 }}
      />
      <P style={{ marginTop: 10 }}>
        Pas reçu ? Vérifiez vos spams, ou{" "}
        <LinkText onPress={goRegister}>réessayez</LinkText>.
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
});
