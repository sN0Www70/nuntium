import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { P } from "../../components/UI";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useSession } from "../auth/AuthProvider";
import { supabase } from "../../core/authClient";
import {
  getProfile,
  countFollowers,
  countFollowing,
  isFollowing,
  follow,
  unfollow,
  Profile as ProfileType,
} from "../../core/profileApi";
import { FontAwesome } from "@expo/vector-icons";

type Known =
  | "instagram"
  | "twitter"
  | "linkedin"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "github"
  | "snapchat"
  | "discord"
  | "telegram"
  | "whatsapp"
  | "website"
  | "unknown";

function guessNetwork(url: string): Known {
  const u = url.toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("facebook.com")) return "facebook";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("github.com")) return "github";
  if (u.includes("snapchat.com")) return "snapchat";
  if (u.includes("discord.gg") || u.includes("discord.com")) return "discord";
  if (u.includes("t.me")) return "telegram";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.startsWith("http")) return "website";
  return "unknown";
}

const iconMap: Record<
  Known,
  { name: React.ComponentProps<typeof FontAwesome>["name"]; color?: string }
> = {
  instagram: { name: "instagram", color: "#C13584" },
  twitter: { name: "twitter", color: "#1DA1F2" },
  linkedin: { name: "linkedin-square", color: "#0A66C2" },
  tiktok: { name: "music", color: "#000" },
  facebook: { name: "facebook-square", color: "#1877F2" },
  youtube: { name: "youtube-play", color: "#FF0000" },
  github: { name: "github", color: "#000" },
  snapchat: { name: "snapchat-ghost", color: "#FFFC00" },
  discord: { name: "comments", color: "#5865F2" },
  telegram: { name: "send", color: "#2AABEE" },
  whatsapp: { name: "whatsapp", color: "#25D366" },
  website: { name: "globe", color: "#444" },
  unknown: { name: "external-link", color: "#444" },
};

