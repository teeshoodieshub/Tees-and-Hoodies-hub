import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applySession = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);

      if (!nextSession) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      if (!active) return;
      setIsAdmin(Boolean(data) && !error);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      applySession(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, isAdmin, loading };
}
