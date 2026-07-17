import { calculateMatchScore, type WorkDemoState } from "@/lib/work-demo";
import type { ProduceDemoState } from "@/lib/produce-demo";
import type { BooksDemoState } from "@/lib/books-demo";
import { getSupabaseBrowserClient } from "./client";
import type {
  BookListingRow,
  JobStatus,
  PriceBenchmarkRow,
  ProfileRow,
} from "./database.types";

function client() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function message(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function profileMap(profiles: ProfileRow[] | null) {
  return new Map((profiles ?? []).map((profile) => [profile.id, profile]));
}

export async function loadLiveWork(): Promise<WorkDemoState> {
  const supabase = client();
  const [jobsResult, applicationsResult, profilesResult, workersResult, activityResult] =
    await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("job_applications").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("worker_profiles").select("*"),
      supabase
        .from("activity_records")
        .select("*")
        .eq("domain", "work")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
  message(jobsResult.error);
  message(applicationsResult.error);
  message(profilesResult.error);
  message(workersResult.error);
  message(activityResult.error);

  const profiles = profileMap(profilesResult.data);
  const skills = new Map(
    (workersResult.data ?? []).map((worker) => [worker.user_id, worker.skills]),
  );

  return {
    jobs: (jobsResult.data ?? []).map((job) => ({
      id: job.id,
      employerId: job.employer_id,
      employerName:
        profiles.get(job.employer_id)?.display_name ?? "Local employer",
      title: job.title,
      category: job.category,
      description: job.description,
      city: job.city,
      area: job.area ?? "",
      startsAt: job.starts_at.slice(0, 16),
      payAmount: job.pay_amount,
      payPeriod: job.pay_period as "hour" | "shift" | "day" | "month",
      workersNeeded: job.workers_needed,
      requirements: job.requirements,
      status: job.status,
      applications: (applicationsResult.data ?? [])
        .filter((application) => application.job_id === job.id)
        .map((application) => ({
          id: application.id,
          workerId: application.worker_id,
          workerName:
            profiles.get(application.worker_id)?.display_name ?? "Local worker",
          skills: skills.get(application.worker_id) ?? [],
          message: application.message ?? "",
          status:
            application.status === "withdrawn"
              ? ("rejected" as const)
              : application.status,
          matchScore: application.deterministic_match_score ?? 0,
        })),
    })),
    activity: (activityResult.data ?? []).map((activity) => ({
      id: activity.id,
      title:
        activity.event_type === "job_completed"
          ? "Work completed"
          : "Work activity",
      detail: `Verified ${activity.domain} activity`,
      createdAt: new Date(activity.created_at).toLocaleDateString("en-IN"),
    })),
  };
}

export async function createLiveJob(input: {
  userId: string;
  title: string;
  category: string;
  description: string;
  city: string;
  area: string;
  startsAt: string;
  payAmount: number;
  workersNeeded: number;
  requirements: string[];
}) {
  const { error } = await client().from("jobs").insert({
    employer_id: input.userId,
    title: input.title,
    category: input.category,
    description: input.description,
    city: input.city,
    area: input.area || null,
    starts_at: new Date(input.startsAt).toISOString(),
    pay_amount: input.payAmount,
    pay_period: "shift",
    workers_needed: input.workersNeeded,
    requirements: input.requirements,
  });
  message(error);
}

export async function applyToLiveJob(input: {
  userId: string;
  jobId: string;
  requirements: string[];
  skills: string[];
}) {
  const { error } = await client().from("job_applications").insert({
    job_id: input.jobId,
    worker_id: input.userId,
    message: "I am available and interested in this work.",
    deterministic_match_score: calculateMatchScore(
      input.requirements,
      input.skills,
    ),
  });
  message(error);
}

export async function acceptLiveApplication(applicationId: string) {
  const { error } = await client().rpc("accept_job_application", {
    application_id: applicationId,
  });
  message(error);
}

export async function transitionLiveJob(
  jobId: string,
  nextStatus: Extract<JobStatus, "in_progress" | "completed">,
) {
  const { error } = await client().rpc("transition_job", {
    job_id: jobId,
    next_status: nextStatus,
  });
  message(error);
}

function nearestBenchmark(
  listing: { crop: string; expected_price_per_unit: number | null },
  benchmarks: PriceBenchmarkRow[],
) {
  const matched = benchmarks.find(
    (benchmark) =>
      benchmark.crop.toLowerCase() === listing.crop.toLowerCase(),
  );
  if (matched) {
    return {
      marketName: matched.market_name,
      modalPrice: matched.modal_price,
      minimumPrice: matched.minimum_price,
      maximumPrice: matched.maximum_price,
      observedOn: matched.observed_on,
      sourceName: matched.source_name,
      isDemo: true as const,
    };
  }
  const reference = listing.expected_price_per_unit ?? 0;
  return {
    marketName: "No matching benchmark",
    modalPrice: reference,
    minimumPrice: reference,
    maximumPrice: reference,
    observedOn: new Date().toISOString().slice(0, 10),
    sourceName: "Seller expectation—not a market benchmark",
    isDemo: true as const,
  };
}

export async function loadLiveProduce(): Promise<ProduceDemoState> {
  const supabase = client();
  const [listingsResult, bidsResult, profilesResult, benchmarksResult, activityResult] =
    await Promise.all([
      supabase
        .from("produce_listings")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("produce_bids").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("price_benchmarks").select("*"),
      supabase
        .from("activity_records")
        .select("*")
        .eq("domain", "produce")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
  message(listingsResult.error);
  message(bidsResult.error);
  message(profilesResult.error);
  message(benchmarksResult.error);
  message(activityResult.error);
  const profiles = profileMap(profilesResult.data);

  return {
    listings: (listingsResult.data ?? []).map((listing) => ({
      id: listing.id,
      farmerId: listing.farmer_id,
      farmerName:
        profiles.get(listing.farmer_id)?.display_name ?? "Local farmer",
      crop: listing.crop,
      variety: listing.variety ?? "",
      quantity: listing.quantity,
      unit: listing.unit as "kg" | "quintal" | "tonne",
      grade: listing.grade ?? "",
      harvestDate: listing.harvest_date,
      expectedPricePerUnit: listing.expected_price_per_unit ?? 0,
      city: listing.city,
      area: listing.area ?? "",
      pickupNotes: listing.pickup_notes ?? "",
      status: listing.status,
      acceptedBidId: listing.accepted_bid_id ?? undefined,
      benchmark: nearestBenchmark(listing, benchmarksResult.data ?? []),
      bids: (bidsResult.data ?? [])
        .filter((bid) => bid.listing_id === listing.id)
        .map((bid) => ({
          id: bid.id,
          buyerId: bid.buyer_id,
          buyerName:
            profiles.get(bid.buyer_id)?.display_name ?? "Direct buyer",
          quantity: bid.quantity,
          pricePerUnit: bid.price_per_unit,
          pickupDate: bid.pickup_date,
          notes: bid.notes ?? "",
          status:
            bid.status === "withdrawn" ? ("rejected" as const) : bid.status,
        })),
    })),
    activity: (activityResult.data ?? []).map((activity) => ({
      id: activity.id,
      title: "Produce exchange completed",
      detail: "Pickup confirmed by both participants",
      createdAt: new Date(activity.created_at).toLocaleDateString("en-IN"),
    })),
  };
}

export async function createLiveProduceListing(input: {
  userId: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: "kg" | "quintal" | "tonne";
  grade: string;
  harvestDate: string;
  expectedPrice: number;
  city: string;
  area: string;
  pickupNotes: string;
}) {
  const { error } = await client().from("produce_listings").insert({
    farmer_id: input.userId,
    crop: input.crop,
    variety: input.variety || null,
    quantity: input.quantity,
    unit: input.unit,
    grade: input.grade || null,
    harvest_date: input.harvestDate,
    expected_price_per_unit: input.expectedPrice,
    city: input.city,
    area: input.area || null,
    pickup_notes: input.pickupNotes || null,
  });
  message(error);
}

export async function placeLiveProduceBid(input: {
  listingId: string;
  quantity: number;
  pricePerUnit: number;
  pickupDate: string;
  notes: string;
}) {
  const { error } = await client().rpc("place_produce_bid", {
    p_listing_id: input.listingId,
    p_quantity: input.quantity,
    p_price_per_unit: input.pricePerUnit,
    p_pickup_date: input.pickupDate,
    p_notes: input.notes || null,
  });
  message(error);
}

export async function acceptLiveProduceBid(bidId: string) {
  const { error } = await client().rpc("accept_produce_bid", {
    p_bid_id: bidId,
  });
  message(error);
}

export async function confirmLiveProducePickup(listingId: string) {
  const { error } = await client().rpc("confirm_produce_pickup", {
    p_listing_id: listingId,
  });
  message(error);
}

export async function loadLiveBooks(): Promise<BooksDemoState> {
  const supabase = client();
  const [listingsResult, requestsResult, profilesResult, activityResult] =
    await Promise.all([
      supabase
        .from("book_listings")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("book_requests").select("*"),
      supabase.from("profiles").select("*"),
      supabase
        .from("activity_records")
        .select("*")
        .eq("domain", "books")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
  message(listingsResult.error);
  message(requestsResult.error);
  message(profilesResult.error);
  message(activityResult.error);
  const profiles = profileMap(profilesResult.data);

  function mapListing(listing: BookListingRow) {
    const owner = profiles.get(listing.owner_id);
    return {
      id: listing.id,
      ownerId: listing.owner_id,
      ownerName: owner?.display_name ?? "Community member",
      ownerRating: owner?.average_rating ?? 0,
      ownerCompletedExchanges: owner?.completed_exchanges ?? 0,
      ownerFulfilledDonations: owner?.fulfilled_donations ?? 0,
      title: listing.title,
      author: listing.author ?? "",
      courseOrClass: listing.course_or_class ?? "",
      subject: listing.subject ?? "",
      language: listing.book_language,
      condition: listing.condition as "like_new" | "good" | "fair",
      mode: listing.mode,
      price: listing.price,
      city: listing.city,
      area: listing.area ?? "",
      status: listing.status,
      selectedRequestId: listing.selected_request_id ?? undefined,
      requests: (requestsResult.data ?? [])
        .filter((request) => request.listing_id === listing.id)
        .map((request) => {
          const requester = profiles.get(request.requester_id);
          return {
            id: request.id,
            requesterId: request.requester_id,
            requesterName: requester?.display_name ?? "Learner",
            message: request.message ?? "",
            status:
              request.status === "withdrawn"
                ? ("rejected" as const)
                : request.status,
            rating: requester?.average_rating ?? 0,
            completedExchanges: requester?.completed_exchanges ?? 0,
          };
        }),
    };
  }

  return {
    listings: (listingsResult.data ?? []).map(mapListing),
    activity: (activityResult.data ?? []).map((activity) => ({
      id: activity.id,
      title: "Book exchange completed",
      detail: "Handover confirmed by both participants",
      createdAt: new Date(activity.created_at).toLocaleDateString("en-IN"),
    })),
  };
}

export async function createLiveBookListing(input: {
  userId: string;
  title: string;
  author: string;
  courseOrClass: string;
  subject: string;
  language: string;
  condition: "like_new" | "good" | "fair";
  mode: "sell" | "donate";
  price: number | null;
  city: string;
  area: string;
}) {
  const { error } = await client().from("book_listings").insert({
    owner_id: input.userId,
    title: input.title,
    author: input.author || null,
    course_or_class: input.courseOrClass || null,
    subject: input.subject || null,
    book_language: input.language,
    condition: input.condition,
    mode: input.mode,
    price: input.price,
    city: input.city,
    area: input.area || null,
  });
  message(error);
}

export async function requestLiveBook(listingId: string, requestMessage: string) {
  const { error } = await client().rpc("request_book", {
    p_listing_id: listingId,
    p_message: requestMessage,
  });
  message(error);
}

export async function acceptLiveBookRequest(requestId: string) {
  const { error } = await client().rpc("accept_book_request", {
    p_request_id: requestId,
  });
  message(error);
}

export async function confirmLiveBookHandover(listingId: string) {
  const { error } = await client().rpc("confirm_book_handover", {
    p_listing_id: listingId,
  });
  message(error);
}
