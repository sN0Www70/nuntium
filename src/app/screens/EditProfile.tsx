import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../core/authClient";
import { useSession } from "../auth/AuthProvider";
import { Button } from "../../components/UI";

export default function EditProfile({ navigation }: any) {
  const { session } = useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [className, setClassName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false); // 🔥 confidentialité

  const [socialUrls, setSocialUrls] = useState<string[]>([]);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Charger le profil existant
  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "firstname, lastname, username, bio, school, class, avatar_url, cover_url, social_links, is_private"
          )
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setFirstname(data?.firstname ?? "");
        setLastname(data?.lastname ?? "");
        setUsername(data?.username ?? "");
        setBio(data?.bio ?? "");
        setSchool(data?.school ?? "");
        setClassName(data?.class ?? "");
        setAvatarUrl(data?.avatar_url ?? null);
        setCoverUrl(data?.cover_url ?? null);
        setIsPrivate(data?.is_private ?? false); // 🔥

        const links: string[] = Array.isArray(data?.social_links)
          ? data.social_links.filter((u: any) => typeof u === "string")
          : data?.social_links && typeof data.social_links === "object"
          ? Object.values(data.social_links).filter((u: any) => typeof u === "string")
          : [];
        setSocialUrls(links);
      } catch (e) {
        console.log("⚠️ load profile failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  // Vérification pseudo unique
  async function checkUsernameAvailability(username: string): Promise<boolean> {
    if (!username.trim()) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim().toLowerCase())
      .neq("id", user?.id) // exclure mon propre profil
      .maybeSingle();

    return !data && !error;
  }

  // Vérif live quand on tape un pseudo
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!username.trim()) {
        setUsernameAvailable(null);
        return;
      }
      const available = await checkUsernameAvailability(username);
      setUsernameAvailable(available);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Upload avatar / cover
  const handleImagePick = async (type: "avatar" | "cover") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: type === "avatar" ? [1, 1] : [3, 1],
        quality: 0.8,
      });

      if (!result.canceled && user?.id) {
        const asset = result.assets[0];
        const filePath = `${user.id}/${type}.jpg`;
        const bucket = type === "avatar" ? "avatars" : "covers";

        await supabase.storage.from(bucket).remove([filePath]);

        let uploadData;
        let contentType = "image/jpeg";

        const response = await fetch(asset.uri);
        if (Platform.OS === "web") {
          const blob = await response.blob();
          uploadData = blob;
          contentType = blob.type || "image/jpeg";
        } else {
          const arrayBuffer = await response.arrayBuffer();
          uploadData = arrayBuffer;
        }

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, uploadData, {
            contentType,
            upsert: true,
          });

        if (error) {
          alert(`Erreur upload: ${error.message}`);
          return;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

        if (type === "avatar") setAvatarUrl(publicUrl);
        else setCoverUrl(publicUrl);
      }
    } catch (err) {
      alert(`Erreur: ${err}`);
    }
  };

  // Gestion des réseaux
  const addSocial = () => setSocialUrls((arr) => [...arr, ""]);
  const updateSocial = (idx: number, value: string) => {
    setSocialUrls((arr) => arr.map((v, i) => (i === idx ? value : v)));
  };
  const removeSocial = (idx: number) => {
    setSocialUrls((arr) => arr.filter((_, i) => i !== idx));
  };

  // Sauvegarde
  const handleSave = async () => {
    if (!user) return;

    if (!usernameAvailable) {
      Alert.alert("Pseudo déjà pris", "Choisissez un autre pseudo.");
      return;
    }

    try {
      const updates: any = {
        firstname,
        lastname,
        username: username.trim().toLowerCase(),
        bio,
        school,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        is_private: isPrivate, // 🔥 enregistrement
        updated_at: new Date().toISOString(),
        social_links: socialUrls.map((s) => s.trim()).filter(Boolean),
      };
      if (className) updates["class"] = className;

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;

      navigation.goBack();
    } catch (e) {
      alert("Erreur lors de la mise à jour du profil !");
    }
  };

  // Loading
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  // UI
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Modifier mon profil</Text>

      {/* Avatar */}
      <TouchableOpacity style={styles.imagePicker} onPress={() => handleImagePick("avatar")}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <Text style={{ color: "#666" }}>Choisir une photo de profil</Text>
        )}
      </TouchableOpacity>

      {/* Bannière */}
      <TouchableOpacity style={styles.imagePicker} onPress={() => handleImagePick("cover")}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.cover} />
        ) : (
          <Text style={{ color: "#666" }}>Choisir une bannière</Text>
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <TextInput placeholder="Prénom" style={styles.input} value={firstname} onChangeText={setFirstname} />
      <TextInput placeholder="Nom" style={styles.input} value={lastname} onChangeText={setLastname} />
      <TextInput placeholder="Pseudo" style={styles.input} value={username} onChangeText={setUsername} />

      {username.length > 0 && (
        <Text
          style={{
            color: usernameAvailable ? "green" : "red",
            marginBottom: 12,
            fontWeight: "600",
          }}
        >
          {usernameAvailable === null
            ? ""
            : usernameAvailable
            ? "✅ Disponible"
            : "❌ Déjà pris"}
        </Text>
      )}

      <TextInput
        placeholder="Bio"
        style={[styles.input, { height: 90 }]}
        multiline
        value={bio}
        onChangeText={setBio}
      />
      <TextInput placeholder="École" style={styles.input} value={school} onChangeText={setSchool} />
      <TextInput placeholder="Classe" style={styles.input} value={className} onChangeText={setClassName} />

      {/* Confidentialité */}
      <View style={styles.privacyRow}>
        <Text style={styles.privacyLabel}>Compte privé</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>

      {/* Réseaux sociaux */}
      <View style={{ marginTop: 8 }}>
        <Button label="+ Ajouter un réseau" onPress={addSocial} variant="outline" />

        {socialUrls.map((url, idx) => (
          <View key={idx} style={styles.socialRow}>
            <TextInput
              placeholder="Colle un lien (Instagram, X, LinkedIn, TikTok…)"
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={url}
              onChangeText={(v) => updateSocial(idx, v)}
              autoCapitalize="none"
            />
            <Button
              label="×"
              onPress={() => removeSocial(idx)}
              variant="danger"
              style={{ width: 44, marginTop: 0 }}
            />
          </View>
        ))}
      </View>

      {/* Actions */}
      <Button
        label="Sauvegarder"
        onPress={handleSave}
        variant="primary"
        disabled={usernameAvailable === false}
      />
      <Button label="Annuler" onPress={() => navigation.goBack()} variant="danger" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2e7d32",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  cover: { width: "100%", height: 140, borderRadius: 12 },
  socialRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  privacyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  privacyLabel: { fontSize: 16, color: "#111", fontWeight: "600" },
});
