import { z } from "zod";

export const aiDomainSchema = z.enum(["work", "produce", "books"]);
export const aiModeSchema = z.enum(["listing", "match", "bid"]);
export const aiLanguageSchema = z.enum(["en", "te"]);

export const aiAssistRequestSchema = z.object({
  domain: aiDomainSchema,
  mode: aiModeSchema,
  language: aiLanguageSchema,
  input: z.string().trim().min(8).max(1800),
  context: z.string().trim().max(3000).optional().default(""),
});

export const aiSuggestionSchema = z.object({
  field: z.string().min(1).max(40),
  value: z.string().max(500),
});

export const aiAssistResultSchema = z.object({
  title: z.string().min(1).max(140),
  summary: z.string().min(1).max(700),
  suggestions: z.array(aiSuggestionSchema).max(12),
  explanation: z.string().min(1).max(900),
  cautions: z.array(z.string().max(240)).max(5),
  language: aiLanguageSchema,
});

export type AiAssistRequest = z.infer<typeof aiAssistRequestSchema>;
export type AiAssistResult = z.infer<typeof aiAssistResultSchema>;
export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;
