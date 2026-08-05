"use client";

import { ArrowUpRight, Loader2Icon } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import useSubscription from "@/hooks/useSubscription";
import Link from "next/link";
import { createStripePortal } from "@/actions/createStripePortal";

const UpgradeButton = () => {
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();


  const handleAccount = async () => {
    startTransition(async () => {
        const stripePortalUrl = await createStripePortal();
        router.push(stripePortalUrl);
    })
  };
  
  if(loading){
    return (
      <Button variant="default" className="h-10 cursor-pointer rounded-md bg-[#14161F] px-5 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#4F46E5] sm:h-11 sm:px-6">
        <Loader2Icon className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!hasActiveMembership && !loading) {
    return (
      <Button variant="default" className="h-10 cursor-pointer rounded-md bg-[#14161F] px-5 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#4F46E5] sm:h-11 sm:px-6">
        <Link href="/dashboard/upgrade" className="flex items-center gap-2">
          <span>Upgrade</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
        onClick={handleAccount}
        disabled={isPending}
        variant="default"
        className="h-10 cursor-pointer rounded-md bg-[#14161F] px-5 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#4F46E5] sm:h-11 sm:px-6"
    >
        {
            isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
                <p>
                    <span className="font-bold mr-1">PRO </span>
                     Account
                </p>
            )
        }
    </Button>
  )

  
};

export default UpgradeButton;
