"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bell,
  BriefcaseBusiness,
  Leaf,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  loadLiveBooks,
  loadLiveProduce,
  loadLiveWork,
} from "@/lib/supabase/marketplaces";
import type { NotificationRow } from "@/lib/supabase/database.types";
import {
  initialWorkDemoState,
  WORK_DEMO_STORAGE_KEY,
  type WorkDemoState,
} from "@/lib/work-demo";
import {
  initialProduceDemoState,
  PRODUCE_DEMO_STORAGE_KEY,
  type ProduceDemoState,
} from "@/lib/produce-demo";
import {
  BOOKS_DEMO_STORAGE_KEY,
  initialBooksDemoState,
  type BooksDemoState,
} from "@/lib/books-demo";

type DemoProfile = {
  displayName: string;
  city: string;
  area?: string;
  language: string;
  capabilities: string[];
  averageRating?: number;
  completedExchanges?: number;
  fulfilledDonations?: number;
};

type PendingReview = {
  activityId: string;
  revieweeId: string;
  revieweeName: string;
  domain: string;
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
  const [produceState, setProduceState] =
    useState<ProduceDemoState>(initialProduceDemoState);
  const [booksState, setBooksState] =
    useState<BooksDemoState>(initialBooksDemoState);
  const [dataMode, setDataMode] = useState<"demo" | "live">("demo");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [dashboardMessage, setDashboardMessage] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("jeevandwaar-demo-profile");
    const savedWork = localStorage.getItem(WORK_DEMO_STORAGE_KEY);
    const savedProduce = localStorage.getItem(PRODUCE_DEMO_STORAGE_KEY);
    const savedBooks = localStorage.getItem(BOOKS_DEMO_STORAGE_KEY);

    try {
      if (savedProfile) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(JSON.parse(savedProfile) as DemoProfile);
      }
      if (savedWork) {
        setWorkState(JSON.parse(savedWork) as WorkDemoState);
      }
      if (savedProduce) {
        setProduceState(JSON.parse(savedProduce) as ProduceDemoState);
      }
      if (savedBooks) {
        setBooksState(JSON.parse(savedBooks) as BooksDemoState);
      }
    } catch {
      localStorage.removeItem("jeevandwaar-demo-profile");
      localStorage.removeItem(WORK_DEMO_STORAGE_KEY);
      localStorage.removeItem(PRODUCE_DEMO_STORAGE_KEY);
      localStorage.removeItem(BOOKS_DEMO_STORAGE_KEY);
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
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      const [
        capabilitiesResult,
        liveWork,
        liveProduce,
        liveBooks,
        notificationResult,
        activityResult,
        reviewResult,
        profilesResult,
      ] = await Promise.all([
        supabase
          .from("user_capabilities")
          .select("capability")
          .eq("user_id", user.id),
        loadLiveWork(),
        loadLiveProduce(),
        loadLiveBooks(),
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("activity_records")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").eq("reviewer_id", user.id),
        supabase.from("profiles").select("*"),
      ]);

      if (saved) {
        setProfile({
          displayName: saved.display_name,
          city: saved.city,
          area: saved.area ?? undefined,
          language: saved.preferred_language,
          capabilities:
            capabilitiesResult.data?.map((item) => item.capability) ?? [],
          averageRating: saved.average_rating,
          completedExchanges: saved.completed_exchanges,
          fulfilledDonations: saved.fulfilled_donations,
        });
        setWorkState(liveWork);
        setProduceState(liveProduce);
        setBooksState(liveBooks);
        setDataMode("live");
        setNotifications(notificationResult.data ?? []);

        const reviewed = new Set(
          (reviewResult.data ?? []).map((review) => review.activity_id),
        );
        const names = new Map(
          (profilesResult.data ?? []).map((item) => [
            item.id,
            item.display_name,
          ]),
        );
        setPendingReviews(
          (activityResult.data ?? [])
            .filter((activity) => !reviewed.has(activity.id))
            .map((activity) => {
              const revieweeId =
                activity.actor_id === user.id
                  ? activity.counterparty_id
                  : activity.actor_id;
              return revieweeId
                ? {
                    activityId: activity.id,
                    revieweeId,
                    revieweeName: names.get(revieweeId) ?? "Community member",
                    domain: activity.domain,
                  }
                : null;
            })
            .filter((item): item is PendingReview => item !== null),
        );
      }
    }

    void loadRemoteProfile();
  }, []);

  const summary = useMemo(() => {
    const applications = workState.jobs.flatMap((job) => job.applications);
    return {
      openJobs: workState.jobs.filter((job) => job.status === "open").length,
      applications: applications.length,
      completedWork: workState.jobs.filter((job) => job.status === "completed")
        .length,
      openProduce: produceState.listings.filter(
        (listing) => listing.status === "open",
      ).length,
      produceOffers: produceState.listings.flatMap((listing) => listing.bids)
        .length,
      completedProduce: produceState.listings.filter(
        (listing) => listing.status === "completed",
      ).length,
      openBooks: booksState.listings.filter(
        (listing) => listing.status === "open",
      ).length,
      bookRequests: booksState.listings.flatMap((listing) => listing.requests)
        .length,
      completedBooks: booksState.listings.filter(
        (listing) => listing.status === "completed",
      ).length,
      fulfilledDonations: booksState.listings.filter(
        (listing) =>
          listing.status === "completed" && listing.mode === "donate",
      ).length,
    };
  }, [booksState, produceState, workState]);

  async function signOut() {
    localStorage.removeItem("jeevandwaar-demo-profile");
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    await fetch("/api/demo/session", { method: "DELETE" });
    document.cookie = "jeevandwaar-demo=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
    router.refresh();
  }

  async function submitReview(review: PendingReview, rating: number) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: user.id,
      reviewee_id: review.revieweeId,
      activity_id: review.activityId,
      rating,
    });
    if (error) {
      setDashboardMessage(error.message);
      return;
    }
    setPendingReviews((current) =>
      current.filter((item) => item.activityId !== review.activityId),
    );
    setDashboardMessage("Review recorded. The public rating was recalculated.");
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
      detail: `${summary.openProduce} open listings · ${summary.produceOffers} offers · ${summary.completedProduce} completed`,
      action: "Open marketplace",
    },
    {
      href: "/books",
      icon: BookOpen,
      title: "Books for all",
      detail: `${summary.openBooks} available books · ${summary.bookRequests} requests · ${summary.completedBooks} completed`,
      action: "Open marketplace",
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
          <p className="mt-3 w-fit rounded-full bg-[#eef7f1] px-3 py-1 text-xs font-bold text-[#11663b]">
            {dataMode === "live" ? "Live Supabase account" : "Browser demo"}
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

      {dashboardMessage && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl bg-[#eef7f1] px-4 py-3 text-sm font-semibold text-[#11663b]"
        >
          {dashboardMessage}
        </p>
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Open jobs", summary.openJobs],
          ["Produce listings", summary.openProduce],
          ["Available books", summary.openBooks],
          [
            "Direct responses",
            summary.applications + summary.produceOffers + summary.bookRequests,
          ],
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
            <ShieldCheck size={21} />
          </span>
          <h2 className="mt-5 text-xl font-bold">Activity-earned trust</h2>
          <p className="mt-3 text-sm leading-6 text-[#557089]">
            Signals come from completed platform activity—not identity
            verification.
          </p>
          <Link
            className="focus-ring mt-5 inline-block rounded text-sm font-bold text-[#177245]"
            href="/onboarding"
          >
            Manage profile
          </Link>
        </div>
        <div>
          <div className="flex flex-wrap content-start gap-2">
            <span
              className="rounded-full border border-[#b9ddc5] bg-[#eef7f1] px-4 py-2 text-sm font-bold text-[#11663b]"
            >
              {dataMode === "live"
                ? profile.completedExchanges ?? 0
                : summary.completedWork +
                  summary.completedProduce +
                  summary.completedBooks}{" "}
              completed exchanges
            </span>
            <span className="rounded-full border border-[#d4c2e7] bg-[#f7f1fb] px-4 py-2 text-sm font-bold text-[#62358c]">
              {dataMode === "live"
                ? profile.fulfilledDonations ?? 0
                : summary.fulfilledDonations}{" "}
              fulfilled donations
            </span>
            {dataMode === "live" && (
              <span className="rounded-full border border-[#f0dca4] bg-[#fff9e8] px-4 py-2 text-sm font-bold text-[#765409]">
                {profile.averageRating?.toFixed(1) ?? "0.0"} average rating
              </span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap content-start gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#557089]">
              <UserRound size={14} /> Capabilities
            </span>
            {profile.capabilities.map((capability) => (
              <span
                className="rounded-full border border-[#dce5e1] px-3 py-1 text-xs font-bold capitalize text-[#557089]"
                key={capability}
              >
                {capability.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      </section>

      {dataMode === "live" && (
        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-7">
            <div className="flex items-center gap-3">
              <Bell className="text-[#177245]" size={22} />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-[#557089]">No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    className="rounded-xl border border-[#dce5e1] p-4"
                    key={notification.id}
                  >
                    <p className="font-bold">{notification.title}</p>
                    <p className="mt-1 text-sm text-[#557089]">
                      {notification.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-7">
            <h2 className="text-xl font-bold">Pending community reviews</h2>
            <p className="mt-2 text-sm leading-6 text-[#557089]">
              Ratings are available only after verified completed activity.
            </p>
            <div className="mt-5 grid gap-3">
              {pendingReviews.length === 0 ? (
                <p className="text-sm text-[#557089]">
                  No completed exchanges need a review.
                </p>
              ) : (
                pendingReviews.map((review) => (
                  <div
                    className="rounded-xl border border-[#dce5e1] p-4"
                    key={review.activityId}
                  >
                    <p className="font-bold">
                      {review.revieweeName} · {review.domain}
                    </p>
                    <div
                      aria-label={`Rate ${review.revieweeName}`}
                      className="mt-3 flex gap-2"
                      role="group"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          aria-label={`${rating} star review`}
                          className="focus-ring grid size-9 place-items-center rounded-full border border-[#dce5e1] text-sm font-bold hover:border-[#177245] hover:text-[#177245]"
                          key={rating}
                          onClick={() => submitReview(review, rating)}
                          type="button"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
