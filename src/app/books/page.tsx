import { BookOpen } from "lucide-react";
import { MarketplacePreview } from "@/components/marketplace-preview";

const examples = [
  {
    meta: "Donation · Kukatpally",
    title: "Telangana Class 10 textbook set",
    detail: "Complete used set in good condition. Free local pickup for a learner who needs it.",
  },
  {
    meta: "₹450 · Tarnaka",
    title: "JEE preparation books",
    detail: "Three-book physics and mathematics bundle with light pencil notes.",
  },
  {
    meta: "Donation · Uppal",
    title: "B.Com first-year reference books",
    detail: "Accounting and business law books available together or separately.",
  },
];

export default function BooksPage() {
  return (
    <MarketplacePreview
      action="List or request a book"
      description="Useful books can move directly from one home to another. Owners choose whether to sell or donate, and learners can search by course, subject and location."
      eyebrow="Books for all"
      examples={examples}
      icon={BookOpen}
      title="Give every useful book another chapter."
    />
  );
}
