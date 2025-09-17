// deps
import React from "react";
import { View, StyleSheet } from "react-native";
import { H1, P, Button } from "../../components/UI";
import { useSession } from "../auth/AuthProvider";

export default function Profile() {
  const { session, signOut } = useSession();

  // user metadata
  const user = session?.user;
  const email = user?.email ?? "—";
  const firstname = user?.user_metadata?.firstname ?? "";
  const lastname = user?.user_metadata?.lastname ?? "";

  return (
    <View style={s.wrap}>
      <H1>Mon profil</H1>

      <P style={{ marginTop: 12 }}>Nom : {lastname || "?"}</P>
      <P>Prénom : {firstname || "?"}</P>
      <P>Email : {email}</P>

      <Button
        label="Se déconnecter"
        onPress={async () => {
          console.log(">>> signOut called"); // debug
          await signOut();
          console.log(">>> après signOut, session =", session);
        }}
        style={{ marginTop: 24 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f3d1e",
  },
});
