"use client";

import Link from "next/link";
import { DoorOpen, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const { language, setLanguage, text } = useLanguage();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const hasDemo = Boolean(localStorage.getItem("jeevandwaar-demo-profile"));
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => setSignedIn(hasDemo));
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user) || hasDemo);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session) || hasDemo);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b border-[#dce5e1] bg-white/85 backdrop-blur">
      <div className="shell flex min-h-18 items-center justify-between gap-4">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-lg font-extrabold tracking-[-0.03em]"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#177245] text-white">
            <DoorOpen aria-hidden="true" size={22} />
          </span>
          <span className="hidden text-xl sm:inline">
            Jeevan<span className="text-[#177245]">Dwaar</span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 text-sm font-semibold lg:flex"
        >
          <Link className="focus-ring rounded" href="/work">
            {text("work")}
          </Link>
          <Link className="focus-ring rounded" href="/produce">
            {text("produce")}
          </Link>
          <Link className="focus-ring rounded" href="/books">
            {text("books")}
          </Link>
          <Link className="focus-ring rounded" href="/dashboard">
            {text("dashboard")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs font-bold sm:gap-2">
            <Languages aria-hidden="true" size={16} />
            <span className="sr-only">{text("language")}</span>
            <select
              aria-label={text("language")}
              className="rounded-full border border-[#c9d7d1] bg-white px-3 py-2"
              onChange={(event) =>
                setLanguage(event.target.value as "en" | "te")
              }
              value={language}
            >
              <option value="en">EN</option>
              <option value="te">తెలుగు</option>
            </select>
          </label>
          <Link
            href={signedIn ? "/dashboard" : "/login"}
            className="focus-ring rounded-full bg-[#102a43] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#177245] sm:px-5"
          >
            {signedIn ? text("dashboard") : text("signIn")}
          </Link>
        </div>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="shell flex gap-5 overflow-x-auto border-t border-[#edf2ef] py-3 text-xs font-bold lg:hidden"
      >
        <Link className="focus-ring shrink-0 rounded" href="/work">
          {text("work")}
        </Link>
        <Link className="focus-ring shrink-0 rounded" href="/produce">
          {text("produce")}
        </Link>
        <Link className="focus-ring shrink-0 rounded" href="/books">
          {text("books")}
        </Link>
        <Link className="focus-ring shrink-0 rounded" href="/dashboard">
          {text("dashboard")}
        </Link>
      </nav>
    </header>
  );
}
