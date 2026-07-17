"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Leaf,
  MapPin,
  Plus,
  RefreshCw,
  Scale,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";
import {
  benchmarkDifference,
  bidTotal,
  DEMO_BUYER_ID,
  DEMO_FARMER_ID,
  initialProduceDemoState,
  PRODUCE_DEMO_STORAGE_KEY,
  type DemoBid,
  type DemoProduceListing,
  type ProduceDemoState,
} from "@/lib/produce-demo";
import { AiAssistant } from "@/components/ai/ai-assistant";
import type { AiSuggestion } from "@/lib/ai/schemas";
import {
  acceptLiveProduceBid,
  confirmLiveProducePickup,
  createLiveProduceListing,
  loadLiveProduce,
  placeLiveProduceBid,
} from "@/lib/supabase/marketplaces";
import { useMarketplaceSession } from "@/lib/supabase/use-marketplace-session";
import { useLanguage } from "@/components/i18n/language-provider";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function statusClass(status: DemoProduceListing["status"]) {
  if (status === "completed") return "bg-[#e5f6eb] text-[#11663b]";
  if (status === "reserved") return "bg-[#fff3cf] text-[#765409]";
  if (status === "cancelled") return "bg-[#fbe8e5] text-[#9b2c20]";
  return "bg-[#e8f0f8] text-[#0b3768]";
}

