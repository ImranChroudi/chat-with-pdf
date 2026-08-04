import { adminDb } from "@/firebaseAdmin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
  const headersList = headers();
  const body = await req.text();
  const signature = (await headersList).get("Stripe-Signature");

  if (!signature) return new Response("No signature provided", { status: 400 });

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("No webhook secret provided");
    return new NextResponse("No webhook secret provided", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log("body", body);
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log("event", event);
  } catch (error) {
    console.log(`Webhook Error : ${error}`);
    return new NextResponse(`Webhook Error : ${error}`, { status: 400 });
  }

  const getUserDetails = async (customerId: string) => {
    const userDoc = await adminDb
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (userDoc.docs.length > 0) {
      
      return userDoc.docs[0];
    }
  };
  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.created":
    {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      const userDetails = await getUserDetails(customerId);
      console.log("userDetails", userDetails);

      if (!userDetails?.id) {
        console.log("User not found");
        return new NextResponse("User not found", { status: 400 });
      }

      await adminDb.collection("users").doc(userDetails.id).update({
        hasActiveMembership: true,
      });

      break;
    }
    case "customer.subscription.deleted":
    case "subscription_schedule.canceled": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      console.log("customer.subscription.deleted");

      const userDetails = await getUserDetails(customerId);

      if (!userDetails?.id) {
        return new NextResponse("User not found", { status: 400 });
      }

      await adminDb.collection("users").doc(userDetails.id).update({
        hasActiveMembership: false,
      });

      break;
    }
    default : 
        console.log("unhandled event type", event.type);
  }
  return NextResponse.json({message : "Webhook recived"})
};
