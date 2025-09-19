import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { H1, P, Input, Button, ErrorText } from "../../components/UI";
import { useSession } from "../auth/AuthProvider";
import { supabase } from "../../core/authClient";

export default function CompleteProfile({ navigation }: any) {
  const { session, signOut } = useSession();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [className, setClassName] = useState("");
  const [school, setSchool] = useState("");
  const [interests, setInterests] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setErr(null);
    if (!firstname.trim() || !lastname.trim() || !username.trim()) {
      setErr("Veuillez remplir prénom, nom et pseudo.");
      return;
    }

    try {
      setBusy(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          firstname,
          lastname,
          username,
          bio: bio || null,
          class: className || null,
          school: school || null,
          interests: interests
            ? interests.split(",").map((s) => s.trim())
            : [],
          social_links: socialLinks ? { link: socialLinks } : {},
          is_private: isPrivate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session?.user?.id);

      if (error) throw error;

      navigation.reset({
        index: 0,
        routes: [{ name: "App" }],
      });
    } catch (e: any) {
      setErr(e.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <H1>Compléter mon profil</H1>
      <P style={{ marginBottom: 16 }}>
        Remplissez ces informations pour finaliser votre inscription.
      </P>

      <Input placeholder="Prénom *" value={firstname} onChangeText={setFirstname} />
      <Input placeholder="Nom *" value={lastname} onChangeText={setLastname} />
      <Input placeholder="Pseudo *" value={username} onChangeText={setUsername} />
      <Input placeholder="Bio" value={bio} onChangeText={setBio} />
      <Input placeholder="Classe" value={className} onChangeText={setClassName} />
      <Input placeholder="École" value={school} onChangeText={setSchool} />
      <Input
        placeholder="Intérêts (séparés par virgule)"
        value={interests}
        onChangeText={setInterests}
      />
      <Input
        placeholder="Lien réseau social"
        value={socialLinks}
        onChangeText={setSocialLinks}
      />

      <View style={s.row}>
        <P>Profil privé</P>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>

      {err && <ErrorText style={{ marginTop: 8 }}>{err}</ErrorText>}

      <Button
        label="Valider"
        onPress={onSubmit}
        disabled={busy}
        style={{ marginTop: 16 }}
      />

      <Button
        label="Se déconnecter"
        onPress={signOut}
        style={{ marginTop: 16, backgroundColor: "#922" }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f3d1e",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
