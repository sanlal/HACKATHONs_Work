export type BookMode = "sell" | "donate";
export type BookStatus = "open" | "reserved" | "completed" | "cancelled";
export type BookRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed";

export type DemoBookRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  message: string;
  status: BookRequestStatus;
  rating: number;
  completedExchanges: number;
};

export type DemoBookListing = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerRating: number;
  ownerCompletedExchanges: number;
  ownerFulfilledDonations: number;
  title: string;
  author: string;
  courseOrClass: string;
  subject: string;
  language: string;
  condition: "like_new" | "good" | "fair";
  mode: BookMode;
  price: number | null;
  city: string;
  area: string;
  status: BookStatus;
  selectedRequestId?: string;
  requests: DemoBookRequest[];
};

export type BookActivity = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

export type BooksDemoState = {
  listings: DemoBookListing[];
  activity: BookActivity[];
};

export const BOOKS_DEMO_STORAGE_KEY = "jeevandwaar-books-demo-v1";
export const DEMO_BOOK_OWNER_ID = "demo-book-owner";
export const DEMO_BOOK_REQUESTER_ID = "demo-book-requester";

export const initialBooksDemoState: BooksDemoState = {
  listings: [
    {
      id: "book-class-10",
      ownerId: DEMO_BOOK_OWNER_ID,
      ownerName: "Meena Sharma",
      ownerRating: 4.8,
      ownerCompletedExchanges: 7,
      ownerFulfilledDonations: 3,
      title: "Telangana Class 10 textbook set",
      author: "SCERT Telangana",
      courseOrClass: "Class 10",
      subject: "Complete set",
      language: "English",
      condition: "good",
      mode: "donate",
      price: null,
      city: "Hyderabad",
      area: "Kukatpally",
      status: "open",
      requests: [
        {
          id: "request-anusha",
          requesterId: "learner-anusha",
          requesterName: "Anusha",
          message:
            "I am starting Class 10 this year and can collect the set this weekend.",
          status: "pending",
          rating: 4.9,
          completedExchanges: 2,
        },
        {
          id: "request-library",
          requesterId: "community-library",
          requesterName: "Uday Community Library",
          message: "The set will be available to students in our evening study room.",
          status: "pending",
          rating: 4.7,
          completedExchanges: 12,
        },
      ],
    },
    {
      id: "book-jee",
      ownerId: "owner-arjun",
      ownerName: "Arjun Rao",
      ownerRating: 4.6,
      ownerCompletedExchanges: 4,
      ownerFulfilledDonations: 0,
      title: "JEE physics and mathematics bundle",
      author: "Multiple authors",
      courseOrClass: "JEE preparation",
      subject: "Physics & Mathematics",
      language: "English",
      condition: "good",
      mode: "sell",
      price: 450,
      city: "Hyderabad",
      area: "Tarnaka",
      status: "open",
      requests: [],
    },
    {
      id: "book-bcom",
      ownerId: "owner-saloni",
      ownerName: "Saloni Verma",
      ownerRating: 5,
      ownerCompletedExchanges: 2,
      ownerFulfilledDonations: 2,
      title: "B.Com first-year reference books",
      author: "Osmania University references",
      courseOrClass: "B.Com Year 1",
      subject: "Accounting & Business Law",
      language: "English",
      condition: "fair",
      mode: "donate",
      price: null,
      city: "Hyderabad",
      area: "Uppal",
      status: "open",
      requests: [],
    },
  ],
  activity: [
    {
      id: "books-demo-ready",
      title: "Book exchange demo ready",
      detail: "Sell or donate books with community-earned trust signals.",
      createdAt: "Today",
    },
  ],
};

export function bookModeLabel(mode: BookMode, price: number | null) {
  return mode === "donate" ? "Free donation" : `₹${price ?? 0}`;
}
