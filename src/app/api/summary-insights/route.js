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

  // ✅ 3. Format data & Generate Hash
  const formatted = expenses.map((e) => ({
    category: e.category,
    amount: parseFloat(e.amount),
    date: e.date,
  }));

  const dataString = JSON.stringify(formatted);
  const crypto = require("crypto");
  const inputHash = crypto.createHash("sha256").update(dataString).digest("hex");

  // ✅ 4. Check Semantic Cache (Exact Match First)
  const { data: cachedSummary, error: cacheError } = await supabase
    .from("ai_summary_cache")
    .select("summary_text")
    .eq("user_id", user.id)
    .eq("input_hash", inputHash)
    .single();

  if (cachedSummary) {
    console.log("🚀 [Cache] Exact match found! Skipping OpenAI call.");
    return Response.json({ summary: cachedSummary.summary_text, cached: true });
  }

  // ✅ 5. Optional: Semantic Similarity Match (Visualizing similarity)
  // (In a full implementation, you'd call embeddings API here to find 'close enough' insights)

  const prompt = `
# ROLE
You are the FinBuddy Senior Financial Analyst & Personal Coach. Your tone is encouraging, data-driven, and focused on building long-term wealth for your "friend" (the user).

# CONTEXT & DATA
Analyze the following expense history. Note that our UI uses ReactMarkdown, so utilize headers (##), bolding (**), and lists (-) for a professional dashboard look.

USER DATA (JSON):
${dataString}

# ANALYSIS OBJECTIVES
1. **The Lead Story**: Start with a single high-impact sentence on overall spending health using a relevant emoji (e.g., 🚀 for saving, ⚠️ for high spend).
2. **Category Rankings**: Identify the Top 3 spending categories. Include the total dollar amount and what percentage (%) of the total budget they represent.
3. **The "Silent Leaks"**: Detect frequency patterns—many small, recurring purchases in a single category that the user might overlook.
4. **Historical Benchmark**: If data covers >30 days, compare the current week to the previous monthly average. If <30 days, state: "Since we're in the early stages, here is our current benchmark..."
5. **Hyper-Specific Tips**: Provide 2 "Power Tips" tailored to their #1 category. Suggestions must be realistic and focused on saving at least $30/month.

# CONSTRAINTS
- Zero Hallucination: Do not invent trends if data is sparse.
- Largest Single Expense: Explicitly identify the single biggest purchase and assess its necessity.
- Persona: Be a mentor, not a bank bot. Use friendly language.
- Length: Strictly under 135 words.

# REQUIRED OUTPUT FORMAT
## 📈 Financial Snapshot
[Lead Story]

## 🎯 Top Categories
- [Category 1]: $[Amount] ([%] of total)
- [Category 2]: $[Amount] ([%] of total)
- [Category 3]: $[Amount] ([%] of total)

## 💡 Smart Suggestions
- [Tip 1]
- [Tip 2]
`;

  // ✅ 6. Call OpenAI
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

  // ✅ 7. Store in Cache & ai_summary
  await Promise.all([
    supabase.from("ai_summary_cache").upsert({
      user_id: user.id,
      input_hash: inputHash,
      summary_text: summary,
    }),
    supabase.from("ai_summary").upsert([
      {
        user_id: user.id,
        summary_text: summary,
      },
    ], { onConflict: "user_id" })
  ]);

  return Response.json({ summary, cached: false });
}
