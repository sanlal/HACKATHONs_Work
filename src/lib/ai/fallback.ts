import type { AiAssistRequest, AiAssistResult } from "./schemas";

const telugu = {
  listingTitle: "మీ వివరాలను సవరించి ప్రచురించండి",
  listingExplanation:
    "మీ వాక్యాన్ని స్పష్టమైన జాబితాగా మార్చాము. ప్రచురించే ముందు ప్రతి వివరాన్ని మీరు నిర్ధారించాలి.",
  matchTitle: "పారదర్శక సరిపోలిక వివరణ",
  matchExplanation:
    "నైపుణ్యాలు, ప్రదేశం, లభ్యత మరియు వేతన వివరాల ఆధారంగా ఈ సరిపోలికను వివరించాము. తుది నిర్ణయం యజమానిదే.",
  bidTitle: "కొనుగోలు ఆఫర్ వివరణ",
  bidExplanation:
    "యూనిట్ ధర, పరిమాణం, మొత్తం విలువ మరియు పికప్ తేదీని పోల్చండి. ఏ ఆఫర్‌ను ఎంచుకోవాలో రైతే నిర్ణయిస్తారు.",
  caution: "ఇది డెమో సహాయం. ప్రచురించే ముందు వివరాలను తనిఖీ చేయండి.",
};

function extractNumber(input: string) {
  return input.match(/\d[\d,]*/)?.[0]?.replaceAll(",", "") ?? "";
}

export function createFallbackAssistance(
  request: AiAssistRequest,
): AiAssistResult {
  const isTelugu = request.language === "te";
  const input = request.input.trim();

  if (request.mode === "match") {
    return {
      title: isTelugu ? telugu.matchTitle : "Transparent match explanation",
      summary: input,
      suggestions: [],
      explanation: isTelugu
        ? telugu.matchExplanation
        : "This match uses only declared skills, location, availability and pay fit. The score supports review; it does not make the hiring decision.",
      cautions: [
        isTelugu
          ? telugu.caution
          : "Do not use protected characteristics or inferred personal traits.",
      ],
      language: request.language,
    };
  }

  if (request.mode === "bid") {
    return {
      title: isTelugu ? telugu.bidTitle : "Buyer-offer comparison",
      summary: input,
      suggestions: [],
      explanation: isTelugu
        ? telugu.bidExplanation
        : "Compare unit price, offered quantity, calculated total value, pickup date and loading terms. A higher unit price may still produce a lower total for a partial quantity.",
      cautions: [
        isTelugu
          ? telugu.caution
          : "Demo benchmarks are not live mandi prices or financial advice.",
      ],
      language: request.language,
    };
  }

  const number = extractNumber(input);
  const common = [
    { field: "description", value: input },
    { field: "area", value: "" },
  ];
  const domainSuggestions =
    request.domain === "work"
      ? [
          { field: "title", value: isTelugu ? "స్థానిక సేవా పని" : "Local service opportunity" },
          { field: "category", value: "Events" },
          { field: "payAmount", value: number },
          { field: "requirements", value: "" },
          ...common,
        ]
      : request.domain === "produce"
        ? [
            { field: "crop", value: isTelugu ? "వరి" : "Paddy" },
            { field: "quantity", value: number },
            { field: "grade", value: "Good" },
            { field: "pickupNotes", value: input },
            { field: "area", value: "" },
          ]
        : [
            { field: "title", value: isTelugu ? "ఉపయోగించిన పుస్తకం" : "Useful second-hand book" },
            { field: "courseOrClass", value: "" },
            { field: "subject", value: "" },
            { field: "mode", value: input.toLowerCase().includes("donat") ? "donate" : "sell" },
            { field: "area", value: "" },
          ];

  return {
    title: isTelugu ? telugu.listingTitle : "Review your assisted listing",
    summary: input,
    suggestions: domainSuggestions,
    explanation: isTelugu
      ? telugu.listingExplanation
      : "The assistant converted your description into editable fields. You remain responsible for checking and publishing every value.",
    cautions: [
      isTelugu
        ? telugu.caution
        : "Fallback mode is active; add an OpenAI API key for GPT-5.6 extraction.",
    ],
    language: request.language,
  };
}
