// supabase/functions/create-stripe-customer/index.ts
// This function creates a new customer in Stripe and updates the user's profile with the customer ID.
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      throw new Error("User ID and email are required.");
    }
    
    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        user_id: userId,
      },
    });

    // Update the user's profile in Supabase with the Stripe customer ID
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: `Stripe customer created: ${customer.id}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
