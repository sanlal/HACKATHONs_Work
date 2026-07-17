import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "../../src/lib/work-demo";
import {
  benchmarkDifference,
  bidTotal,
} from "../../src/lib/produce-demo";
import { bookModeLabel } from "../../src/lib/books-demo";
import { createFallbackAssistance } from "../../src/lib/ai/fallback";

describe("deterministic marketplace calculations", () => {
  it("calculates an exact job skill match without using AI", () => {
    expect(
      calculateMatchScore(
        ["Event service", "Guest support"],
        ["Event service", "Guest support", "Driving"],
      ),
    ).toBe(100);
    expect(calculateMatchScore(["Driving"], ["Cooking"])).toBe(55);
  });

  it("calculates produce totals and benchmark differences in code", () => {
    expect(bidTotal({ quantity: 80, pricePerUnit: 2460 })).toBe(196800);
    expect(benchmarkDifference(2460, 2380)).toBeCloseTo(3.361, 2);
  });

  it("labels donations and sales truthfully", () => {
    expect(bookModeLabel("donate", null)).toBe("Free donation");
    expect(bookModeLabel("sell", 450)).toBe("₹450");
  });
});

describe("AI deterministic fallback", () => {
  it("returns editable work fields when credentials are unavailable", () => {
    const result = createFallbackAssistance({
      domain: "work",
      mode: "listing",
      language: "en",
      input: "Need six dining helpers tomorrow for 900 rupees.",
      context: "",
    });
    expect(result.suggestions.some((item) => item.field === "title")).toBe(true);
    expect(result.cautions.join(" ")).toContain("Fallback");
  });

  it("returns Telugu decision-support copy without choosing a bid", () => {
    const result = createFallbackAssistance({
      domain: "produce",
      mode: "bid",
      language: "te",
      input: "ఈ రెండు కొనుగోలు ఆఫర్ల మధ్య తేడాలను వివరించండి.",
      context: "Offer A total 100. Offer B total 120.",
    });
    expect(result.language).toBe("te");
    expect(result.explanation.length).toBeGreaterThan(20);
  });
});
