/**
 * Support rewards: Atomic Coins for each whole-dollar amount from $1 to $10, and where to pay.
 *
 * This is a versioned table, not a formula. Amounts are in integer US cents.
 * - $2, $4 and $10 are the Patreon memberships (Spark, Catalyst, Reactor): the same coins each paid month.
 * - Every other amount is a one-time payment on Ko-fi, where the supporter enters the amount.
 *
 * The page only previews rewards. Coins are granted by hand on the Server, after the payment is
 * checked, against the amount actually paid. Change a reward here and bump the version.
 */

export const SUPPORT_PRICING_VERSION = "2026-10-11.v2";

/** Coins per dollar before any bonus. */
export const BASE_COINS_PER_DOLLAR = 10;

export type MembershipId = "spark" | "catalyst" | "reactor";
export type Channel = "patreon" | "kofi";

export type RewardStep = {
  cents: number;
  coins: number;
  /** Set when this amount is a Patreon membership; otherwise it's a one-time Ko-fi payment. */
  membership?: MembershipId;
};

export const REWARD_STEPS: readonly RewardStep[] = [
  { cents: 100, coins: 10 },
  { cents: 200, coins: 20, membership: "spark" },
  { cents: 300, coins: 30 },
  { cents: 400, coins: 50, membership: "catalyst" },
  { cents: 500, coins: 65 },
  { cents: 600, coins: 80 },
  { cents: 700, coins: 95 },
  { cents: 800, coins: 110 },
  { cents: 900, coins: 130 },
  { cents: 1000, coins: 150, membership: "reactor" },
];

export const MIN_CENTS = REWARD_STEPS[0].cents;
export const MAX_CENTS = REWARD_STEPS[REWARD_STEPS.length - 1].cents;
export const STEP_CENTS = 100;
export const DEFAULT_CENTS = 400;
export const PRESET_CENTS: readonly number[] = [200, 400, 1000];

export type Quote = {
  cents: number;
  coins: number;
  bonusCoins: number;
  channel: Channel;
  membership: Membership | null;
  version: string;
};

export type Membership = {
  id: MembershipId;
  level: string;
  name: string;
  tagline: string;
  cents: number;
  coins: number;
  impact: string;
  benefits: string[];
  cta: string;
  cover: string;
  badge?: string;
};

export const MEMBERSHIPS: readonly Membership[] = [
  {
    id: "spark",
    level: "01",
    name: "Atomic Spark",
    tagline: "Ignite the build",
    cents: 200,
    coins: 20,
    impact: "A small, steady push that keeps independent development moving.",
    benefits: ["20 Atomic Coins each paid month", "Supporter development updates"],
    cta: "Ignite the spark",
    cover: "/support/atomic-spark-cover.webp",
  },
  {
    id: "catalyst",
    level: "02",
    name: "Atomic Catalyst",
    tagline: "Keep the orbit moving",
    cents: 400,
    coins: 50,
    impact: "Helps cover sync infrastructure, debugging, and real-device testing.",
    benefits: ["50 Atomic Coins each paid month", "Supporter development updates"],
    cta: "Become a catalyst",
    cover: "/support/atomic-catalyst-cover.webp",
    badge: "Good balance",
  },
  {
    id: "reactor",
    level: "03",
    name: "Atomic Reactor",
    tagline: "Power the build",
    cents: 1000,
    coins: 150,
    impact: "Backs the deep work: security, sync reliability, testing, and future releases.",
    benefits: [
      "150 Atomic Coins each paid month",
      "Supporter development updates",
      "A personal thank-you from the developer when you join",
      "Your feature ideas read when planning what comes next",
    ],
    cta: "Power the reactor",
    cover: "/support/atomic-reactor-cover.webp",
  },
];

/** The reward and payment route for an exact amount. Throws for any amount not in the table. */
export function quote(cents: number): Quote {
  const step = REWARD_STEPS.find((s) => s.cents === cents);
  if (!Number.isSafeInteger(cents) || !step) throw new Error(`Unsupported contribution amount: ${cents}`);
  const membership = step.membership ? (MEMBERSHIPS.find((m) => m.id === step.membership) ?? null) : null;
  return {
    cents,
    coins: step.coins,
    bonusCoins: Math.max(0, step.coins - (step.cents / 100) * BASE_COINS_PER_DOLLAR),
    channel: membership ? "patreon" : "kofi",
    membership,
    version: SUPPORT_PRICING_VERSION,
  };
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** The text a supporter sends with their payment, so the reward can be matched by hand. */
export function supportMessage(q: Quote): string {
  const what = q.membership
    ? `${q.membership.name} membership (${formatUsd(q.cents)} a month, ${q.coins} Atomic Coins each paid month)`
    : `${formatUsd(q.cents)} one-time support for ${q.coins} Atomic Coins`;
  return `Atomic Notes: ${what}, rewards ${q.version}. My Atomic Notes account email: `;
}
