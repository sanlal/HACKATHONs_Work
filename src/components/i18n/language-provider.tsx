"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Language = "en" | "te";

const translations = {
  en: {
    work: "Find work",
    produce: "Farm market",
    books: "Books",
    dashboard: "Dashboard",
    signIn: "Sign in",
    language: "Language",
    workTitle: "Direct local work, from post to completion.",
    produceTitle: "Compare the whole offer—not only one number.",
    booksTitle: "Every useful book deserves another reader.",
    workerView: "Worker view",
    employerView: "Employer view",
    farmerView: "Farmer view",
    buyerView: "Buyer view",
    learnerView: "Learner view",
    ownerView: "Owner view",
    resetDemo: "Reset demo",
    refreshLive: "Refresh live data",
  },
  te: {
    work: "పని వెతకండి",
    produce: "రైతు మార్కెట్",
    books: "పుస్తకాలు",
    dashboard: "డ్యాష్‌బోర్డ్",
    signIn: "సైన్ ఇన్",
    language: "భాష",
    workTitle: "పని ప్రకటన నుంచి పూర్తి వరకు నేరుగా స్థానిక పని.",
    produceTitle: "ఒక ధర మాత్రమే కాదు—మొత్తం ఆఫర్‌ను పోల్చండి.",
    booksTitle: "ప్రతి ఉపయోగకరమైన పుస్తకానికి మరో పాఠకుడు కావాలి.",
    workerView: "కార్మికుడి వీక్షణ",
    employerView: "యజమాని వీక్షణ",
    farmerView: "రైతు వీక్షణ",
    buyerView: "కొనుగోలుదారు వీక్షణ",
    learnerView: "విద్యార్థి వీక్షణ",
    ownerView: "పుస్తక యజమాని వీక్షణ",
    resetDemo: "డెమో రీసెట్",
    refreshLive: "లైవ్ డేటా రిఫ్రెష్",
  },
} as const;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  text: (key: keyof (typeof translations)["en"]) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("jeevandwaar-language");
    if (saved === "en" || saved === "te") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(saved);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage(next) {
        setLanguageState(next);
        localStorage.setItem("jeevandwaar-language", next);
        document.documentElement.lang = next;
      },
      text(key) {
        return translations[language][key];
      },
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
