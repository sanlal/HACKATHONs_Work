import { BriefcaseBusiness } from "lucide-react";
import { MarketplacePreview } from "@/components/marketplace-preview";

const examples = [
  {
    meta: "Madhapur · Tomorrow",
    title: "Function hall service helpers",
    detail: "Six helpers needed for guest service and dining setup. ₹900 per shift, meal included.",
  },
  {
    meta: "Secunderabad · Weekdays",
    title: "School auto driver",
    detail: "Morning and evening route for a local school. Valid documents and references required.",
  },
  {
    meta: "Gachibowli · This weekend",
    title: "Home cooking assistant",
    detail: "Preparation and kitchen support for a family event. Experience with Telugu cuisine preferred.",
  },
];

export default function WorkPage() {
  return (
    <MarketplacePreview
      action="Create a work profile"
      description="Workers and service providers can show their skills, availability, expected pay and service area. Employers can post clear roles and connect without hidden commissions."
      eyebrow="Local work & services"
      examples={examples}
      icon={BriefcaseBusiness}
      title="Find work that respects your skills and time."
    />
  );
}
