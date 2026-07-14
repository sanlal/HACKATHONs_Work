import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type MarketplacePreviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  examples: Array<{ title: string; meta: string; detail: string }>;
};

export function MarketplacePreview({
  eyebrow,
  title,
  description,
  action,
  icon: Icon,
  examples,
}: MarketplacePreviewProps) {
  return (
    <main className="shell min-h-[72vh] py-12 lg:py-18">
      <Link
        className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[#557089]"
        href="/"
      >
        <ArrowLeft size={16} /> Back home
      </Link>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="grid size-14 place-items-center rounded-2xl bg-[#eef7f1] text-[#177245]">
            <Icon aria-hidden="true" size={27} />
          </span>
          <p className="eyebrow mb-4 mt-8">{eyebrow}</p>
          <h1 className="section-title">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#557089]">{description}</p>
          <Link
            className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full bg-[#177245] px-6 py-3.5 font-bold text-white"
            href="/onboarding"
          >
            {action} <ArrowRight size={17} />
          </Link>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Sample opportunities</h2>
            <span className="rounded-full bg-[#fff3cf] px-3 py-1 text-xs font-bold text-[#765409]">
              Day 1 preview
            </span>
          </div>
          <div className="grid gap-4">
            {examples.map((example) => (
              <article className="card p-6" key={example.title}>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#177245]">
                  {example.meta}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-[-0.025em]">{example.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#557089]">{example.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
