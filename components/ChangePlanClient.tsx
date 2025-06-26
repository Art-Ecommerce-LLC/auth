"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import type { Role, PlanStatus } from "@prisma/client";

type Props = {
  currentRole: Role;                 // "BASE" | "PLUS" | "USER" | "ADMIN"
  planStatus: PlanStatus;            // "active" | "trialing" | "past_due" | "canceled" ...
  periodEnd: Date | null | undefined // ISO from server → auto-serialised
};

export default function ChangePlan({ currentRole, planStatus, periodEnd }: Props) {
  const [loading, setLoading] = useState<"upgrade" | "portal" | null>(null);

  /** small helper --------------------------------------------------------- */
  const fmtDate = useMemo(() => {
    if (!periodEnd) return "—";
    return new Date(periodEnd).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [periodEnd]);

  /** colour-coding for status badge --------------------------------------- */
  const statusVariant =
    planStatus === "active" || planStatus === "trialing"
      ? "default"
      : planStatus === "past_due"
      ? "secondary"
      : "outline"; // canceled / unknown

  /** POST helper ---------------------------------------------------------- */
  const hit = async (path: string, tag: typeof loading) => {
    setLoading(tag);
    const res = await fetch(path, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if ("url" in json) window.location.href = json.url as string;
    else location.reload();
  };

  const isBase = currentRole === "BASE";
  const isPlus = currentRole === "PLUS";
  const isPaid = isBase || isPlus;

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          Subscription Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 🛈 current plan row */}
        <Row label="Current plan">
          <Badge
            variant={isPlus ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {currentRole}
          </Badge>
        </Row>

        {/* 🛈 status row */}
        <Row label="Subscription status">
          <Badge variant={statusVariant} className="text-sm px-3 py-1 capitalize">
            {planStatus}
          </Badge>
        </Row>

        {/* 🛈 renewal / end row */}
        <Row label={planStatus === "canceled" ? "Access until" : "Next bill date"}>
          <span className="text-sm">{fmtDate}</span>
        </Row>

        {isPaid && (
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end pt-2">
            <Button
              variant="outline"
              disabled={!!loading}
              onClick={() => hit("/api/billing/portal", "portal")}
              className="w-full"
            >
              {loading === "portal" ? "Opening…" : "Manage subscription"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** ------------------------------------------------------------------------ */
/** Tiny presentational helper for cleaner JSX */
const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    {children}
  </div>
);
