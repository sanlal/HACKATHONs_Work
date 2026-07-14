import { BookOpen, BriefcaseBusiness, Building2, Leaf, ShoppingBasket, UserRound } from "lucide-react";

const capabilities = [
  { icon: UserRound, title: "Find work", detail: "Create a worker or service-provider profile." },
  { icon: Building2, title: "Hire locally", detail: "Post clear work with schedule and pay." },
  { icon: Leaf, title: "Sell produce", detail: "List a harvest and compare direct bids." },
  { icon: ShoppingBasket, title: "Buy produce", detail: "Find local supply and place an offer." },
  { icon: BookOpen, title: "Share books", detail: "Sell, donate or request useful books." },
  { icon: BriefcaseBusiness, title: "Use multiple roles", detail: "Enable more capabilities at any time." },
];

export default function OnboardingPage() {
  return (
    <main className="shell min-h-[72vh] py-14 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-4">Welcome to JeevanDwaar</p>
        <h1 className="section-title">What would you like to do first?</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#557089]">
          One account can support many roles. Authentication and saved profiles
          arrive in the next build milestone.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map(({ icon: Icon, title, detail }) => (
          <button
            className="card focus-ring cursor-pointer p-6 text-left transition hover:-translate-y-1 hover:border-[#177245]"
            key={title}
            type="button"
          >
            <Icon aria-hidden="true" className="text-[#177245]" size={25} />
            <span className="mt-5 block text-lg font-bold">{title}</span>
            <span className="mt-2 block text-sm leading-6 text-[#557089]">{detail}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
