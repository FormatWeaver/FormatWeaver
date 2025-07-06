// supabase/functions/generate-template/index.ts
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
    
    const ai = new GoogleGenAI({ apiKey });

    const fullPrompt = `
      You are an AI assistant that creates structured text templates from a user's request.
      Your response MUST be a single, valid JSON object with two keys: "templateString" and "variables".

      1.  **"templateString"**: A string containing the template text. Use {{variable_name}} syntax for placeholders.
      2.  **"variables"**: An array of objects. Each object must have three keys:
          - **"name"**: A descriptive, snake_case name that exactly matches a placeholder in the templateString.
          - **"type"**: The variable's type. Must be one of: 'text', 'list', 'date', 'number', 'boolean'.
          - **"originalText"**: A short, user-friendly example value. This value MUST be a valid JSON string, meaning all special characters like double quotes and newlines MUST be properly escaped (e.g., use \\" for a quote, and \\n for a newline).

      USER REQUEST:
      ---
      ${prompt}
      ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: fullPrompt,
      config: { responseMimeType: "application/json" },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();

    const aiResponse = JSON.parse(jsonStr);

    return new Response(JSON.stringify(aiResponse), {
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