export function ProduceMarketplace() {
  const { text } = useLanguage();
  const session = useMarketplaceSession();
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");
  const [state, setState] = useState<ProduceDemoState>(initialProduceDemoState);
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);
  const [activeBidListing, setActiveBidListing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [crop, setCrop] = useState("Paddy");
  const [variety, setVariety] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [unit, setUnit] = useState<"kg" | "quintal" | "tonne">("quintal");
  const [grade, setGrade] = useState("Good");
  const [harvestDate, setHarvestDate] = useState("2026-07-18");
  const [expectedPrice, setExpectedPrice] = useState("2300");
  const [area, setArea] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");

  const [bidQuantity, setBidQuantity] = useState("45");
  const [bidPrice, setBidPrice] = useState("2250");
  const [pickupDate, setPickupDate] = useState("2026-07-20");
  const [bidNotes, setBidNotes] = useState("");

  useEffect(() => {
    if (session.loading) return;
    if (session.mode === "live") {
      loadLiveProduce()
        .then((liveState) => {
          setState(liveState);
          setLoading(false);
        })
        .catch((error: Error) => {
          setNotice(error.message);
          setLoading(false);
        });
      return;
    }

    const saved = localStorage.getItem(PRODUCE_DEMO_STORAGE_KEY);
    if (!saved) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    try {
      // Restoring browser-owned demo state after hydration is intentional.
      const restored = JSON.parse(saved) as ProduceDemoState;
      queueMicrotask(() => setState(restored));
    } catch {
      localStorage.removeItem(PRODUCE_DEMO_STORAGE_KEY);
    }
    queueMicrotask(() => setLoading(false));
  }, [session.loading, session.mode]);

  async function reloadLive() {
    setLoading(true);
    try {
      setState(await loadLiveProduce());
    } finally {
      setLoading(false);
    }
  }

  function commit(update: (current: ProduceDemoState) => ProduceDemoState) {
    setState((current) => {
      const next = update(current);
      localStorage.setItem(PRODUCE_DEMO_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function resetDemo() {
    if (session.mode === "live") {
      void reloadLive();
      setNotice("Live produce data refreshed.");
      return;
    }
    localStorage.removeItem(PRODUCE_DEMO_STORAGE_KEY);
    setState(initialProduceDemoState);
    setActiveBidListing(null);
    setNotice("Produce demo reset to its starting state.");
  }

  function applyAiSuggestions(suggestions: AiSuggestion[]) {
    const fields = Object.fromEntries(
      suggestions.map((suggestion) => [suggestion.field, suggestion.value]),
    );
    if (fields.crop) setCrop(fields.crop);
    if (fields.variety) setVariety(fields.variety);
    if (fields.quantity) setQuantity(fields.quantity);
    if (fields.grade) setGrade(fields.grade);
    if (fields.expectedPrice) setExpectedPrice(fields.expectedPrice);
    if (fields.area) setArea(fields.area);
    if (fields.pickupNotes) setPickupNotes(fields.pickupNotes);
    setNotice("AI suggestions applied. Review every field before publishing.");
  }

  async function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (session.mode === "live") {
      try {
        await createLiveProduceListing({
          userId: session.userId,
          crop: crop.trim(),
          variety: variety.trim(),
          quantity: Number(quantity),
          unit,
          grade: grade.trim(),
          harvestDate,
          expectedPrice: Number(expectedPrice),
          city: session.profile.city,
          area: area.trim(),
          pickupNotes: pickupNotes.trim(),
        });
        await reloadLive();
        setShowListingForm(false);
        setVariety("");
        setArea("");
        setPickupNotes("");
        setNotice("Produce published to the live marketplace.");
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not list produce.",
        );
      }
      return;
    }

    const listing: DemoProduceListing = {
      id: `produce-${Date.now()}`,
      farmerId: DEMO_FARMER_ID,
      farmerName: "Ramesh Naik",
      crop: crop.trim(),
      variety: variety.trim(),
      quantity: Number(quantity),
      unit,
      grade: grade.trim(),
      harvestDate,
      expectedPricePerUnit: Number(expectedPrice),
      city: "Nalgonda",
      area: area.trim(),
      pickupNotes: pickupNotes.trim(),
      status: "open",
      benchmark: {
        marketName: "Nalgonda Demo Market",
        modalPrice: Number(expectedPrice),
        minimumPrice: Math.round(Number(expectedPrice) * 0.92),
        maximumPrice: Math.round(Number(expectedPrice) * 1.08),
        observedOn: "2026-07-14",
        sourceName: "JeevanDwaar demonstration dataset",
        isDemo: true,
      },
      bids: [],
    };

    commit((current) => ({
      listings: [listing, ...current.listings],
      activity: [
        {
          id: `produce-activity-${Date.now()}`,
          title: "Produce listed",
          detail: `${listing.crop} · ${listing.quantity} ${listing.unit}`,
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setShowListingForm(false);
    setNotice("Produce listed. Switch to buyer view to place an offer.");
    setVariety("");
    setArea("");
    setPickupNotes("");
  }

  async function placeBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeBidListing) return;
    if (session.mode === "live") {
      try {
        await placeLiveProduceBid({
          listingId: activeBidListing,
          quantity: Number(bidQuantity),
          pricePerUnit: Number(bidPrice),
          pickupDate,
          notes: bidNotes.trim(),
        });
        await reloadLive();
        setActiveBidListing(null);
        setBidNotes("");
        setNotice("Offer sent through the guarded Supabase workflow.");
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not place offer.",
        );
      }
      return;
    }

    const bid: DemoBid = {
      id: `produce-bid-${Date.now()}`,
      buyerId: DEMO_BUYER_ID,
      buyerName: "Sri Balaji Food Traders",
      quantity: Number(bidQuantity),
      pricePerUnit: Number(bidPrice),
      pickupDate,
      notes: bidNotes.trim(),
      status: "pending",
    };

    commit((current) => ({
      ...current,
      listings: current.listings.map((listing) =>
        listing.id === activeBidListing
          ? {
              ...listing,
              bids: [
                ...listing.bids.filter((item) => item.buyerId !== DEMO_BUYER_ID),
                bid,
              ],
            }
          : listing,
      ),
      activity: [
        {
          id: `produce-activity-${Date.now()}`,
          title: "Buyer offer submitted",
          detail: `${money.format(bid.pricePerUnit)} per unit · ${bid.quantity} units`,
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setActiveBidListing(null);
    setBidNotes("");
    setNotice("Offer sent directly to the farmer.");
  }

  async function acceptBid(listingId: string, bidId: string) {
    if (session.mode === "live") {
      try {
        await acceptLiveProduceBid(bidId);
        await reloadLive();
        setNotice("Offer accepted. Both participants must confirm pickup.");
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not accept offer.",
        );
      }
      return;
    }

    commit((current) => ({
      ...current,
      listings: current.listings.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: "reserved",
              acceptedBidId: bidId,
              bids: listing.bids.map((bid) => ({
                ...bid,
                status: bid.id === bidId ? "accepted" : "rejected",
              })),
            }
          : listing,
      ),
      activity: [
        {
          id: `produce-activity-${Date.now()}`,
          title: "Buyer offer accepted",
          detail:
            current.listings
              .find((listing) => listing.id === listingId)
              ?.bids.find((bid) => bid.id === bidId)?.buyerName ?? "Direct buyer",
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setNotice("Offer accepted. Pickup details are now reserved.");
  }

  async function completePickup(listingId: string) {
    if (session.mode === "live") {
      try {
        await confirmLiveProducePickup(listingId);
        await reloadLive();
        setNotice(
          "Your pickup confirmation was recorded. Completion occurs after both participants confirm.",
        );
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Could not confirm pickup.",
        );
      }
      return;
    }

    commit((current) => {
      const listing = current.listings.find((item) => item.id === listingId);
      const accepted = listing?.bids.find(
        (bid) => bid.id === listing.acceptedBidId,
      );
      return {
        ...current,
        listings: current.listings.map((item) =>
          item.id === listingId ? { ...item, status: "completed" } : item,
        ),
        activity: [
          {
            id: `produce-activity-${Date.now()}`,
            title: "Produce pickup completed",
            detail: accepted
              ? `${listing?.crop} · ${money.format(bidTotal(accepted))} recorded`
              : listing?.crop ?? "Produce exchange",
            createdAt: "Just now",
          },
          ...current.activity,
        ],
      };
    });
    setNotice("Pickup confirmed and transaction activity recorded.");
  }

  const activeFarmerId =
    session.mode === "live" ? session.userId : DEMO_FARMER_ID;
  const visibleListings = useMemo(
    () =>
      role === "farmer"
        ? state.listings.filter(
            (listing) => listing.farmerId === activeFarmerId,
          )
        : state.listings.filter(
            (listing) =>
              listing.status === "open" ||
              listing.bids.some(
                (bid) =>
                  bid.buyerId ===
                  (session.mode === "live" ? session.userId : DEMO_BUYER_ID),
              ),
          ),
    [activeFarmerId, role, session, state.listings],
  );

  return (
    <main className="shell min-h-[76vh] py-12 lg:py-18">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Interactive farmer direct market</p>
          <h1 className="section-title">{text("produceTitle")}</h1>
          <p className="mt-5 text-lg leading-8 text-[#557089]">
            Farmers compare unit price, quantity, total value and pickup date
            before accepting one direct buyer offer.
          </p>
        </div>
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-[#c9d7d1] bg-white px-5 py-3 text-sm font-bold"
          onClick={resetDemo}
          type="button"
        >
          <RefreshCw size={16} />{" "}
          {session.mode === "live" ? text("refreshLive") : text("resetDemo")}
        </button>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-[#c9d7d1] bg-white p-1">
          {(["farmer", "buyer"] as const).map((item) => (
            <button
              aria-pressed={role === item}
              className={`focus-ring rounded-full px-5 py-2.5 text-sm font-bold capitalize ${
                role === item ? "bg-[#177245] text-white" : "text-[#557089]"
              }`}
              key={item}
              onClick={() => {
                setRole(item);
                setNotice("");
                setActiveBidListing(null);
              }}
              type="button"
            >
              {text(item === "farmer" ? "farmerView" : "buyerView")}
            </button>
          ))}
        </div>
        <span className="text-sm text-[#557089]">
          {session.mode === "live"
            ? `Live Supabase · ${session.profile.display_name}`
            : role === "farmer"
              ? "Browser demo · Ramesh Naik"
              : "Browser demo · Sri Balaji Food Traders"}
        </span>
      </div>

      {loading && (
        <p className="mt-6 text-sm font-semibold text-[#557089]" role="status">
          Loading produce marketplace…
        </p>
      )}

      {notice && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl border border-[#b9ddc5] bg-[#eef7f1] px-4 py-3 text-sm font-semibold text-[#11663b]"
        >
          {notice}
        </p>
      )}

      {role === "farmer" && (
        <section className="mt-8">
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#177245] px-6 py-3.5 font-bold text-white"
            onClick={() => setShowListingForm((current) => !current)}
            type="button"
          >
            <Plus size={18} /> {showListingForm ? "Close form" : "List produce"}
          </button>

          {showListingForm && (
            <>
              <div className="mt-5">
                <AiAssistant
                  domain="produce"
                  onApply={applyAiSuggestions}
                  placeholder="Example: I harvested 80 quintals of fine paddy near Miryalaguda. Farm pickup is available."
                  title="Describe your harvest by voice or text"
                />
              </div>
              <form className="card mt-5 grid gap-5 p-6 md:grid-cols-2 md:p-8" onSubmit={createListing}>
              <label className="grid gap-2 text-sm font-bold">
                Crop
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setCrop(event.target.value)}
                  required
                  value={crop}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Variety
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setVariety(event.target.value)}
                  placeholder="Fine, Sona Masuri…"
                  value={variety}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Quantity
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  min={1}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                  type="number"
                  value={quantity}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Unit
                <select
                  className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setUnit(event.target.value as typeof unit)}
                  value={unit}
                >
                  <option value="kg">Kilogram</option>
                  <option value="quintal">Quintal</option>
                  <option value="tonne">Tonne</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Quality grade
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setGrade(event.target.value)}
                  required
                  value={grade}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Harvest date
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setHarvestDate(event.target.value)}
                  required
                  type="date"
                  value={harvestDate}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Expected price per unit (₹)
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  min={1}
                  onChange={(event) => setExpectedPrice(event.target.value)}
                  required
                  type="number"
                  value={expectedPrice}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Pickup area
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setArea(event.target.value)}
                  required
                  value={area}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold md:col-span-2">
                Pickup and weighment notes
                <textarea
                  className="min-h-24 rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                  onChange={(event) => setPickupNotes(event.target.value)}
                  value={pickupNotes}
                />
              </label>
              <button
                className="focus-ring rounded-full bg-[#177245] px-6 py-3.5 font-bold text-white md:col-span-2"
                type="submit"
              >
                Publish produce listing
              </button>
              </form>
            </>
          )}
        </section>
      )}

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="grid content-start gap-5">
          {visibleListings.map((listing) => {
            const ownBid = listing.bids.find(
              (bid) => bid.buyerId === DEMO_BUYER_ID,
            );
            const acceptedBid = listing.bids.find(
              (bid) => bid.id === listing.acceptedBidId,
            );
            return (
              <article className="card overflow-hidden" key={listing.id}>
                <div className="border-b border-[#dce5e1] p-6 md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#177245]">
                          {listing.grade}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">
                        {listing.crop}{listing.variety ? ` · ${listing.variety}` : ""}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-[#557089]">
                        Farmer: {listing.farmerName}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#eef7f1] px-4 py-3 text-right">
                      <p className="font-extrabold text-[#11663b]">
                        {listing.quantity} {listing.unit}
                      </p>
                      <p className="text-xs text-[#557089]">
                        expects {money.format(listing.expectedPricePerUnit)}/unit
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#557089]">
                    <span className="inline-flex items-center gap-2"><MapPin size={16} /> {listing.area}, {listing.city}</span>
                    <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> Harvested {listing.harvestDate}</span>
                    <span className="inline-flex items-center gap-2"><Scale size={16} /> {listing.bids.length} buyer offers</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#557089]">{listing.pickupNotes}</p>
                </div>

                <div className="grid gap-4 bg-[#f8fbf9] p-6 md:grid-cols-3 md:p-7">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#557089]">Demo benchmark</p>
                    <p className="mt-2 text-lg font-extrabold">{money.format(listing.benchmark.modalPrice)}</p>
                    <p className="text-xs text-[#557089]">modal price / {listing.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#557089]">Range</p>
                    <p className="mt-2 text-sm font-bold">
                      {money.format(listing.benchmark.minimumPrice)}–{money.format(listing.benchmark.maximumPrice)}
                    </p>
                    <p className="text-xs text-[#557089]">{listing.benchmark.marketName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#557089]">Source</p>
                    <p className="mt-2 text-sm font-bold">{listing.benchmark.sourceName}</p>
                    <p className="text-xs text-[#557089]">{listing.benchmark.observedOn} · not live data</p>
                  </div>
                </div>

                {role === "buyer" && listing.status === "open" && (
                  <div className="border-t border-[#dce5e1] p-6 md:p-7">
                    {activeBidListing === listing.id ? (
                      <form className="grid gap-4 md:grid-cols-2" onSubmit={placeBid}>
                        <label className="grid gap-2 text-sm font-bold">
                          Quantity ({listing.unit})
                          <input
                            className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                            max={listing.quantity}
                            min={1}
                            onChange={(event) => setBidQuantity(event.target.value)}
                            required
                            type="number"
                            value={bidQuantity}
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-bold">
                          Price per {listing.unit} (₹)
                          <input
                            className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                            min={1}
                            onChange={(event) => setBidPrice(event.target.value)}
                            required
                            type="number"
                            value={bidPrice}
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-bold">
                          Pickup date
                          <input
                            className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                            onChange={(event) => setPickupDate(event.target.value)}
                            required
                            type="date"
                            value={pickupDate}
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-bold">
                          Notes
                          <input
                            className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#177245]"
                            onChange={(event) => setBidNotes(event.target.value)}
                            placeholder="Pickup and loading terms"
                            value={bidNotes}
                          />
                        </label>
                        <div className="rounded-xl bg-[#eef7f1] p-4 text-sm md:col-span-2">
                          Calculated total: <strong>{money.format(Number(bidQuantity) * Number(bidPrice))}</strong>
                        </div>
                        <button className="focus-ring rounded-full bg-[#177245] px-5 py-3 font-bold text-white" type="submit">
                          Submit direct offer
                        </button>
                        <button
                          className="focus-ring rounded-full border border-[#c9d7d1] px-5 py-3 font-bold"
                          onClick={() => setActiveBidListing(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#177245] px-5 py-3 font-bold text-white"
                          onClick={() => {
                            setActiveBidListing(listing.id);
                            setBidQuantity(String(listing.quantity));
                            setBidPrice(String(listing.expectedPricePerUnit));
                          }}
                          type="button"
                        >
                          <ShoppingBasket size={17} /> {ownBid ? "Update my offer" : "Place an offer"}
                        </button>
                        {ownBid && (
                          <span className="text-sm font-bold text-[#177245]">
                            Current offer: {money.format(bidTotal(ownBid))}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {role === "farmer" && (
                  <div className="border-t border-[#dce5e1] p-6 md:p-7">
                    <h3 className="font-bold">Compare buyer offers</h3>
                    {listing.bids.length > 0 && (
                      <div className="mt-4">
                        <AiAssistant
                          context={JSON.stringify({
                            crop: listing.crop,
                            unit: listing.unit,
                            demoBenchmark: listing.benchmark,
                            offers: listing.bids.map((bid) => ({
                              buyer: bid.buyerName,
                              quantity: bid.quantity,
                              pricePerUnit: bid.pricePerUnit,
                              calculatedTotal: bidTotal(bid),
                              pickupDate: bid.pickupDate,
                              terms: bid.notes,
                            })),
                          })}
                          domain="produce"
                          initialInput="Explain the tradeoffs between these buyer offers without choosing one for me."
                          mode="bid"
                          placeholder="Ask GPT-5.6 to explain price, quantity, total and pickup tradeoffs."
                          title="Explain these offers"
                        />
                      </div>
                    )}
                    {listing.bids.length === 0 ? (
                      <p className="mt-3 text-sm text-[#557089]">No buyer offers yet.</p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {[...listing.bids]
                          .sort((a, b) => bidTotal(b) - bidTotal(a))
                          .map((bid) => {
                            const difference = benchmarkDifference(
                              bid.pricePerUnit,
                              listing.benchmark.modalPrice,
                            );
                            return (
                              <div className="rounded-xl border border-[#dce5e1] p-4" key={bid.id}>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <div>
                                    <p className="text-xs text-[#557089]">Buyer</p>
                                    <p className="mt-1 font-bold">{bid.buyerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#557089]">Unit price</p>
                                    <p className="mt-1 font-bold">{money.format(bid.pricePerUnit)}</p>
                                    <p className={`text-xs font-bold ${difference >= 0 ? "text-[#177245]" : "text-[#9b2c20]"}`}>
                                      {difference >= 0 ? "+" : ""}{difference.toFixed(1)}% vs demo modal
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#557089]">Quantity & total</p>
                                    <p className="mt-1 font-bold">{bid.quantity} {listing.unit}</p>
                                    <p className="text-xs text-[#557089]">{money.format(bidTotal(bid))}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#557089]">Pickup</p>
                                    <p className="mt-1 font-bold">{bid.pickupDate}</p>
                                    <p className="text-xs text-[#557089]">{bid.notes}</p>
                                  </div>
                                </div>
                                {bid.status === "pending" && listing.status === "open" ? (
                                  <button
                                    className="focus-ring mt-4 rounded-full bg-[#102a43] px-4 py-2 text-sm font-bold text-white"
                                    onClick={() => acceptBid(listing.id, bid.id)}
                                    type="button"
                                  >
                                    Accept this offer
                                  </button>
                                ) : (
                                  <p className={`mt-3 text-xs font-bold uppercase tracking-wider ${bid.status === "accepted" ? "text-[#177245]" : "text-[#557089]"}`}>
                                    {bid.status}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {listing.status === "reserved" && acceptedBid && (
                      <button
                        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#177245] px-5 py-3 text-sm font-bold text-white"
                        onClick={() => completePickup(listing.id)}
                        type="button"
                      >
                        <CheckCircle2 size={17} /> Confirm pickup complete
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="card h-fit p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#eef7f1] text-[#177245]">
              <TrendingUp size={19} />
            </span>
            <h2 className="font-bold">Market activity</h2>
          </div>
          <div className="mt-5 grid gap-5">
            {state.activity.slice(0, 6).map((item) => (
              <div className="border-l-2 border-[#b9ddc5] pl-4" key={item.id}>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#557089]">{item.detail}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#8295a5]">
                  {item.createdAt}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[#fff3cf] p-4 text-xs leading-5 text-[#765409]">
            <div className="flex items-center gap-2 font-bold">
              <Leaf size={15} /> Transparency note
            </div>
            <p className="mt-2">
              Benchmarks are fictional demo values, clearly dated and never
              presented as live mandi prices.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
