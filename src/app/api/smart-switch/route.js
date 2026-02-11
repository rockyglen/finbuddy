import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            global: { headers: { Authorization: `Bearer ${token}` } },
        }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch recent transactions with itemized data
        const { data: expenses } = await supabase
            .from("expenses")
            .select("ocr_parsed")
            .eq("user_id", user.id)
            .not("ocr_parsed", "is", null);

        const allItems = expenses.flatMap(e => e.ocr_parsed?.items || []);

        if (allItems.length < 3) {
            return Response.json({ suggestion: "Scan more receipts to unlock bulk-saving insights!" });
        }

        // 2. Ask GPT to find recurring items and suggest bulk-buys
        const systemPrompt = `
You are a Frugal Living Specialist. Analyze the provided list of individual items purchased by a user.
Identify items they buy frequently (e.g., Water, Coffee, Detergent, Snacks).
Provide ONE high-impact "Smart Switch" suggestion.

FORMAT:
Switch [Item Name] for [Bulk/Smarter Alternative] from [Vendor like Amazon/Costco/Walmart].
This would save you approximately $[Amount] over a year.

LIST OF ITEMS:
${JSON.stringify(allItems)}
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }],
            max_tokens: 150,
        });

        return Response.json({ suggestion: response.choices[0].message.content });
    } catch (err) {
        console.error(err);
        return Response.json({ error: "Failed to generate suggestions" }, { status: 500 });
    }
}
