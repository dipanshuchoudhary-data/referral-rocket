import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/calculator")({ component: Calc });

function Calc() {
  const [refs, setRefs] = useState(10);
  const [verifyRate, setVerifyRate] = useState(80);
  const [bookRate, setBookRate] = useState(30);

  const verified = Math.round(refs * verifyRate / 100);
  const booked = Math.round(verified * bookRate / 100);
  const earnings = verified * 50 + booked * 500;
  const yearly = earnings * 12;

  return (
    <AppShell max="max-w-3xl">
      <PageHeader icon={Calculator} title="Earnings calculator" subtitle="See how much you'd make with realistic numbers." />
      <Card className="p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
        <Field label="Referrals per month" value={refs} max={100} step={1} onChange={setRefs} suffix="" />
        <Field label="Verification rate" value={verifyRate} max={100} step={5} onChange={setVerifyRate} suffix="%" />
        <Field label="Booking rate (of verified)" value={bookRate} max={100} step={5} onChange={setBookRate} suffix="%" />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Verified leads" value={verified} sub="₹50 each" />
          <Stat label="Bookings" value={booked} sub="₹500 each" />
          <Stat label="Conversion" value={refs ? Math.round(booked / refs * 100) + "%" : "0%"} />
        </div>
      </Card>

      <Card className="mt-4 p-7 text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-90"><IndianRupee className="h-4 w-4" /> Projected earnings</div>
        <div className="mt-2 font-display text-4xl font-bold md:text-5xl">₹{earnings.toLocaleString("en-IN")}<span className="text-base font-normal opacity-80"> / month</span></div>
        <div className="mt-1 opacity-90">≈ ₹{yearly.toLocaleString("en-IN")} per year</div>
      </Card>
    </AppShell>
  );
}

function Field({ label, value, max, step, onChange, suffix }: any) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-display text-lg font-bold text-primary">{value}{suffix}</span>
      </div>
      <Slider value={[value]} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

function Stat({ label, value, sub }: any) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
