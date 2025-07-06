// supabase/functions/create-checkout-session/index.ts
declare var Deno: any;
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@16.2.0";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2024-06-20",
});

const PRICE_IDs = {
    Pro: Deno.env.get('STRIPE_PRO_PRICE_ID'),
    Team: Deno.env.get('STRIPE_TEAM_PRICE_ID'),
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { plan } = await req.json();
        const priceId = PRICE_IDs[plan as 'Pro' | 'Team'];

        if (!priceId) {
            throw new Error(`Price ID for plan "${plan}" not found.`);
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated.");

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();
        
        if (profileError || !profile || !profile.stripe_customer_id) {
            throw new Error("Stripe customer ID not found for user.");
        }

        const session = await stripe.checkout.sessions.create({
            customer: profile.stripe_customer_id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${Deno.env.get('BASE_URL')}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${Deno.env.get('BASE_URL')}`,
            metadata: {
                user_id: user.id,
            }
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
