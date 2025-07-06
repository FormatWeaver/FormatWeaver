// supabase/functions/autofill-form/index.ts
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, schema } = await req.json()
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
    
    const ai = new GoogleGenAI({ apiKey });

    const fullPrompt = `You are an AI assistant for filling out structured forms. Based on the user's request, fill out the following JSON schema. Your response MUST be a single, valid JSON object with no other text or markdown.
      USER REQUEST:\n---\n${prompt}\n---\nSCHEMA:\n---\n${JSON.stringify(schema, null, 2)}\n---`;
      
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-preview-04-17', contents: fullPrompt, config: { responseMimeType: "application/json" } });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
      
    const aiFormData = JSON.parse(jsonStr);

    return new Response(JSON.stringify(aiFormData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})