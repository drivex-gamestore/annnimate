import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; 

export function useAuthSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function fetchUser() {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error || !authUser) {
          setUser(null);
          return;
        }
        
        const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single();
        
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: userData?.name || userData?.display_name || authUser.email?.split("@")[0] || "User",
          avatarUrl: userData?.avatar_url,
          avatarIndex: userData?.avatar_index || 0,
          subscriptionStatus: userData?.subscription_status || "free",
          hasAccess: userData?.has_access || false
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    hasAccess: !loading && (user?.hasAccess || false),
    isAuthenticated: !loading && !!user
  };
}
