import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Languages,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const pillars = [
  {
    href: "/work",
    icon: BriefcaseBusiness,
    label: "Local work & services",
    title: "Skills meet fair opportunities.",
    description:
      "Discover work in events, construction, driving, security, home services, agriculture and more.",
    accent: "bg-[#0b3768]",
  },
  {
    href: "/produce",
    icon: Leaf,
    label: "Farmer direct market",
    title: "Produce meets better visibility.",
    description:
      "List a harvest, compare transparent buyer bids and choose the offer that fits your needs.",
    accent: "bg-[#177245]",
  },
  {
    href: "/books",
    icon: BookOpen,
    label: "Books for all",
    title: "Knowledge finds a new home.",
    description:
      "Sell useful second-hand books or donate them directly to learners in your community.",
    accent: "bg-[#62358c]",
  },
];

const signals = [
  { icon: Languages, text: "English + Telugu assistance" },
  { icon: MapPin, text: "Local, location-aware discovery" },
  { icon: ShieldCheck, text: "Community ratings and clear records" },
];

export default function Home() {
  return (
    <main>
      <section className="shell grid min-h-[76vh] items-center gap-12 py-16 lg:grid-cols-[1.12fr_0.88fr] lg:py-24">
        <div>
          <p className="eyebrow mb-5">From earning to learning</p>
          <h1 className="display max-w-4xl">
            One doorway.
            <span className="block text-[#177245]">More possibilities.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#557089] md:text-xl">
            JeevanDwaar connects local workers to fair-paying jobs,
            farmers directly to produce buyers, and learners to affordable or
            donated books—all with multilingual GPT-5.6 assistance.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[#177245] px-7 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#105c37]"
            >
              Open your doorway <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <a
              href="#marketplaces"
              className="focus-ring inline-flex items-center justify-center rounded-full border border-[#b9c9c2] bg-white px-7 py-4 font-bold transition hover:border-[#177245]"
            >
              Explore the platform
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[#f5bd38]/20 blur-2xl" />
          <div className="card overflow-hidden p-3">
            <div className="rounded-[1.15rem] bg-[#102a43] p-7 text-white sm:p-9">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                  Demo journey
                </span>
                <Sparkles className="text-[#f5bd38]" aria-hidden="true" />
              </div>
              <p className="mt-12 text-sm text-white/65">Today in Hyderabad</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
                3 opportunities,
                <br />1 shared community.
              </h2>
              <div className="mt-9 grid gap-3">
                {[
                  "Event helper needed in Madhapur",
                  "Paddy buyers bidding near Nalgonda",
                  "Class 10 books available for donation",
                ].map((item, index) => (
                  <div
                    className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 text-sm"
                    key={item}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f5bd38] font-black text-[#102a43]">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Platform qualities" className="border-y border-[#dce5e1] bg-white">
        <div className="shell grid gap-6 py-6 md:grid-cols-3">
          {signals.map(({ icon: Icon, text }) => (
            <div className="flex items-center gap-3 text-sm font-semibold" key={text}>
              <span className="grid size-10 place-items-center rounded-full bg-[#eef7f1] text-[#177245]">
                <Icon aria-hidden="true" size={19} />
              </span>
              {text}
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-20 lg:py-28" id="marketplaces">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Three direct pathways</p>
          <h2 className="section-title">Built around real, everyday needs.</h2>
          <p className="mt-5 text-lg leading-8 text-[#557089]">
            Every marketplace uses the same simple pattern: create a clear
            profile, discover local opportunities, connect directly and keep a
            transparent activity record.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pillars.map(({ href, icon: Icon, label, title, description, accent }) => (
            <Link
              className="card focus-ring group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
              href={href}
              key={href}
            >
              <div className={`${accent} h-2`} />
              <div className="p-7">
                <Icon aria-hidden="true" className="text-[#177245]" size={30} />
                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.14em] text-[#557089]">
                  {label}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em]">{title}</h3>
                <p className="mt-4 leading-7 text-[#557089]">{description}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-bold text-[#177245]">
                  Explore <ArrowRight className="transition group-hover:translate-x-1" size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#102a43] py-20 text-white lg:py-28">
        <div className="shell grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4 !text-[#8fe0aa]">GPT-5.6 assistance</p>
            <h2 className="section-title">Technology that helps without taking control.</h2>
          </div>
          <div className="grid gap-4 text-white/75">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-5">
              Turn a short English or Telugu description into an editable,
              structured listing.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-5">
              Explain why a job matches a worker using skills, location,
              availability and pay fit.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-5">
              Compare produce bids using transparent calculations—without
              inventing market prices.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
