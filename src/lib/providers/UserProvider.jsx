"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { createClient } from "@/shared/supabaseClient"; 
import { trackRetention, analytics } from "@lib/analytics/analytics";

function normalizeValue(value) {
  return value === undefined ? null : value;
}

function extractPostHogProperties(profile, user = null) {
  let data = profile || {};
  return {
    created_at: normalizeValue(data.created_at || (user?.created_at)),
    has_access: !!data.has_access,
    is_paying: !!data.has_access,
    plan_name: normalizeValue(data.plan_name),
    subscription_status: normalizeValue(data.subscription_status),
    is_lifetime: !!data.is_lifetime,
    is_legacy_user: !!data.is_legacy_user,
    is_partner: !!data.is_partner,
    is_super_admin: !!data.is_super_admin,
    founding_member_since: normalizeValue(data.founding_member_since),
    current_team_id: normalizeValue(data.current_team_id),
    onboarding_completed: !!data.onboarding_completed,
    preferred_platform: normalizeValue(data.preferred_platform),
    ft_source: normalizeValue(data.ft_source),
    ft_medium: normalizeValue(data.ft_medium),
    ft_campaign: normalizeValue(data.ft_campaign),
    ft_channel: normalizeValue(data.ft_channel),
    ft_at: normalizeValue(data.ft_at)
  };
}

function syncPostHogIdentity(distinctId, profile, user) {
  let ph = window.posthog;
  if (!ph || typeof ph.identify !== "function") return;
  
  let properties = extractPostHogProperties(profile, user);
  
  if (typeof ph.get_distinct_id === "function" && ph.get_distinct_id() === distinctId) {
    if (typeof ph.setPersonProperties === "function") {
      ph.setPersonProperties(properties);
    }
  } else {
    ph.identify(distinctId, properties);
  }
}

const UserContext = createContext({
  user: null,
  profile: null,
  loading: true,
  hasAccess: false,
  isAuthenticated: false,
  updateProfile: async () => {},
  refreshProfile: async () => {}
});

export function UserProvider({ children, initialUser = null, initialProfile = null }) {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  const fetchUser = async () => {
    try {
      let { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      setUser(authUser);
      
      let { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
        syncPostHogIdentity(authUser.id, profileData, authUser);
      }
      
      if (authUser.created_at) {
        trackRetention(authUser.id, authUser.created_at);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: "No user logged in" };
    
    setProfile(prev => ({ ...prev, ...updates }));
    
    try {
      let { data: updatedProfile, error } = await supabase
        .from("users")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setProfile(updatedProfile);
      analytics.user.profileUpdated(Object.keys(updates || {}));
      
      if (updates && updates.theme_preference) {
        analytics.user.themeChanged(updates.theme_preference);
      }
      
      if (window.posthog?.setPersonProperties) {
        window.posthog.setPersonProperties(extractPostHogProperties(updatedProfile, user));
      }
      
      return { data: updatedProfile, error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfile(profile);
      return { data: null, error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        let { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchUser();
    
    let { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        let provider;
        (function trackSignIn(userId, authProvider) {
          if (userId) {
            try {
              let sessionKey = `anm_signed_in:${userId}`;
              if (sessionStorage.getItem(sessionKey)) return;
              sessionStorage.setItem(sessionKey, "1");
            } catch (e) {}
            analytics.user.signedIn(authProvider);
          }
        })(
          session?.user?.id, 
          (provider = session?.user?.app_metadata?.provider) && provider !== "email" ? provider : "magic_link"
        );
        fetchUser();
      } else if (event === "TOKEN_REFRESHED") {
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            let key = sessionStorage.key(i);
            if (key && key.startsWith("anm_signed_in:")) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) {}
        analytics.user.signedOut();
        analytics.reset();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    let channel = supabase
      .channel(`user_profile_${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: `id=eq.${user.id}`
      }, (payload) => {
        setProfile(payload.new);
        syncPostHogIdentity(user.id, payload.new, user);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  let hasAccess = !loading && (profile?.has_access || false);
  let isAuthenticated = !loading && !!user;

  return (
    <UserContext.Provider value={{
      user,
      profile,
      loading,
      hasAccess,
      isAuthenticated,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


