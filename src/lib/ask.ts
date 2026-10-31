// Grounding for the "Ask me anything" box. The model only sees these facts, which are the same ones the
// website publishes, so its answers can't drift from what the site says.
import { DEFINITION, ENERGY_RULES, FACTS, FAQ, FAQ_EXTRA, RELEASE, ROADMAP, TIERS, VISIBILITY } from "@/lib/content";

export const ASK_LIMITS = { minChars: 3, maxChars: 300 } as const;

export function askSystemPrompt(): string {
  const lines = [
    "You answer visitors' questions about Atomic Notes on its official website.",
    "Use only the facts below. If the facts don't cover the question, say you don't know and point to the FAQ or the GitHub repository.",
    "Never invent features, prices, dates or promises. Never ask for passwords, recovery phrases or personal data.",
    "Answer in plain text, at most 120 words, in the visitor's language. No markdown headings.",
    "Questions unrelated to Atomic Notes: politely say you only answer questions about Atomic Notes.",
    "",
    `What it is: ${DEFINITION}`,
    `Current release: ${RELEASE.version}, released ${RELEASE.date}, needs ${RELEASE.minAndroid} or newer.`,
    "",
    "Facts:",
    ...FACTS.map((f) => `- ${f.k}: ${f.v}`),
    "",
    "Who can see what (vault off / vault on):",
    ...VISIBILITY.map((v) => `- ${v.who}: ${v.off} / ${v.on}`),
    "",
    "Atomic Energy rules:",
    ...ENERGY_RULES.map((r) => `- ${r.k}: ${r.v}`),
    "",
    "Note capacity tiers:",
    ...TIERS.map((t) => `- ${t.name}: ${t.notes} notes, ${t.cost}`),
    "",
    "Roadmap:",
    ...ROADMAP.map((r) => `- ${r.title} (${r.state === "done" ? "shipped" : r.state === "now" ? "in progress" : "planned"})`),
    "",
    "FAQ:",
    ...[...FAQ, ...FAQ_EXTRA].map((f) => `Q: ${f.q}\nA: ${f.a}`),
  ];
  return lines.join("\n");
}
