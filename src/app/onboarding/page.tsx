"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Building2,
  Check,
  Leaf,
  ShoppingBasket,
  UserRound,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const capabilities = [
  { value: "worker", icon: UserRound, title: "Find work", detail: "Offer skills and services." },
  { value: "employer", icon: Building2, title: "Hire locally", detail: "Post clear, fair-paying work." },
  { value: "farmer", icon: Leaf, title: "Sell produce", detail: "Compare direct buyer bids." },
  { value: "produce_buyer", icon: ShoppingBasket, title: "Buy produce", detail: "Place transparent offers." },
  { value: "book_owner", icon: BookOpen, title: "Share books", detail: "Sell or donate useful books." },
  { value: "book_requester", icon: BookOpen, title: "Find books", detail: "Request affordable books." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [area, setArea] = useState("");
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [selected, setSelected] = useState<string[]>(["worker"]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleCapability(value: string) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selected.length === 0) {
      setMessage("Choose at least one way to use JeevanDwaar.");
      return;
    }

    setBusy(true);
    setMessage("");
    const profile = {
      displayName: displayName.trim() || "Demo Community Member",
      city: city.trim(),
      area: area.trim(),
      language,
      capabilities: selected,
    };
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      localStorage.setItem("jeevandwaar-demo-profile", JSON.stringify(profile));
      router.push("/dashboard");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Sign in before saving your profile.");
      setBusy(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: profile.displayName,
      city: profile.city,
      area: profile.area || null,
      preferred_language: profile.language,
    });

    if (profileError) {
      setMessage(profileError.message);
      setBusy(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("user_capabilities")
      .delete()
      .eq("user_id", user.id);

    const { error: capabilityError } = deleteError
      ? { error: deleteError }
      : await supabase.from("user_capabilities").insert(
          selected.map((capability) => ({
            user_id: user.id,
            capability,
          })),
        );

    if (capabilityError) {
      setMessage(capabilityError.message);
      setBusy(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="shell min-h-[72vh] py-14 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-4">Welcome to JeevanDwaar</p>
        <h1 className="section-title">Create one profile for every opportunity.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#557089]">
          Choose more than one capability now, and update them whenever your
          needs change.
        </p>
      </div>

      <form className="mx-auto mt-12 max-w-4xl" onSubmit={saveProfile}>
        <div className="card grid gap-5 p-6 md:grid-cols-2 md:p-8">
          <label className="grid gap-2 text-sm font-bold">
            Display name
            <input
              className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
              minLength={2}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              required
              value={displayName}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Preferred language
            <select
              className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#177245]"
              onChange={(event) => setLanguage(event.target.value as "en" | "te")}
              value={language}
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            City
            <input
              className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
              onChange={(event) => setCity(event.target.value)}
              required
              value={city}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Area
            <input
              className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
              onChange={(event) => setArea(event.target.value)}
              placeholder="Madhapur, Uppal…"
              value={area}
            />
          </label>
        </div>

        <h2 className="mt-10 text-xl font-bold">I want to…</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ value, icon: Icon, title, detail }) => {
            const active = selected.includes(value);
            return (
              <button
                aria-pressed={active}
                className={`card focus-ring relative cursor-pointer p-6 text-left transition hover:-translate-y-1 ${
                  active ? "border-[#177245] ring-2 ring-[#177245]/15" : ""
                }`}
                key={value}
                onClick={() => toggleCapability(value)}
                type="button"
              >
                {active && (
                  <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-[#177245] text-white">
                    <Check aria-hidden="true" size={14} />
                  </span>
                )}
                <Icon aria-hidden="true" className="text-[#177245]" size={25} />
                <span className="mt-5 block text-lg font-bold">{title}</span>
                <span className="mt-2 block text-sm leading-6 text-[#557089]">{detail}</span>
              </button>
            );
          })}
        </div>

        {message && (
          <p className="mt-5 rounded-xl bg-[#fff3cf] px-4 py-3 text-sm text-[#765409]">
            {message}
          </p>
        )}

        <button
          className="focus-ring mx-auto mt-8 block rounded-full bg-[#177245] px-8 py-4 font-bold text-white disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? "Saving…" : "Save profile and continue"}
        </button>
      </form>
    </main>
  );
}
