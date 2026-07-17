export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserCapability =
  | "worker"
  | "employer"
  | "farmer"
  | "produce_buyer"
  | "book_owner"
  | "book_requester";
export type JobStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";
export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";
export type ListingStatus = "open" | "reserved" | "completed" | "cancelled";
export type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "completed";
export type BookMode = "sell" | "donate";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  display_name: string;
  phone: string | null;
  preferred_language: string;
  city: string;
  area: string | null;
  avatar_url: string | null;
  average_rating: number;
  completed_exchanges: number;
  fulfilled_donations: number;
  created_at: string;
  updated_at: string;
};

export type WorkerProfileRow = {
  user_id: string;
  headline: string;
  skills: string[];
  service_areas: string[];
  expected_pay_min: number | null;
  pay_period: string | null;
  available_from: string | null;
  travel_preference: string | null;
  updated_at: string;
};

export type JobRow = {
  id: string;
  employer_id: string;
  title: string;
  category: string;
  description: string;
  city: string;
  area: string | null;
  starts_at: string;
  ends_at: string | null;
  pay_amount: number;
  pay_period: string;
  workers_needed: number;
  requirements: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
};

export type JobApplicationRow = {
  id: string;
  job_id: string;
  worker_id: string;
  message: string | null;
  deterministic_match_score: number | null;
  status: ApplicationStatus;
  created_at: string;
};

export type ProduceListingRow = {
  id: string;
  farmer_id: string;
  crop: string;
  variety: string | null;
  quantity: number;
  unit: string;
  grade: string | null;
  harvest_date: string;
  expected_price_per_unit: number | null;
  city: string;
  area: string | null;
  pickup_notes: string | null;
  status: ListingStatus;
  accepted_bid_id: string | null;
  farmer_confirmed_at: string | null;
  buyer_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProduceBidRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  quantity: number;
  price_per_unit: number;
  pickup_date: string;
  notes: string | null;
  status: ApplicationStatus;
  created_at: string;
};

export type PriceBenchmarkRow = {
  id: string;
  crop: string;
  variety: string | null;
  market_name: string;
  state: string;
  unit: string;
  minimum_price: number;
  modal_price: number;
  maximum_price: number;
  observed_on: string;
  source_name: string;
  source_url: string | null;
  is_demo: boolean;
  created_at: string;
};

export type BookListingRow = {
  id: string;
  owner_id: string;
  title: string;
  author: string | null;
  course_or_class: string | null;
  subject: string | null;
  book_language: string;
  condition: string;
  mode: BookMode;
  price: number | null;
  city: string;
  area: string | null;
  status: ListingStatus;
  selected_request_id: string | null;
  owner_confirmed_at: string | null;
  requester_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BookRequestRow = {
  id: string;
  listing_id: string;
  requester_id: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
};

export type ActivityRecordRow = {
  id: string;
  actor_id: string;
  counterparty_id: string | null;
  domain: string;
  subject_id: string;
  event_type: string;
  amount: number | null;
  details: Json;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  activity_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        {
          id: string;
          display_name: string;
          city: string;
          phone?: string | null;
          preferred_language?: string;
          area?: string | null;
          avatar_url?: string | null;
          average_rating?: number;
          completed_exchanges?: number;
          fulfilled_donations?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      user_capabilities: Table<
        { user_id: string; capability: UserCapability; created_at: string },
        { user_id: string; capability: UserCapability; created_at?: string }
      >;
      worker_profiles: Table<
        WorkerProfileRow,
        {
          user_id: string;
          headline: string;
          skills?: string[];
          service_areas?: string[];
          expected_pay_min?: number | null;
          pay_period?: string | null;
          available_from?: string | null;
          travel_preference?: string | null;
          updated_at?: string;
        }
      >;
      jobs: Table<
        JobRow,
        {
          employer_id: string;
          title: string;
          category: string;
          description: string;
          city: string;
          starts_at: string;
          pay_amount: number;
          pay_period: string;
          area?: string | null;
          ends_at?: string | null;
          workers_needed?: number;
          requirements?: string[];
          status?: JobStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      job_applications: Table<
        JobApplicationRow,
        {
          job_id: string;
          worker_id: string;
          message?: string | null;
          deterministic_match_score?: number | null;
          status?: ApplicationStatus;
          created_at?: string;
        }
      >;
      produce_listings: Table<
        ProduceListingRow,
        {
          farmer_id: string;
          crop: string;
          quantity: number;
          unit: string;
          harvest_date: string;
          city: string;
          variety?: string | null;
          grade?: string | null;
          expected_price_per_unit?: number | null;
          area?: string | null;
          pickup_notes?: string | null;
          status?: ListingStatus;
          accepted_bid_id?: string | null;
          farmer_confirmed_at?: string | null;
          buyer_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      produce_bids: Table<
        ProduceBidRow,
        {
          listing_id: string;
          buyer_id: string;
          quantity: number;
          price_per_unit: number;
          pickup_date: string;
          notes?: string | null;
          status?: ApplicationStatus;
          created_at?: string;
        }
      >;
      price_benchmarks: Table<
        PriceBenchmarkRow,
        Omit<PriceBenchmarkRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        }
      >;
      book_listings: Table<
        BookListingRow,
        {
          owner_id: string;
          title: string;
          book_language: string;
          condition: string;
          mode: BookMode;
          city: string;
          author?: string | null;
          course_or_class?: string | null;
          subject?: string | null;
          price?: number | null;
          area?: string | null;
          status?: ListingStatus;
          selected_request_id?: string | null;
          owner_confirmed_at?: string | null;
          requester_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      book_requests: Table<
        BookRequestRow,
        {
          listing_id: string;
          requester_id: string;
          message?: string | null;
          status?: RequestStatus;
          created_at?: string;
        }
      >;
      activity_records: Table<
        ActivityRecordRow,
        {
          actor_id: string;
          domain: string;
          subject_id: string;
          event_type: string;
          counterparty_id?: string | null;
          amount?: number | null;
          details?: Json;
          created_at?: string;
        }
      >;
      reviews: Table<
        ReviewRow,
        {
          reviewer_id: string;
          reviewee_id: string;
          activity_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        }
      >;
      notifications: Table<
        NotificationRow,
        {
          user_id: string;
          title: string;
          body: string;
          href?: string | null;
          read_at?: string | null;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      accept_job_application: {
        Args: { application_id: string };
        Returns: undefined;
      };
      transition_job: {
        Args: { job_id: string; next_status: JobStatus };
        Returns: undefined;
      };
      place_produce_bid: {
        Args: {
          p_listing_id: string;
          p_quantity: number;
          p_price_per_unit: number;
          p_pickup_date: string;
          p_notes?: string | null;
        };
        Returns: string;
      };
      accept_produce_bid: {
        Args: { p_bid_id: string };
        Returns: undefined;
      };
      confirm_produce_pickup: {
        Args: { p_listing_id: string };
        Returns: undefined;
      };
      request_book: {
        Args: { p_listing_id: string; p_message: string };
        Returns: string;
      };
      accept_book_request: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
      confirm_book_handover: {
        Args: { p_listing_id: string };
        Returns: undefined;
      };
      get_public_trust_summary: {
        Args: { p_user_id: string };
        Returns: {
          average_rating: number;
          completed_exchanges: number;
          fulfilled_donations: number;
        }[];
      };
    };
    Enums: {
      user_capability: UserCapability;
      job_status: JobStatus;
      application_status: ApplicationStatus;
      listing_status: ListingStatus;
      request_status: RequestStatus;
      book_mode: BookMode;
    };
    CompositeTypes: Record<string, never>;
  };
};
