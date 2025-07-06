// supabase/functions/get-user-data/index.ts
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from '../_shared/cors.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // First, get the user from the authorization header
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated.");

        // Now use the admin client for privileged operations

        // 1. Get IDs of all workspaces the user is a member of
        const { data: memberEntries, error: memberError } = await supabaseAdmin
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id);

        if (memberError) throw memberError;
        
        let workspaceIds = memberEntries.map(m => m.workspace_id);
        
        // 2. First time login check - create personal workspace if none exist
        if (workspaceIds.length === 0) {
            const { data: newWorkspace, error: creationError } = await supabaseAdmin
                .from('workspaces')
                .insert([{ name: 'Personal Workspace' }])
                .select()
                .single();

            if (creationError || !newWorkspace) throw creationError || new Error("Failed to create personal workspace");
            
            const { error: memberInsertError } = await supabaseAdmin
                .from('workspace_members')
                .insert([{ workspace_id: newWorkspace.id, user_id: user.id, role: 'Owner' }]);

            if (memberInsertError) throw memberInsertError;
            workspaceIds = [newWorkspace.id];
        }

        // 3. Fetch all details for those workspaces (including all members and their emails)
        const { data: workspacesData, error: workspacesError } = await supabaseAdmin
            .from('workspaces')
            .select(`
                *,
                workspace_members (
                    user_id,
                    role,
                    user_profiles ( email )
                )
            `)
            .in('id', workspaceIds);

        if (workspacesError) throw workspacesError;

        // 4. Fetch all templates and folders belonging to these workspaces
        const { data: templatesData, error: templatesError } = await supabaseAdmin.from('templates').select('*').in('workspace_id', workspaceIds);
        const { data: foldersData, error: foldersError } = await supabaseAdmin.from('folders').select('*').in('workspace_id', workspaceIds);
        
        if (templatesError || foldersError) throw templatesError || foldersError;

        // 5. Fetch user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (profileError || !profile) throw profileError || new Error("Could not find user profile.");

        const responsePayload = {
            user: {
                id: user.id,
                email: user.email,
                subscriptionPlan: profile.subscription_plan,
                stripe_customer_id: profile.stripe_customer_id
            },
            workspaces: workspacesData,
            templates: templatesData,
            folders: foldersData,
        };
        
        return new Response(JSON.stringify(responsePayload), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
