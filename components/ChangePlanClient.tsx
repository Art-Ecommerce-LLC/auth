"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { currentRole: "BASE" | "PLUS" | "USER" };

export default function ChangePlan({ currentRole }: Props) {
  const [loading, setLoading] = useState<"upgrade" | "portal" | null>(null);

  // POST helper (upgrade / portal)
  const hit = async (path: string, tag: typeof loading) => {
    setLoading(tag);
    const res = await fetch(path, { method: "POST" });
    const json = await res.json().catch(() => ({}));

    if ("url" in json) {
      window.location.href = json.url as string; // Stripe portal
    } else {
      location.reload(); // upgraded or cancelled—refresh UI
    }
  };

  const isBase = currentRole === "BASE";
  const isPlus = currentRole === "PLUS";
  const isPaid = isBase || isPlus; // “USER” (=free) should never hit this page

  return (
    <Card className="mx-auto w-full max-w-md rounded-2xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          Subscription Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* current plan */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current plan</span>
          <Badge
            variant={isPlus ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {currentRole}
          </Badge>
        </div>

        {isPaid && (
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            {/* Only BASE can upgrade */}
            {isBase && (
              <Button
                disabled={!!loading}
                onClick={() => hit("/api/billing/upgrade", "upgrade")}
                className="w-full sm:w-auto"
              >
                {loading === "upgrade" ? "Upgrading…" : "Upgrade to PLUS"}
              </Button>
            )}

            {/* Manage / cancel via Stripe Portal */}
            <Button
              variant="outline"
              disabled={!!loading}
              onClick={() => hit("/api/billing/portal", "portal")}
              className="w-full sm:w-auto"
            >
              {loading === "portal" ? "Opening…" : "Manage subscription"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
