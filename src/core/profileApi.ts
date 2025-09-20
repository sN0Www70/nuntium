import { supabase } from "./authClient";

export type Profile = {
  id: string;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  bio: string | null;
  class: string | null;
  school: string | null;
  interests: string[] | null;
  social_links: Record<string, string> | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

// --- PROFIL ---
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// --- FOLLOWERS ---
export async function countFollowers(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("followed_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function countFollowing(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function isFollowing(myId: string, otherId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", myId)
    .eq("followed_id", otherId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// --- FOLLOW (public accounts only) ---
export async function follow(myId: string, otherId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .insert([{ follower_id: myId, followed_id: otherId }]);
  if (error) throw error;
}

export async function unfollow(myId: string, otherId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", myId)
    .eq("followed_id", otherId);

  if (error) throw error;
}

// --- FOLLOW REQUESTS (for private accounts) ---
export async function requestFollow(myId: string, otherId: string): Promise<void> {
  const { error } = await supabase
    .from("follow_requests")
    .insert([{ requester_id: myId, target_id: otherId }]);
  if (error) throw error;
}

export async function hasRequested(myId: string, otherId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follow_requests")
    .select("id")
    .eq("requester_id", myId)
    .eq("target_id", otherId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function acceptFollow(requestId: string): Promise<void> {
  // récupérer la demande
  const { data, error } = await supabase
    .from("follow_requests")
    .delete()
    .eq("id", requestId)
    .select()
    .single();
  if (error) throw error;

  if (data) {
    // créer le vrai follow
    const { error: err2 } = await supabase
      .from("follows")
      .insert([{ follower_id: data.requester_id, followed_id: data.target_id }]);
    if (err2) throw err2;
  }
}

export async function rejectFollow(requestId: string): Promise<void> {
  const { error } = await supabase
    .from("follow_requests")
    .delete()
    .eq("id", requestId);
  if (error) throw error;
}
