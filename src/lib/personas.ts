export const PERSONAS = [
  { key: "GUARD", emoji: "🛡️", title: "Daily Worker", desc: "Security, drivers, helpers — refer your circle" },
  { key: "STUDENT", emoji: "🎓", title: "Student", desc: "College, hostel-hopper, room-finder" },
  { key: "EARNER", emoji: "💼", title: "Side Hustler", desc: "Side income, commission agent, freelancer" },
  { key: "PG_MANAGER", emoji: "🏠", title: "PG Manager", desc: "List your property, fill rooms" },
  { key: "BROKER", emoji: "🤝", title: "Broker", desc: "Pro brokers — full pipeline CRM" },
  { key: "INFLUENCER", emoji: "📱", title: "Influencer", desc: "Creators with audience — content stats" },
  { key: "CORPORATE_HR", emoji: "🏢", title: "Corporate HR", desc: "House new hires & relocators" },
] as const;

export type PersonaKey = typeof PERSONAS[number]["key"];

export const LEVELS = [
  { name: "Beginner", min: 0, color: "bg-slate-400" },
  { name: "Explorer", min: 100, color: "bg-sky-500" },
  { name: "Hustler", min: 300, color: "bg-emerald-500" },
  { name: "Pro", min: 700, color: "bg-violet-500" },
  { name: "Legend", min: 1500, color: "bg-amber-500" },
];

export const levelFor = (xp: number) => {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) cur = l;
  const next = LEVELS[LEVELS.indexOf(cur) + 1];
  const pct = next ? Math.min(100, ((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { current: cur, next, pct };
};
