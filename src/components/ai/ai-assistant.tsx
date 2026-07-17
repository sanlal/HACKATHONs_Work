"use client";

import { FormEvent, useState } from "react";
import { Check, Languages, Sparkles, TriangleAlert } from "lucide-react";
import type {
  AiAssistResult,
  AiSuggestion,
} from "@/lib/ai/schemas";

type AiAssistantProps = {
  domain: "work" | "produce" | "books";
  mode?: "listing" | "match" | "bid";
  title: string;
  placeholder: string;
  context?: string;
  initialInput?: string;
  onApply?: (suggestions: AiSuggestion[]) => void;
};

type ApiResponse = {
  data?: AiAssistResult;
  source?: "gpt-5.6" | "deterministic-fallback";
  model?: string | null;
  error?: string;
};

export function AiAssistant({
  domain,
  mode = "listing",
  title,
  placeholder,
  context = "",
  initialInput = "",
  onApply,
}: AiAssistantProps) {
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [input, setInput] = useState(initialInput);
  const [result, setResult] = useState<AiAssistResult | null>(null);
  const [source, setSource] = useState<ApiResponse["source"]>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);

  async function requestAssistance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setApplied(false);

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, mode, language, input, context }),
      });
      const body = (await response.json()) as ApiResponse;

      if (!response.ok || !body.data) {
        throw new Error(body.error || "Assistance could not be generated.");
      }

      setResult(body.data);
      setSource(body.source);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Assistance could not be generated.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#c7d7ed] bg-[#f5f8fc] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#102a43] text-white">
            <Sparkles aria-hidden="true" size={19} />
          </span>
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-xs text-[#557089]">
              GPT-5.6-assisted · always editable
            </p>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-bold">
          <Languages size={15} />
          <select
            className="rounded-full border border-[#c7d7ed] bg-white px-3 py-2"
            onChange={(event) =>
              setLanguage(event.target.value as "en" | "te")
            }
            value={language}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>
        </label>
      </div>

      <form className="mt-5 grid gap-3" onSubmit={requestAssistance}>
        <textarea
          aria-label={title}
          className="min-h-24 rounded-xl border border-[#c7d7ed] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#0b3768]"
          maxLength={1800}
          minLength={8}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          required
          value={input}
        />
        <button
          className="focus-ring w-fit rounded-full bg-[#0b3768] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? "Thinking…" : "Assist with GPT-5.6"}
        </button>
      </form>

      {error && (
        <p
          aria-live="polite"
          className="mt-4 rounded-xl bg-[#fbe8e5] px-4 py-3 text-sm text-[#9b2c20]"
        >
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 rounded-xl border border-[#dce5e1] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">{result.title}</h3>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
                source === "gpt-5.6"
                  ? "bg-[#e5f6eb] text-[#11663b]"
                  : "bg-[#fff3cf] text-[#765409]"
              }`}
            >
              {source === "gpt-5.6" ? "Live GPT-5.6" : "Safe fallback"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#557089]">
            {result.explanation}
          </p>

          {result.suggestions.length > 0 && (
            <div className="mt-4 grid gap-2">
              {result.suggestions
                .filter((suggestion) => suggestion.value)
                .map((suggestion) => (
                  <div
                    className="grid gap-1 rounded-lg bg-[#f8fbf9] px-3 py-2 text-sm sm:grid-cols-[8rem_1fr]"
                    key={`${suggestion.field}-${suggestion.value}`}
                  >
                    <span className="font-bold capitalize text-[#557089]">
                      {suggestion.field.replaceAll("_", " ")}
                    </span>
                    <span>{suggestion.value}</span>
                  </div>
                ))}
            </div>
          )}

          {result.cautions.map((caution) => (
            <p
              className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#765409]"
              key={caution}
            >
              <TriangleAlert className="mt-0.5 shrink-0" size={14} />
              {caution}
            </p>
          ))}

          {onApply && result.suggestions.length > 0 && (
            <button
              className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full border border-[#0b3768] px-4 py-2.5 text-sm font-bold text-[#0b3768]"
              onClick={() => {
                onApply(result.suggestions);
                setApplied(true);
              }}
              type="button"
            >
              <Check size={16} />
              {applied ? "Applied—review every field" : "Apply editable suggestions"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
