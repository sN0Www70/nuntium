import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { AppState } from "react-native";
import { useSession } from "../auth/AuthProvider";
import {
  unreadCount,
  NotificationRow,
} from "../../core/notificationsApi";
import { supabase } from "../../core/authClient";
import NotificationToast from "../../components/NotificationToast";
import { navigationRef } from "../navigation/RootNavigator";

type NotificationContextType = {
  unread: number;
  reloadUnread: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  unread: 0,
  reloadUnread: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const lastCheckRef = useRef<string>(new Date().toISOString());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reloadUnread = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const n = await unreadCount(session.user.id);
      setUnread(n);
      console.log("🔔 Unread count updated:", n);
    } catch (error) {
      console.error("❌ Error reloading unread count:", error);
    }
  }, [session?.user?.id]);

  const checkForNewNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("target_id", session.user.id)
        .gt("created_at", lastCheckRef.current)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error checking new notifications:", error);
        return;
      }

      if (data && data.length > 0) {
        console.log("🔔 Found new notifications via polling:", data);

        data.forEach((row: NotificationRow) => {
          let message: string | null = null;

          if (row.type === "follow") {
            message = `${row.payload?.actor_name || "Quelqu'un"} s'est abonné à vous`;
          } else if (row.type === "follow_request") {
            message = `${row.payload?.actor_name || "Quelqu'un"} veut s'abonner à vous`;
          }

          if (message) {
            console.log("🔔 Showing toast:", message);
            setToast(message);
          }
        });

        setUnread((prev) => prev + data.length);

        lastCheckRef.current = data[0].created_at;
      }
    } catch (error) {
      console.error("❌ Error in polling:", error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        checkForNewNotifications();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [checkForNewNotifications]);

  useEffect(() => {
    if (!session?.user?.id) {
      setUnread(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // compteur initial
    reloadUnread();

    // timestamp
    lastCheckRef.current = new Date().toISOString();

    console.log("🔔 Setting up polling for user:", session.user.id);

    // polling toutes les 10 secondes
    intervalRef.current = setInterval(() => {
      checkForNewNotifications();
    }, 10000);

    return () => {
      console.log("🔔 Cleaning up polling interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session?.user?.id, reloadUnread, checkForNewNotifications]);

  return (
    <NotificationContext.Provider value={{ unread, reloadUnread }}>
      {children}

      {toast && (
        <NotificationToast
          message={toast}
          onPress={() => {
            setToast(null);
            navigationRef.current?.navigate("Notifications" as never);
          }}
          onHide={() => setToast(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}
