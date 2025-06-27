"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";
import { Spinner } from "@nextui-org/spinner";

import { useToast } from "../hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

/* ------------------------------------------------------------------ */
/* 1 ▸ Schema + helpers                                               */
/* ------------------------------------------------------------------ */
const formSchema = z.object({
  plan: z.enum(["base", "plus"], {
    errorMap: () => ({ message: "Please choose a plan" }),
  }),
});
type FormData = z.infer<typeof formSchema>;

const plans = {
  base: {
    name: "Base",
    price: "$8",
    cycle: "/ mo",
    tagline: "Dashboard only",
    features: ["Dashboard access"],
    icon: Check,
  },
  plus: {
    name: "Plus",
    price: "$12",
    cycle: "/ mo",
    tagline: "Everything in Base +",
    features: ["Dashboard access", "Instant SMS & email alerts"],
    icon: Zap,
  },
} as const;

/* ------------------------------------------------------------------ */
/* 2 ▸ Component                                                      */
/* ------------------------------------------------------------------ */
export function PlanSelectionForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { plan: undefined },
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/choose-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Unknown error");

      toast({
        variant: "success",
        description: "Plan selected! Redirecting …",
        duration: 4000,
      });
      router.push(json.url);
    } catch (err) {
      toast({
        variant: "destructive",
        description: (err as Error).message ?? "Something went wrong",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* 3 ▸ UI                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <div className="relative">
      {/* dimmer while loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Spinner size="lg" color="success" />
        </div>
      )}

      <h1 className="mb-10 text-center text-4xl font-bold tracking-tight">
        Choose the plan that fits you
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Plan</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid w-full max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-2"
                  >
                    {Object.entries(plans).map(([id, plan]) => {
                      const selected = field.value === id;
                      const Icon = plan.icon;
                      const baseClasses =
                        "relative flex flex-col p-8 pb-10 rounded-3xl border transition shadow-sm";
                      const selectedRing = selected
                        ? "ring-4 ring-primary/60 shadow-xl"
                        : "hover:shadow-lg";
                      const extraAccent =
                        id === "plus"
                          ? "border-transparent bg-gradient-to-br from-blue-50/60 via-white to-white"
                          : "bg-background";
                      return (
                        <label
                          key={id}
                          htmlFor={id}
                          className={`${baseClasses} ${selectedRing} ${extraAccent}`}
                        >
                          {/* hidden radio for a11y */}
                          <RadioGroupItem
                            id={id}
                            value={id}
                            className="sr-only"
                          />

                          {id === "plus" && (
                            <Badge
                              variant="secondary"
                              className="absolute right-4 top-4 text-xs font-semibold"
                            >
                              Most popular
                            </Badge>
                          )}

                          <div className="flex items-center gap-3">
                            <Icon className="h-7 w-7 stroke-[2.5]" />
                            <h2 className="text-2xl font-medium">
                              {plan.name}
                            </h2>
                          </div>

                          <div className="mt-6 flex items-end">
                            <span className="text-5xl font-bold">
                              {plan.price}
                            </span>
                            <span className="ml-1 mb-1 text-lg text-muted-foreground">
                              {plan.cycle}
                            </span>
                          </div>

                          <p className="mt-4 text-base text-muted-foreground">
                            {plan.tagline}
                          </p>

                          <ul className="mt-6 space-y-3 text-sm leading-6">
                            {plan.features.map((f) => (
                              <li
                                key={f}
                                className="flex items-start gap-2"
                              >
                                <Check className="mt-[3px] h-4 w-4 stroke-[3]" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
        <Button
          type="submit"
          variant="default"
          className="w-full max-w-xs py-5 text-lg sm:w-60"
          disabled={loading}
        >
          {loading ? "Submitting…" : "Continue"}
        </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
