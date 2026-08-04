"use client";

import { Check, MoveRight } from "lucide-react";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/stripe-js";
import { createCheckoutSession } from "@/actions/createCheckoutSession";
import { createStripePortal } from "@/actions/createStripePortal";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const plans = [
  {
    name: "Free",
    file: "free-plan.pdf",
    price: "$0",
    period: "/ forever",
    tagline: "For trying it on a document or two.",
    features: [
      "5 documents",
      "20 questions per day",
      "Standard model",
      "7-day chat history",
    ],
    // cta: "Get started",
    // href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Pro",
    file: "pro-plan.pdf",
    price: "$5.99",
    period: "/ month",
    tagline: "For anyone who reads documents for a living.",
    features: [
      "Unlimited documents",
      "Unlimited questions",
      "Advanced model",
      "Unlimited chat history",
      "Priority processing",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    href: "/dashboard?plan=pro",
    highlighted: true,
  },
];

export type UserDetails = {
  email: string;
  name: string;
};

export function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { hasActiveMembership, isOverLimit, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = ()=>{
    if(!user) return;

     const userDetails : UserDetails = {
      email : user.primaryEmailAddress?.toString()!,
      name : user.fullName?.toString()!,
     }

     startTransition(async ()=>{
       // load stripe checkout page
       const stripe = await getStripe();

       if(hasActiveMembership){
          const stripePortalUrl = await createStripePortal();
          if(stripePortalUrl){
            router.push(stripePortalUrl);
            return;
          }
       }

       const sessionUrl = await createCheckoutSession(userDetails);

       if(sessionUrl){
        router.push(sessionUrl);
       }
       
     })
  }

  return (
    <main
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} min-h-screen bg-[#FAFAF7] [font-family:var(--font-body)]`}
    >
      <div className="relative mx-auto max-w-6xl">
        {/* frame lines, matching hero */}
        <div className="absolute inset-y-0 left-0 hidden h-full w-px bg-[#E4E2DC] md:block" />
        <div className="absolute inset-y-0 right-0 hidden h-full w-px bg-[#E4E2DC] md:block" />

        <div className="px-6 py-20 md:py-28">
          {/* eyebrow */}
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F46E5] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4F46E5]" />
            </span>
            <span className="[font-family:var(--font-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[#4A4D57]">
              Pricing
            </span>
          </div>

          {/* headline */}
          <h1 className="mx-auto mt-6 max-w-2xl text-center text-4xl font-medium leading-[1.08] text-[#14161F] [font-family:var(--font-display)] md:text-6xl">
            Two plans. No fine print.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-center text-base leading-relaxed text-[#4A4D57] md:text-lg">
            Start free with a couple of documents. Upgrade when you have more to
            read than time to read it.
          </p>

          {/* plan cards */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border bg-[#F5F3EE] p-6 ${
                  plan.highlighted ? "border-[#14161F]" : "border-[#E4E2DC]"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-[3px] bg-[#FFE066] px-2 py-0.5 [font-family:var(--font-mono)] text-[11px] font-medium uppercase tracking-wide text-[#14161F]">
                    Most popular
                  </span>
                )}

                {/* file-tab header, echoes the hero mock */}
                <div className="mb-5 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E4E2DC]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E4E2DC]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E4E2DC]" />
                  <span className="ml-2 [font-family:var(--font-mono)] text-[11px] uppercase tracking-wide text-[#8A8D97]">
                    {plan.file}
                  </span>
                </div>

                <h2 className="[font-family:var(--font-display)] text-2xl font-medium text-[#14161F]">
                  {plan.name}
                </h2>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="[font-family:var(--font-display)] text-4xl font-medium text-[#14161F]">
                    {plan.price}
                  </span>
                  <span className="[font-family:var(--font-mono)] text-xs uppercase tracking-wide text-[#8A8D97]">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[#4A4D57]">
                  {plan.tagline}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-[#E4E2DC] pt-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[#14161F]"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#4F46E5]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* cta */}
                {plan.cta && plan.href && (
                  <Button
                    className={`mt-8 h-11 rounded-md px-5 text-sm font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-[#14161F] text-[#FAFAF7] hover:-translate-y-0.5 hover:bg-[#4F46E5]"
                        : "border border-[#E4E2DC] bg-transparent text-[#14161F] hover:bg-white"
                    }`}
                    disabled={loading || isPending}
                    onClick={()=>{handleUpgrade()}}
                  >
                      {isPending || loading ? "Loading..." : hasActiveMembership ? "Manage Plan" : "Upgrade to Pro"} <MoveRight size={16} />
                    
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-md text-center [font-family:var(--font-mono)] text-xs uppercase tracking-wide text-[#8A8D97]">
            Cancel anytime — no contracts, no hidden fees
          </p>
        </div>
      </div>
    </main>
  );
}

export default PricingPage;
