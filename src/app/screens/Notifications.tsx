import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { useSession } from "../auth/AuthProvider";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  NotificationRow,
  subscribeToUserNotifications,
} from "../../core/notificationsApi";
import { P } from "../../components/UI";
import { useNotifications } from "../notifications/NotificationProvider";

export default function NotificationsScreen() {
  const nav = useNavigation();
  const { session } = useSession();
  const { reloadUnread } = useNotifications();
  const userId = session?.user?.id;

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getNotifications(userId, { limit: 100 });
    setItems(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      reloadUnread();
    }, [reloadUnread])
  );

  useEffect(() => {
    if (!userId) return;
    const unsub = subscribeToUserNotifications(userId, (row) => {
      setItems((prev) => [row, ...prev]);
    });
    return unsub;
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    await reloadUnread();
    setRefreshing(false);
  };

  const openNotif = async (n: NotificationRow) => {
    if (!n.read) {
      await markAsRead([n.id]);
      setItems(prev => 
        prev.map(item => 
          item.id === n.id ? { ...item, read: true } : item
        )
      );
      await reloadUnread();
    }
    
    if (n.type === "follow") {
      nav.navigate("App" as never, {
        screen: "Profile",
        params: { userId: n.actor_id },
      } as never);
    }
  };

  const markAll = async () => {
    if (!userId) return;
    await markAllAsRead(userId);
    setItems(prev => prev.map(item => ({ ...item, read: true })));
    await reloadUnread();
  };

  const renderItem = ({ item }: { item: NotificationRow }) => {
    const isUnread = !item.read;
    const avatarUrl = item.payload?.actor_avatar as string | undefined;

    return (
      <TouchableOpacity
        style={[s.row, isUnread && s.rowUnread]}
        onPress={() => openNotif(item)}
      >
        <Image
          source={avatarUrl ? { uri: avatarUrl } : require("../../../assets/icon.png")}
          style={s.avatar}
        />
        <View style={{ flex: 1 }}>
          {item.type === "follow" ? (
            <P style={[s.title, isUnread && s.titleUnread]}>
              {(item.payload?.actor_name || "Quelqu'un") + " s'est abonné à vous"}
            </P>
          ) : (
            <P style={[s.title, isUnread && s.titleUnread]}>
              Nouvelle notification
            </P>
          )}
          <P style={s.time}>{new Date(item.created_at).toLocaleString()}</P>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <P style={s.headerTitle}>Notifications</P>
        <TouchableOpacity onPress={markAll}>
          <P style={{ color: "#fff", fontSize: 14 }}>Tout lire</P>
        </TouchableOpacity>
      </View>

      {/* LISTE */}
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? <P style={s.empty}>Aucune notification pour l'instant</P> : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2e7d32",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backBtn: { padding: 6 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  rowUnread: { backgroundColor: "#f3f8f3" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  title: { fontSize: 14, color: "#111" },
  titleUnread: { fontWeight: "700" },
  time: { fontSize: 12, color: "#666", marginTop: 2 },
  empty: { padding: 16, color: "#666" },
});