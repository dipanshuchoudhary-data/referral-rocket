import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, Trophy, Flame, Gift } from "lucide-react";
import { useAuth } from "@/lib/auth";

const TABS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/pg", label: "PGs", icon: Building2 },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
  { to: "/streak", label: "Streak", icon: Flame },
  { to: "/lucky-draw", label: "Lucky", icon: Gift },
];

export function MobileTabBar() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!user) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = path === t.to || (t.to !== "/dashboard" && path.startsWith(t.to));
          return (
            <li key={t.to}>
              <Link to={t.to} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                <t.icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
