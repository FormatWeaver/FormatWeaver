// supabase/functions/stripe-webhook/index.ts
// This function listens for events from Stripe, verifies them, and updates user subscriptions.
declare var Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@16.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2024-06-20",
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

serve(async (req: Request) => {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) throw new Error("Webhook secret or signature missing.");
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Error verifying webhook signature: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      let subscription: Stripe.Subscription;
      let userId: string | undefined;

      switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            if (typeof session.subscription !== 'string') throw new Error("Subscription ID not found on session.");
            subscription = await stripe.subscriptions.retrieve(session.subscription);
            userId = session.metadata?.user_id;
            break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            subscription = event.data.object as Stripe.Subscription;
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            userId = customer.metadata?.user_id;
            break;
        }
        default:
          throw new Error('Unhandled relevant event!');
      }

      if (!userId) {
          throw new Error(`User ID not found in metadata for event type: ${event.type}`);
      }
      
      const priceId = subscription.items.data[0]?.price.id;
      let newPlan: string = 'Free'; // Default to free if subscription is cancelled or no match
      
      if (subscription.status === 'active') {
          if (priceId === Deno.env.get('STRIPE_PRO_PRICE_ID')) newPlan = 'Pro';
          if (priceId === Deno.env.get('STRIPE_TEAM_PRICE_ID')) newPlan = 'Team';
      }

      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ subscription_plan: newPlan })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);
      return new Response('Webhook handler failed. View function logs.', { status: 400 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
