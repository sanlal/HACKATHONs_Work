import { Leaf } from "lucide-react";
import { MarketplacePreview } from "@/components/marketplace-preview";

const examples = [
  {
    meta: "Nalgonda · Harvested today",
    title: "Fine-grade paddy · 80 quintals",
    detail: "Farm pickup available. Buyers can bid by quantity, price per quintal and pickup date.",
  },
  {
    meta: "Siddipet · Ready in 3 days",
    title: "Maize · 45 quintals",
    detail: "Dry produce with recent quality photos. Seller is open to partial-quantity offers.",
  },
  {
    meta: "Warangal · Farm pickup",
    title: "Fresh green chillies · 600 kg",
    detail: "Same-day pickup preferred. All benchmark prices will show their source and date.",
  },
];

export default function ProducePage() {
  return (
    <MarketplacePreview
      action="List farm produce"
      description="Farmers can publish harvest details and receive comparable bids directly from buyers. Transparent totals and pickup terms support a better-informed choice."
      eyebrow="Farmer direct market"
      examples={examples}
      icon={Leaf}
      title="Compare direct offers before choosing a buyer."
    />
  );
}
