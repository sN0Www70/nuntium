import { supabase } from "./authClient";

export type NotificationType = "follow";

export type NotificationRow = {
  id: string;
  type: NotificationType;
  actor_id: string;
  target_id: string;
  payload: Record<string, any>;
  read: boolean;
  created_at: string;
};

export async function insertNotification(
  type: NotificationType,
  actor_id: string,
  target_id: string,
  payload: Record<string, any> = {}
): Promise<NotificationRow | null> {
  if (actor_id === target_id) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert([{ type, actor_id, target_id, payload, read: false }])
    .select()
    .single();

  if (error) {
    console.log("🔔 insertNotification: insert error:", error);
    return null;
  }
  
  console.log("🔔 Notification inserted successfully:", data);
  return data;
}

export async function getNotifications(
  userId: string,
  { limit = 50, from = 0 }: { limit?: number; from?: number } = {}
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("target_id", userId)
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    console.log("🔔 getNotifications error:", error);
    return [];
  }
  return data || [];
}

export async function markAsRead(ids: string[]) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .in("id", ids);
  if (error) console.log("🔔 markAsRead error:", error);
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("target_id", userId)
    .eq("read", false);
  if (error) console.log("🔔 markAllAsRead error:", error);
}

export async function unreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("target_id", userId)
    .eq("read", false);

  if (error || count == null) {
    console.log("🔔 unreadCount error:", error);
    return 0;
  }
  return count;
}

export function subscribeToUserNotifications(
  userId: string,
  onInsert: (row: NotificationRow) => void
) {
  console.log("🔔 Creating realtime subscription for user:", userId);
  
  const channel = supabase
    .channel(`notif_user_${userId}`)
    .on(
      "postgres_changes",
      { 
        event: "INSERT", 
        schema: "public", 
        table: "notifications", 
        filter: `target_id=eq.${userId}` 
      },
      (payload: any) => {
        console.log("🔔 Realtime payload received:", payload);
        onInsert(payload.new as NotificationRow);
      }
    )
    .subscribe((status) => {
      console.log("🔔 Subscription status:", status);
    });

  return () => {
    console.log("🔔 Unsubscribing from realtime channel");
    supabase.removeChannel(channel);
  };
}