export type ProduceStatus = "open" | "reserved" | "completed" | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected";

export type DemoBid = {
  id: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  pricePerUnit: number;
  pickupDate: string;
  notes: string;
  status: BidStatus;
};

export type DemoBenchmark = {
  marketName: string;
  modalPrice: number;
  minimumPrice: number;
  maximumPrice: number;
  observedOn: string;
  sourceName: string;
  isDemo: true;
};

export type DemoProduceListing = {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: "kg" | "quintal" | "tonne";
  grade: string;
  harvestDate: string;
  expectedPricePerUnit: number;
  city: string;
  area: string;
  pickupNotes: string;
  status: ProduceStatus;
  acceptedBidId?: string;
  benchmark: DemoBenchmark;
  bids: DemoBid[];
};

export type ProduceActivity = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
};

export type ProduceDemoState = {
  listings: DemoProduceListing[];
  activity: ProduceActivity[];
};

export const PRODUCE_DEMO_STORAGE_KEY = "jeevandwaar-produce-demo-v1";
export const DEMO_FARMER_ID = "demo-farmer";
export const DEMO_BUYER_ID = "demo-buyer";

const paddyBenchmark: DemoBenchmark = {
  marketName: "Nalgonda Demo Market",
  modalPrice: 2380,
  minimumPrice: 2200,
  maximumPrice: 2520,
  observedOn: "2026-07-14",
  sourceName: "JeevanDwaar demonstration dataset",
  isDemo: true,
};

export const initialProduceDemoState: ProduceDemoState = {
  listings: [
    {
      id: "produce-paddy",
      farmerId: DEMO_FARMER_ID,
      farmerName: "Ramesh Naik",
      crop: "Paddy",
      variety: "Fine",
      quantity: 80,
      unit: "quintal",
      grade: "Grade A",
      harvestDate: "2026-07-14",
      expectedPricePerUnit: 2400,
      city: "Nalgonda",
      area: "Miryalaguda",
      pickupNotes: "Farm pickup. Weighment can be completed at the nearby mill.",
      status: "open",
      benchmark: paddyBenchmark,
      bids: [
        {
          id: "bid-lakshmi-mill",
          buyerId: "buyer-lakshmi",
          buyerName: "Lakshmi Rice Mill",
          quantity: 80,
          pricePerUnit: 2460,
          pickupDate: "2026-07-17",
          notes: "Full quantity with pickup and loading arranged.",
          status: "pending",
        },
        {
          id: "bid-telangana-foods",
          buyerId: "buyer-telangana",
          buyerName: "Telangana Foods Cooperative",
          quantity: 65,
          pricePerUnit: 2510,
          pickupDate: "2026-07-19",
          notes: "Higher unit price for 65 quintals; farmer arranges loading.",
          status: "pending",
        },
      ],
    },
    {
      id: "produce-maize",
      farmerId: "farmer-anitha",
      farmerName: "Anitha Reddy",
      crop: "Maize",
      variety: "Local hybrid",
      quantity: 45,
      unit: "quintal",
      grade: "Good",
      harvestDate: "2026-07-16",
      expectedPricePerUnit: 2200,
      city: "Siddipet",
      area: "Gajwel",
      pickupNotes: "Partial quantity bids are welcome.",
      status: "open",
      benchmark: {
        marketName: "Siddipet Demo Market",
        modalPrice: 2180,
        minimumPrice: 2050,
        maximumPrice: 2290,
        observedOn: "2026-07-14",
        sourceName: "JeevanDwaar demonstration dataset",
        isDemo: true,
      },
      bids: [],
    },
  ],
  activity: [
    {
      id: "produce-demo-ready",
      title: "Direct market demo ready",
      detail: "Compare bids by total value, benchmark difference and pickup date.",
      createdAt: "Today",
    },
  ],
};

export function bidTotal(bid: Pick<DemoBid, "quantity" | "pricePerUnit">) {
  return bid.quantity * bid.pricePerUnit;
}

export function benchmarkDifference(
  pricePerUnit: number,
  modalPrice: number,
) {
  if (modalPrice === 0) return 0;
  return ((pricePerUnit - modalPrice) / modalPrice) * 100;
}
