"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./client";
import type {
  ProfileRow,
  UserCapability,
  WorkerProfileRow,
} from "./database.types";

export type MarketplaceSession =
  | { loading: true; mode: "checking"; userId: null; profile: null }
  | {
      loading: false;
      mode: "demo";
      userId: null;
      profile: null;
      capabilities: UserCapability[];
      workerProfile: null;
    }
  | {
      loading: false;
      mode: "live";
      userId: string;
      profile: ProfileRow;
      capabilities: UserCapability[];
      workerProfile: WorkerProfileRow | null;
    };

export function useMarketplaceSession(): MarketplaceSession {
  const [session, setSession] = useState<MarketplaceSession>({
    loading: true,
    mode: "checking",
    userId: null,
    profile: null,
  });

  useEffect(() => {
    let active = true;

    async function resolveSession() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) {
          setSession({
            loading: false,
            mode: "demo",
            userId: null,
            profile: null,
            capabilities: [],
            workerProfile: null,
          });
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;

      if (!user) {
        setSession({
          loading: false,
          mode: "demo",
          userId: null,
          profile: null,
          capabilities: [],
          workerProfile: null,
        });
        return;
      }

      const [profileResult, capabilitiesResult, workerResult] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("user_capabilities")
            .select("capability")
            .eq("user_id", user.id),
          supabase
            .from("worker_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      if (!active) return;
      if (profileResult.error || !profileResult.data) {
        setSession({
          loading: false,
          mode: "demo",
          userId: null,
          profile: null,
          capabilities: [],
          workerProfile: null,
        });
        return;
      }

      setSession({
        loading: false,
        mode: "live",
        userId: user.id,
        profile: profileResult.data,
        capabilities:
          capabilitiesResult.data?.map((item) => item.capability) ?? [],
        workerProfile: workerResult.data,
      });
    }

    void resolveSession();
    return () => {
      active = false;
    };
  }, []);

  return session;
}
