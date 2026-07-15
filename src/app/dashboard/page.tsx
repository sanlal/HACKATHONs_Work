"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Leaf,
  LogOut,
  UserRound,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  initialWorkDemoState,
  WORK_DEMO_STORAGE_KEY,
  type WorkDemoState,
} from "@/lib/work-demo";

type DemoProfile = {
  displayName: string;
  city: string;
  area?: string;
  language: string;
  capabilities: string[];
};

const defaultProfile: DemoProfile = {
  displayName: "Demo Community Member",
  city: "Hyderabad",
  language: "en",
  capabilities: ["worker", "employer"],
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DemoProfile>(defaultProfile);
  const [workState, setWorkState] = useState<WorkDemoState>(initialWorkDemoState);

  useEffect(() => {
    const savedProfile = localStorage.getItem("jeevandwaar-demo-profile");
    const savedWork = localStorage.getItem(WORK_DEMO_STORAGE_KEY);

    try {
      if (savedProfile) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(JSON.parse(savedProfile) as DemoProfile);
      }
      if (savedWork) {
        setWorkState(JSON.parse(savedWork) as WorkDemoState);
      }
    } catch {
      localStorage.removeItem("jeevandwaar-demo-profile");
      localStorage.removeItem(WORK_DEMO_STORAGE_KEY);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    async function loadRemoteProfile() {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: saved } = await supabase
        .from("profiles")
        .select("display_name, city, area, preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      const { data: capabilities } = await supabase
        .from("user_capabilities")
        .select("capability")
        .eq("user_id", user.id);

      if (saved) {
        setProfile({
          displayName: saved.display_name,
          city: saved.city,
          area: saved.area ?? undefined,
          language: saved.preferred_language,
          capabilities:
            capabilities?.map((item: { capability: string }) => item.capability) ?? [],
        });
      }
    }

    void loadRemoteProfile();
  }, []);

  const summary = useMemo(() => {
    const applications = workState.jobs.flatMap((job) => job.applications);
    return {
      openJobs: workState.jobs.filter((job) => job.status === "open").length,
      applications: applications.length,
      completed: workState.jobs.filter((job) => job.status === "completed").length,
    };
  }, [workState]);

  async function signOut() {
    localStorage.removeItem("jeevandwaar-demo-profile");
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const cards = [
    {
      href: "/work",
      icon: BriefcaseBusiness,
      title: "Local work",
      detail: `${summary.openJobs} open jobs · ${summary.applications} applications`,
      action: "Open marketplace",
    },
    {
      href: "/produce",
      icon: Leaf,
      title: "Farmer market",
      detail: "Produce bidding workflow arrives on Day 3.",
      action: "View preview",
    },
    {
      href: "/books",
      icon: BookOpen,
      title: "Books for all",
      detail: "Sale and donation workflow arrives on Day 4.",
      action: "View preview",
    },
  ];

  return (
    <main className="shell min-h-[76vh] py-12 lg:py-18">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div>
          <p className="eyebrow mb-3">Your doorway</p>
          <h1 className="section-title">Namaste, {profile.displayName}.</h1>
          <p className="mt-4 text-[#557089]">
            {profile.area ? `${profile.area}, ` : ""}
            {profile.city} · {profile.language === "te" ? "తెలుగు" : "English"}
          </p>
        </div>
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-[#c9d7d1] bg-white px-5 py-3 text-sm font-bold"
          onClick={signOut}
          type="button"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Open jobs", summary.openJobs],
          ["Applications", summary.applications],
          ["Completed", summary.completed],
        ].map(([label, value]) => (
          <div className="card p-6" key={label}>
            <p className="text-sm font-semibold text-[#557089]">{label}</p>
            <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {cards.map(({ href, icon: Icon, title, detail, action }) => (
          <Link
            className="card focus-ring group p-6 transition hover:-translate-y-1"
            href={href}
            key={href}
          >
            <Icon className="text-[#177245]" size={27} />
            <h2 className="mt-6 text-xl font-bold">{title}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#557089]">{detail}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#177245]">
              {action} <ArrowRight className="transition group-hover:translate-x-1" size={16} />
            </span>
          </Link>
        ))}
      </section>

      <section className="card mt-10 grid gap-7 p-7 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <span className="grid size-11 place-items-center rounded-xl bg-[#eef7f1] text-[#177245]">
            <UserRound size={21} />
          </span>
          <h2 className="mt-5 text-xl font-bold">Profile capabilities</h2>
          <p className="mt-3 text-sm leading-6 text-[#557089]">
            One profile can participate in more than one marketplace.
          </p>
          <Link
            className="focus-ring mt-5 inline-block rounded text-sm font-bold text-[#177245]"
            href="/onboarding"
          >
            Update profile
          </Link>
        </div>
        <div className="flex flex-wrap content-start gap-2">
          {profile.capabilities.map((capability) => (
            <span
              className="rounded-full border border-[#b9ddc5] bg-[#eef7f1] px-4 py-2 text-sm font-bold capitalize text-[#11663b]"
              key={capability}
            >
              {capability.replace("_", " ")}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
