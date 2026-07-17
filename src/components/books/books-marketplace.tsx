"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookHeart,
  BookOpen,
  CheckCircle2,
  Gift,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import {
  BOOKS_DEMO_STORAGE_KEY,
  bookModeLabel,
  DEMO_BOOK_OWNER_ID,
  DEMO_BOOK_REQUESTER_ID,
  initialBooksDemoState,
  type BookMode,
  type BooksDemoState,
  type DemoBookListing,
} from "@/lib/books-demo";

function statusClass(status: DemoBookListing["status"]) {
  if (status === "completed") return "bg-[#e5f6eb] text-[#11663b]";
  if (status === "reserved") return "bg-[#fff3cf] text-[#765409]";
  if (status === "cancelled") return "bg-[#fbe8e5] text-[#9b2c20]";
  return "bg-[#e8f0f8] text-[#0b3768]";
}

export function BooksMarketplace() {
  const [role, setRole] = useState<"owner" | "requester">("requester");
  const [state, setState] = useState<BooksDemoState>(initialBooksDemoState);
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | BookMode>("all");
  const [showForm, setShowForm] = useState(false);
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [courseOrClass, setCourseOrClass] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("English");
  const [condition, setCondition] =
    useState<DemoBookListing["condition"]>("good");
  const [mode, setMode] = useState<BookMode>("donate");
  const [price, setPrice] = useState("300");
  const [area, setArea] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(BOOKS_DEMO_STORAGE_KEY);
    if (!saved) return;

    try {
      // Restoring browser-owned demo state after hydration is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(JSON.parse(saved) as BooksDemoState);
    } catch {
      localStorage.removeItem(BOOKS_DEMO_STORAGE_KEY);
    }
  }, []);

  function commit(update: (current: BooksDemoState) => BooksDemoState) {
    setState((current) => {
      const next = update(current);
      localStorage.setItem(BOOKS_DEMO_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function resetDemo() {
    localStorage.removeItem(BOOKS_DEMO_STORAGE_KEY);
    setState(initialBooksDemoState);
    setActiveRequest(null);
    setNotice("Books demo reset to its starting state.");
  }

  function createListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const listing: DemoBookListing = {
      id: `book-${Date.now()}`,
      ownerId: DEMO_BOOK_OWNER_ID,
      ownerName: "Meena Sharma",
      ownerRating: 4.8,
      ownerCompletedExchanges: 7,
      ownerFulfilledDonations: 3,
      title: title.trim(),
      author: author.trim(),
      courseOrClass: courseOrClass.trim(),
      subject: subject.trim(),
      language,
      condition,
      mode,
      price: mode === "sell" ? Number(price) : null,
      city: "Hyderabad",
      area: area.trim(),
      status: "open",
      requests: [],
    };

    commit((current) => ({
      listings: [listing, ...current.listings],
      activity: [
        {
          id: `book-activity-${Date.now()}`,
          title: mode === "donate" ? "Book donation listed" : "Book listed for sale",
          detail: `${listing.title} · ${bookModeLabel(mode, listing.price)}`,
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setShowForm(false);
    setTitle("");
    setAuthor("");
    setCourseOrClass("");
    setSubject("");
    setArea("");
    setNotice("Book listed. Switch to learner view to request it.");
  }

  function requestBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRequest) return;

    commit((current) => ({
      ...current,
      listings: current.listings.map((listing) =>
        listing.id === activeRequest
          ? {
              ...listing,
              requests: [
                ...listing.requests.filter(
                  (request) =>
                    request.requesterId !== DEMO_BOOK_REQUESTER_ID,
                ),
                {
                  id: `book-request-${Date.now()}`,
                  requesterId: DEMO_BOOK_REQUESTER_ID,
                  requesterName: "Rahul",
                  message: requestMessage.trim(),
                  status: "pending",
                  rating: 4.8,
                  completedExchanges: 3,
                },
              ],
            }
          : listing,
      ),
      activity: [
        {
          id: `book-activity-${Date.now()}`,
          title: "Book requested",
          detail:
            current.listings.find((listing) => listing.id === activeRequest)
              ?.title ?? "Community book",
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setActiveRequest(null);
    setRequestMessage("");
    setNotice("Request sent directly to the book owner.");
  }

  function acceptRequest(listingId: string, requestId: string) {
    commit((current) => ({
      ...current,
      listings: current.listings.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: "reserved",
              selectedRequestId: requestId,
              requests: listing.requests.map((request) => ({
                ...request,
                status: request.id === requestId ? "accepted" : "rejected",
              })),
            }
          : listing,
      ),
      activity: [
        {
          id: `book-activity-${Date.now()}`,
          title: "Book recipient selected",
          detail:
            current.listings
              .find((listing) => listing.id === listingId)
              ?.requests.find((request) => request.id === requestId)
              ?.requesterName ?? "Learner",
          createdAt: "Just now",
        },
        ...current.activity,
      ],
    }));
    setNotice("Recipient selected. Arrange the handover directly.");
  }

  function completeHandover(listingId: string) {
    commit((current) => {
      const listing = current.listings.find((item) => item.id === listingId);
      return {
        ...current,
        listings: current.listings.map((item) =>
          item.id === listingId
            ? {
                ...item,
                status: "completed",
                ownerCompletedExchanges: item.ownerCompletedExchanges + 1,
                ownerFulfilledDonations:
                  item.ownerFulfilledDonations +
                  (item.mode === "donate" ? 1 : 0),
                requests: item.requests.map((request) =>
                  request.id === item.selectedRequestId
                    ? { ...request, status: "completed" }
                    : request,
                ),
              }
            : item,
        ),
        activity: [
          {
            id: `book-activity-${Date.now()}`,
            title:
              listing?.mode === "donate"
                ? "Book donation completed"
                : "Book handover completed",
            detail: listing?.title ?? "Community book",
            createdAt: "Just now",
          },
          ...current.activity,
        ],
      };
    });
    setNotice("Handover completed and community trust activity recorded.");
  }

  const visibleListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.listings.filter((listing) => {
      if (role === "owner" && listing.ownerId !== DEMO_BOOK_OWNER_ID) {
        return false;
      }
      if (role === "requester" && listing.status !== "open") {
        return false;
      }
      if (modeFilter !== "all" && listing.mode !== modeFilter) return false;
      if (!normalized) return true;

      return [
        listing.title,
        listing.author,
        listing.courseOrClass,
        listing.subject,
        listing.area,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [modeFilter, query, role, state.listings]);

  return (
    <main className="shell min-h-[76vh] py-12 lg:py-18">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Interactive books marketplace</p>
          <h1 className="section-title">Every useful book deserves another reader.</h1>
          <p className="mt-5 text-lg leading-8 text-[#557089]">
            Sell affordable books or donate them directly, with transparent
            requests and trust earned through completed exchanges.
          </p>
        </div>
        <button
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-[#c9d7d1] bg-white px-5 py-3 text-sm font-bold"
          onClick={resetDemo}
          type="button"
        >
          <RefreshCw size={16} /> Reset demo
        </button>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-[#c9d7d1] bg-white p-1">
          {(["requester", "owner"] as const).map((item) => (
            <button
              className={`focus-ring rounded-full px-5 py-2.5 text-sm font-bold capitalize ${
                role === item ? "bg-[#62358c] text-white" : "text-[#557089]"
              }`}
              key={item}
              onClick={() => {
                setRole(item);
                setNotice("");
                setActiveRequest(null);
              }}
              type="button"
            >
              {item === "requester" ? "Learner view" : "Owner view"}
            </button>
          ))}
        </div>
        <span className="text-sm text-[#557089]">
          {role === "owner" ? "Signed in as Meena Sharma" : "Signed in as Rahul"}
        </span>
      </div>

      {notice && (
        <p
          aria-live="polite"
          className="mt-6 rounded-xl border border-[#d4c2e7] bg-[#f7f1fb] px-4 py-3 text-sm font-semibold text-[#62358c]"
        >
          {notice}
        </p>
      )}

      {role === "owner" && (
        <section className="mt-8">
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#62358c] px-6 py-3.5 font-bold text-white"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            <Plus size={18} /> {showForm ? "Close form" : "List a book"}
          </button>

          {showForm && (
            <form
              className="card mt-5 grid gap-5 p-6 md:grid-cols-2 md:p-8"
              onSubmit={createListing}
            >
              <label className="grid gap-2 text-sm font-bold md:col-span-2">
                Book title
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  minLength={3}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  value={title}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Author or publisher
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) => setAuthor(event.target.value)}
                  required
                  value={author}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Class or course
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) => setCourseOrClass(event.target.value)}
                  required
                  value={courseOrClass}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Subject
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  value={subject}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Language
                <select
                  className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) => setLanguage(event.target.value)}
                  value={language}
                >
                  {["English", "Telugu", "Hindi", "Urdu"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Condition
                <select
                  className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) =>
                    setCondition(
                      event.target.value as DemoBookListing["condition"],
                    )
                  }
                  value={condition}
                >
                  <option value="like_new">Like new</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Listing type
                <select
                  className="rounded-xl border border-[#c9d7d1] bg-white px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) => setMode(event.target.value as BookMode)}
                  value={mode}
                >
                  <option value="donate">Donate for free</option>
                  <option value="sell">Sell affordably</option>
                </select>
              </label>
              {mode === "sell" && (
                <label className="grid gap-2 text-sm font-bold">
                  Price (₹)
                  <input
                    className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                    min={1}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                    type="number"
                    value={price}
                  />
                </label>
              )}
              <label className="grid gap-2 text-sm font-bold">
                Pickup area
                <input
                  className="rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                  onChange={(event) => setArea(event.target.value)}
                  required
                  value={area}
                />
              </label>
              <button
                className="focus-ring rounded-full bg-[#62358c] px-6 py-3.5 font-bold text-white md:col-span-2"
                type="submit"
              >
                Publish book listing
              </button>
            </form>
          )}
        </section>
      )}

      <section className="mt-9 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#557089]"
            size={18}
          />
          <span className="sr-only">Search books</span>
          <input
            className="w-full rounded-full border border-[#c9d7d1] bg-white py-3.5 pl-11 pr-4 outline-none focus:border-[#62358c]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, class, subject or area"
            value={query}
          />
        </label>
        <select
          aria-label="Filter listing type"
          className="rounded-full border border-[#c9d7d1] bg-white px-5 py-3.5 font-bold outline-none focus:border-[#62358c]"
          onChange={(event) =>
            setModeFilter(event.target.value as typeof modeFilter)
          }
          value={modeFilter}
        >
          <option value="all">All books</option>
          <option value="donate">Donations</option>
          <option value="sell">For sale</option>
        </select>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="grid content-start gap-5">
          {visibleListings.map((listing) => {
            const ownRequest = listing.requests.find(
              (request) => request.requesterId === DEMO_BOOK_REQUESTER_ID,
            );
            const selectedRequest = listing.requests.find(
              (request) => request.id === listing.selectedRequestId,
            );
            return (
              <article className="card overflow-hidden" key={listing.id}>
                <div className="p-6 md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            listing.mode === "donate"
                              ? "bg-[#f1e9f8] text-[#62358c]"
                              : "bg-[#e8f0f8] text-[#0b3768]"
                          }`}
                        >
                          {bookModeLabel(listing.mode, listing.price)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(listing.status)}`}
                        >
                          {listing.status}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">
                        {listing.title}
                      </h2>
                      <p className="mt-1 text-sm text-[#557089]">
                        {listing.author} · {listing.courseOrClass}
                      </p>
                    </div>
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#f7f1fb] text-[#62358c]">
                      {listing.mode === "donate" ? (
                        <Gift size={23} />
                      ) : (
                        <BookOpen size={23} />
                      )}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#557089]">
                    <span>{listing.subject}</span>
                    <span>{listing.language}</span>
                    <span className="capitalize">
                      {listing.condition.replace("_", " ")} condition
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} /> {listing.area}, {listing.city}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-[#f8fbf9] p-4 text-sm">
                    <span className="font-bold">{listing.ownerName}</span>
                    <span className="inline-flex items-center gap-1 text-[#765409]">
                      <Star fill="currentColor" size={14} /> {listing.ownerRating}
                    </span>
                    <span className="text-[#557089]">
                      {listing.ownerCompletedExchanges} completed
                    </span>
                    {listing.ownerFulfilledDonations > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f1e9f8] px-3 py-1 font-bold text-[#62358c]">
                        <BookHeart size={14} /> {listing.ownerFulfilledDonations} fulfilled donations
                      </span>
                    )}
                  </div>
                </div>

                {role === "requester" && listing.status === "open" && (
                  <div className="border-t border-[#dce5e1] p-6 md:p-7">
                    {activeRequest === listing.id ? (
                      <form className="grid gap-4" onSubmit={requestBook}>
                        <label className="grid gap-2 text-sm font-bold">
                          Message to the owner
                          <textarea
                            className="min-h-24 rounded-xl border border-[#c9d7d1] px-4 py-3 font-normal outline-none focus:border-[#62358c]"
                            minLength={10}
                            onChange={(event) =>
                              setRequestMessage(event.target.value)
                            }
                            placeholder="Explain when you can collect the book."
                            required
                            value={requestMessage}
                          />
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            className="focus-ring rounded-full bg-[#62358c] px-5 py-3 font-bold text-white"
                            type="submit"
                          >
                            Send request
                          </button>
                          <button
                            className="focus-ring rounded-full border border-[#c9d7d1] px-5 py-3 font-bold"
                            onClick={() => setActiveRequest(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          className="focus-ring rounded-full bg-[#62358c] px-5 py-3 font-bold text-white"
                          onClick={() => setActiveRequest(listing.id)}
                          type="button"
                        >
                          {ownRequest ? "Update my request" : "Request this book"}
                        </button>
                        {ownRequest && (
                          <span className="text-sm font-bold capitalize text-[#62358c]">
                            Request {ownRequest.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {role === "owner" && (
                  <div className="border-t border-[#dce5e1] p-6 md:p-7">
                    <h3 className="font-bold">
                      Requests ({listing.requests.length})
                    </h3>
                    {listing.requests.length === 0 ? (
                      <p className="mt-3 text-sm text-[#557089]">
                        No requests yet.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {listing.requests.map((request) => (
                          <div
                            className="rounded-xl border border-[#dce5e1] p-4"
                            key={request.id}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-bold">{request.requesterName}</p>
                                <p className="mt-2 text-sm leading-6 text-[#557089]">
                                  {request.message}
                                </p>
                              </div>
                              <div className="text-right text-xs text-[#557089]">
                                <p className="inline-flex items-center gap-1 font-bold text-[#765409]">
                                  <Star fill="currentColor" size={13} /> {request.rating}
                                </p>
                                <p>{request.completedExchanges} completed</p>
                              </div>
                            </div>
                            {request.status === "pending" &&
                            listing.status === "open" ? (
                              <button
                                className="focus-ring mt-4 rounded-full bg-[#102a43] px-4 py-2 text-sm font-bold text-white"
                                onClick={() =>
                                  acceptRequest(listing.id, request.id)
                                }
                                type="button"
                              >
                                Select recipient
                              </button>
                            ) : (
                              <p
                                className={`mt-3 text-xs font-bold uppercase tracking-wider ${
                                  request.status === "accepted" ||
                                  request.status === "completed"
                                    ? "text-[#62358c]"
                                    : "text-[#557089]"
                                }`}
                              >
                                {request.status}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {listing.status === "reserved" && selectedRequest && (
                      <button
                        className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#62358c] px-5 py-3 text-sm font-bold text-white"
                        onClick={() => completeHandover(listing.id)}
                        type="button"
                      >
                        <CheckCircle2 size={17} /> Confirm handover complete
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}

          {visibleListings.length === 0 && (
            <div className="card p-8 text-center">
              <BookOpen className="mx-auto text-[#62358c]" size={30} />
              <p className="mt-4 font-bold">No books match these filters.</p>
            </div>
          )}
        </div>

        <aside className="card h-fit p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f7f1fb] text-[#62358c]">
              <ShieldCheck size={19} />
            </span>
            <h2 className="font-bold">Community trust</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#557089]">
            Trust signals come only from completed activity and community
            reviews. They are not identity verification.
          </p>
          <div className="mt-5 grid gap-5">
            {state.activity.slice(0, 6).map((item) => (
              <div className="border-l-2 border-[#d4c2e7] pl-4" key={item.id}>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#557089]">
                  {item.detail}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#8295a5]">
                  {item.createdAt}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[#f7f1fb] p-4 text-xs leading-5 text-[#62358c]">
            <div className="flex items-center gap-2 font-bold">
              <UserRound size={15} /> Safety reminder
            </div>
            <p className="mt-2">
              Meet in a public place, inspect books before payment and never
              share unnecessary personal information.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
