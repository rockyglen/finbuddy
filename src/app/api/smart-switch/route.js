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

        // 1. Fetch ALL recent transactions
        const { data: expenses } = await supabase
            .from("expenses")
            .select("category, description, amount, ocr_parsed")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(50);

        const dataForAI = expenses.map(e => ({
            category: e.category,
            description: e.description,
            amount: e.amount,
            items: e.ocr_parsed?.items || []
        }));

        if (dataForAI.length < 3) {
            return Response.json({ suggestion: "Add more transactions to unlock AI-powered Smart Switch insights!" });
        }

        // 2. Ask GPT to find recurring patterns (items or manual bills/subs)
        const systemPrompt = `
You are a Financial Optimization Expert. Analyze the provided list of expenses.
Some have granular line-items (receipts), others only have descriptions/categories (manual).

Identify high-impact savings opportunities:
1. Recurring items in receipts (e.g., buying the same coffee/snacks daily).
2. Recurring manual expenses (e.g., subscriptions, regular bills).

Provide ONE specific "Smart Switch" suggestion. 

FORMAT:
[Switch/Optimize] [Item/Service] for [Smarter Alternative/Bulk/Annual Plan]. 
Rationale: [Brief explanation]. 
Estimated savings: $[Amount] per [Year/Month].

USER DATA:
${JSON.stringify(dataForAI)}
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
