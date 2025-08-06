import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
  try {
    const { data: receipts, error } = await supabase
      .from("expenses")
      .select("*")
      .is("insights_json", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !receipts || receipts.length === 0) {
      return Response.json(
        { message: "No receipts to process." },
        { status: 200 }
      );
    }

    const receipt = receipts[0];
    console.log("🧠 Generating insights for:", receipt.id);

    const prompt = `
You are a financial assistant. Your job is to extract actionable insights from OCR text of a retail receipt. Use the text to identify:
1. Store name
2. List of purchased items
3. Total amount spent
4. Purchase date (if available)
5. Item categories (guess if needed)
6. Insights such as:
   - Unusual or large spending
   - Category-level summaries
   - Any expense optimizations or tips

Output must be a clean **JSON** object with the following structure:

\`\`\`json
{
  "total_spent": number,
  "store_name": string,
  "items": string[],
  "detected_date": string,
  "insights": {
    "unusual_spending": boolean,
    "category_guesses": {
      "item_name_1": "category",
      "item_name_2": "category"
    }
  }
}
\`\`\`

Text:
\`\`\`
${receipt.ocr_text}
\`\`\`
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // Replace with "gpt-4.1-nano" if using OCI-compatible
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a personal finance assistant." },
        { role: "user", content: prompt },
      ],
    });

    const insightsRaw = completion.choices[0].message.content;
    let insights_json;

    try {
      insights_json = JSON.parse(insightsRaw);
    } catch (parseError) {
      console.error("Failed to parse insights JSON:", parseError);
      console.error("Raw response:", insightsRaw);
      return Response.json(
        { error: "Invalid JSON from LLM", raw: insightsRaw },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("expenses")
      .update({ insights_json })
      .eq("id", receipt.id);

    if (updateError) {
      throw updateError;
    }

    return Response.json({ status: "success", insights: insights_json });
  } catch (err) {
    console.error("Insights route error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