export default function Profile() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { session } = useSession();

  const viewedUserId = route.params?.userId || session?.user?.id;
  const isMe = viewedUserId === session?.user?.id;

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [amFollowing, setAmFollowing] = useState(false);
  const [tab, setTab] = useState<"profile" | "posts">("profile");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    if (!viewedUserId) return;
    try {
      const [p, f1, f2] = await Promise.all([
        getProfile(viewedUserId),
        countFollowers(viewedUserId),
        countFollowing(viewedUserId),
      ]);
      setProfile(p);
      setFollowers(f1);
      setFollowing(f2);
      if (!isMe && session?.user?.id) {
        setAmFollowing(await isFollowing(session.user.id, viewedUserId));
      }
    } catch (e) {
      console.log("⚠️ load profile failed:", e);
    } finally {
      setLoading(false);
    }
  }, [viewedUserId, isMe, session?.user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleFollow() {
    if (!session?.user?.id || isMe) return;
    setBusy(true);
    try {
      if (amFollowing) {
        await unfollow(session.user.id, viewedUserId);
        setAmFollowing(false);
        setFollowers((x) => Math.max(0, x - 1));
      } else {
        await follow(session.user.id, viewedUserId);
        setAmFollowing(true);
        setFollowers((x) => x + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    (nav as any).reset({ index: 0, routes: [{ name: "Login" }] });
  }

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <P>Chargement du profil...</P>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[s.container, { justifyContent: "center", alignItems: "center" }]}>
        <P>Profil introuvable</P>
      </View>
    );
  }

  const links: string[] = Array.isArray(profile.social_links)
    ? profile.social_links.filter((u: any) => typeof u === "string")
    : profile.social_links && typeof profile.social_links === "object"
    ? Object.values(profile.social_links).filter((u: any) => typeof u === "string")
    : [];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- TOP BAR --- */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.iconBtn}>
            <FontAwesome name="bell" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={s.logoWrap}>
            <Image
              source={require("../../../assets/icon.png")}
              style={{ width: 28, height: 28, marginRight: 6 }}
            />
            <P style={s.logoText}>NUNTIUM</P>
          </View>

          <View style={s.rightMenu}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => setMenuOpen(prev => !prev)}
            >
              <FontAwesome name="bars" size={22} color="#fff" />
            </TouchableOpacity>
            
            {menuOpen && (
              <View style={s.dropdown}>
                <TouchableOpacity 
                  style={s.dropdownItem}
                  onPress={() => setMenuOpen(false)}
                >
                  <P>Paramètres</P>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={s.dropdownItem}
                  onPress={() => setMenuOpen(false)}
                >
                  <P>Mes favoris</P>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={s.dropdownItem}
                  onPress={() => setMenuOpen(false)}
                >
                  <P>Aide</P>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={s.dropdownItem} 
                  onPress={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <P style={{ color: "red" }}>Déconnexion</P>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* --- SEARCH BAR --- */}
        <View style={s.searchBar}>
          <TextInput
            placeholder="Rechercher..."
            placeholderTextColor="#999"
            style={s.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* --- COVER --- */}
        {profile.cover_url ? (
          <Image source={{ uri: profile.cover_url }} style={s.cover} />
        ) : (
          <View style={[s.cover, { backgroundColor: "#111" }]} />
        )}

        {/* --- HEADER (avatar + infos + actions) --- */}
        <View style={s.headerRow}>
          <Image
            source={
              profile.avatar_url
                ? { uri: profile.avatar_url }
                : require("../../../assets/icon.png")
            }
            style={s.avatar}
          />

          <View style={s.userInfo}>
            <P style={s.name}>
              {profile.firstname || ""} {profile.lastname || ""}
            </P>
            <P style={s.counts}>
              {followers} Abonné{followers > 1 ? "s" : ""} • {following} Abonnements
            </P>
          </View>

          <View style={s.actions}>
            {isMe ? (
              <TouchableOpacity 
                style={s.outlineBtn}
                onPress={() => nav.navigate('EditProfile' as never)}
              >
                <P style={s.btnTxt}>Modifier</P>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={s.outlineBtn}>
                  <P style={s.btnTxt}>Message</P>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.outlineBtn}
                  onPress={toggleFollow}
                  disabled={busy}
                >
                  <P style={s.btnTxt}>{amFollowing ? "Abonné(e)" : "S'abonner"}</P>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* --- TABS --- */}
        <View style={s.tabs}>
          <TouchableOpacity onPress={() => setTab("profile")} style={s.tabBtn}>
            <P style={[s.tabLabel, tab === "profile" && s.tabActive]}>Profil</P>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("posts")} style={s.tabBtn}>
            <P style={[s.tabLabel, tab === "posts" && s.tabActive]}>Publications</P>
          </TouchableOpacity>
        </View>

        {/* --- CONTENT --- */}
        {tab === "profile" ? (
          <View style={s.card}>
            {profile.bio ? (
              <View style={s.section}>
                <P style={s.lbl}>À propos</P>
                <P style={s.val}>{profile.bio}</P>
              </View>
            ) : null}

            {profile.class || profile.school ? (
              <View style={s.section}>
                <P style={s.lbl}>Classe / École</P>
                <P style={s.val}>
                  {[profile.class, profile.school].filter(Boolean).join(" • ")}
                </P>
              </View>
            ) : null}

            {links.length ? (
              <View style={s.section}>
                <P style={s.lbl}>Réseaux</P>
                <View style={s.socialWrap}>
                  {links.map((url, i) => {
                    const kind = guessNetwork(url);
                    const ic = iconMap[kind] || iconMap.unknown;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={s.socialPill}
                        onPress={() => Linking.openURL(url)}
                      >
                        <FontAwesome name={ic.name} size={18} color={ic.color || "#444"} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View style={s.section}>
              <P style={s.lbl}>A rejoint le</P>
              <P style={s.val}>
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "-"}
              </P>
            </View>
          </View>
        ) : (
          <View style={s.card}>
            <P>Publications à venir…</P>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, backgroundColor: "#fff" },

  // Top bar
  topBar: {
    height: 55,
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    zIndex: 10000,
    position: "relative",
  },
  logoWrap: { flexDirection: "row", alignItems: "center" },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  rightMenu: { 
    position: "relative",
    zIndex: 10000,
  },
  iconBtn: { padding: 6 },
  dropdown: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    paddingVertical: 6,
    minWidth: 160,
    zIndex: 99999,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12 },

  // Search
  searchBar: { backgroundColor: "#f0f0f0", padding: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  // Bannière
  cover: { width: "100%", height: 160 },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#ddd",
    marginRight: 12,
    marginTop: -40,
  },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#111" },
  counts: { marginTop: 4, fontSize: 14, color: "#666" },
  actions: { flexDirection: "row", gap: 8 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#2e7d32",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnTxt: { color: "#2e7d32", fontWeight: "600" },

  // Tabs
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  tabBtn: { paddingVertical: 10, marginHorizontal: 16 },
  tabLabel: { fontSize: 16, color: "#555" },
  tabActive: {
    fontWeight: "bold",
    color: "#111",
    borderBottomWidth: 2,
    borderColor: "#2e7d32",
  },

  // Card
  card: { backgroundColor: "#f9f9f9", margin: 16, borderRadius: 12, padding: 16 },
  section: { marginBottom: 16 },
  lbl: { fontWeight: "700", color: "#111", marginBottom: 4 },
  val: { color: "#444" },

  socialWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 12 },
  socialPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
});