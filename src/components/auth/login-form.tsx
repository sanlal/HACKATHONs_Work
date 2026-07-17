"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function LoginForm({ initialMessage = "" }: { initialMessage?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase is not configured. Use Demo access below.");
      setBusy(false);
      return;
    }

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name.trim(),
            city: "Hyderabad",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setMessage("Check your email to confirm your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        const { data: capabilities } = await supabase
          .from("user_capabilities")
          .select("capability")
          .limit(1);
        router.push(capabilities?.length ? "/dashboard" : "/onboarding");
        router.refresh();
      }
    }

    setBusy(false);
  }

  async function enterDemo() {
    await fetch("/api/demo/session", { method: "POST" });
    document.cookie =
      "jeevandwaar-demo=1; path=/; max-age=28800; SameSite=Lax";
    localStorage.setItem(
      "jeevandwaar-demo-profile",
      JSON.stringify({
        displayName: "Demo Community Member",
        city: "Hyderabad",
        language: "en",
        capabilities: [
          "worker",
          "employer",
          "farmer",
          "produce_buyer",
          "book_owner",
          "book_requester",
        ],
      }),
    );
    router.push("/dashboard");
  }

  return (
    <div className="card mx-auto w-full max-w-md p-7 sm:p-9">
      <div className="flex items-center justify-between">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#eef7f1] text-[#177245]">
          <LockKeyhole aria-hidden="true" size={23} />
        </span>
        <span className="rounded-full bg-[#fff3cf] px-3 py-1 text-xs font-bold text-[#765409]">
          Interactive demo
        </span>
      </div>

      <h1 className="mt-7 text-3xl font-bold tracking-[-0.04em]">
        {mode === "sign-in" ? "Welcome back" : "Open your account"}
      </h1>
      <p className="mt-3 leading-7 text-[#557089]">
        {mode === "sign-in"
          ? "Continue to your opportunities and activity."
          : "One account supports work, farming and book exchange."}
      </p>

      <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
        {mode === "sign-up" && (
          <label className="grid gap-2 text-sm font-bold">
            Your name
            <input
              className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#177245]"
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
        )}

        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            autoComplete="email"
            className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#177245]"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Password
          <input
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#177245]"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {message && (
          <p
            aria-live="polite"
            className="rounded-xl bg-[#fff3cf] px-4 py-3 text-sm text-[#765409]"
          >
            {message}
          </p>
        )}

        <button
          className="focus-ring mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#177245] px-6 py-3.5 font-bold text-white disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
          {!busy && <ArrowRight aria-hidden="true" size={17} />}
        </button>
      </form>

      <button
        className="focus-ring mt-4 w-full rounded-full border border-[#c9d7d1] px-6 py-3.5 font-bold"
        onClick={enterDemo}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" size={17} />
          Enter interactive demo
        </span>
      </button>

      {!isSupabaseConfigured && (
        <p className="mt-3 text-center text-xs leading-5 text-[#557089]">
          Demo mode is active until Supabase environment values are added.
        </p>
      )}

      <button
        className="focus-ring mx-auto mt-6 block rounded text-sm font-bold text-[#177245]"
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setMessage("");
        }}
        type="button"
      >
        {mode === "sign-in"
          ? "New here? Create an account"
          : "Already registered? Sign in"}
      </button>
    </div>
  );
}
