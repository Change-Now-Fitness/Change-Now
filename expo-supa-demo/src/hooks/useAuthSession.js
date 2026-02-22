import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Keeps track of the current logged-in user session.
export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load session:", error.message);
        }

        if (mounted) {
          setSession(data.session ?? null);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Unexpected session error:", error.message);
        if (mounted) {
          setLoading(false);
        }
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
