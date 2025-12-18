import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return Response.json({ error: "Missing access token" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Only for server-side secure ops
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  // ✅ 1. Get user from token
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ 2. Fetch expenses
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id);

  if (expenseError || !expenses || expenses.length < 5) {
    return Response.json(
      {
        error:
          "Not enough data to generate insights. Add at least 5 expense records.",
      },
      { status: 400 }
    );
  }

  // ✅ 3. Format data
  const formatted = expenses.map((e) => ({
    category: e.category,
    amount: parseFloat(e.amount),
    date: e.date,
  }));

  const prompt = `
# ROLE
You are the FinBuddy Expert Financial Coach. Your tone is data-driven, encouraging, and clear.

# CONTEXT
Analyze the user's transaction history provided in the JSON below. 
The app UI uses ReactMarkdown, so use headers and bullet points.

# DATA (JSON)
${JSON.stringify(formatted, null, 2)}

# TASK: SPENDING AUDIT
1. **Executive Summary**: One high-impact sentence on overall spending health with an emoji.
2. **Top Categories**: Identify the top 3 categories by total amount and their percentage of total spend.
3. **Key Metrics**: Identify the largest single purchase and the most frequent category.
4. **Trend Detection**: Note if "Food" or "Shopping" costs are increasing over time.
5. **Action Plan**: Provide 2 hyper-specific, actionable tips for their #1 spending category.

# CONSTRAINTS
- Tone: Friendly mentor. 
- Format: Use Markdown (## Headers, **Bold**, - Bullets).
- Accuracy: Do NOT hallucinate. If data < 1 month, state: "It's early for trends, but here is your current snapshot..."
- Length: Strictly under 120 words.

Give me in proper formatting.
`;

  // ✅ 4. Call OpenAI
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are a financial analyst." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    }),
  });

  const gptData = await openaiRes.json();
  const summary = gptData?.choices?.[0]?.message?.content;

  if (!summary) {
    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }

  // ✅ 5. Store in ai_summary
  const { error: upsertError } = await supabase.from("ai_summary").upsert(
    [
      {
        user_id: user.id,
        summary_text: summary,
      },
    ],
    {
      onConflict: "user_id", // crucial to avoid duplicates
    }
  );

  if (upsertError) {
    return Response.json({ error: "Failed to save summary" }, { status: 500 });
  }

  return Response.json({ summary });
}
