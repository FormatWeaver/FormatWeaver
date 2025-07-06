// supabase/functions/suggest-variables/index.ts
declare var Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "npm:@google/genai"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateString } = await req.json()
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Analyze the following text and identify potential variables. 
      Return a JSON array of objects, where each object has "name", "type", and "originalText".
      - "name": a descriptive, snake_case name.
      - "type": one of 'text', 'list', 'date', 'number', 'boolean'.
      - "originalText": the exact text from the template that this variable will replace.
      
      IMPORTANT GUIDELINES:
      - The "originalText" value MUST be a valid JSON string. This means any special characters within the text, such as double quotes or newlines, MUST be properly escaped (e.g., use \\" for a quote and \\n for a newline).
      - A "list" should be used for itemized lists (lines starting with '-', '*', or numbers). The "originalText" for a list should include all its items, with newlines escaped as \\n.
      - Do not suggest variables for text that is already a variable.
      - Ensure the 'originalText' is a substring of the provided text.
      
      TEXT TO ANALYZE:
      ---
      ${templateString}
      ---
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) jsonStr = match[2].trim();
    
    const suggestions = JSON.parse(jsonStr);

    return new Response(JSON.stringify(suggestions), {
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