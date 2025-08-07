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
You are a personal finance assistant.

Your job is to analyze a user's historical expense data and write a smart, readable summary of their spending habits and trends. The user may have anywhere from 2 weeks to several months of data.

Here is a JSON array of their expenses. Each entry includes amount, category, and date.

Your goals:
1. Detect high spending areas or patterns
2. Highlight category-wise trends (e.g. increasing Food costs)
3. Mention any unusual or one-time large expenses
4. Estimate their **average monthly** (or weekly, if <30 days) spending
5. Offer 2–3 actionable budgeting suggestions to help them save money
6. If the data covers less than a month, note that it’s early to draw strong conclusions
7. What are the top 3 categories they spend on?
8. What is their largest single expense?
9. What is their most frequent expense category?
10. What is their average expense amount?
11. How can they optimize their spending in the top category?

Respond in a clear way and most legible way, as if you were explaining to a friend. Use simple language and avoid jargon.
Include as many emojis as possible to make it fun and engaging. 

DO NOT GIVE ME ANY SCRIPTS OR CODE. 

EXPLAIN UNDER 250 WORDS.

GIVE ME IN BULLET POINTS. WHERE I AM SPENDING MONEY AND HOW I CAN SAVE MONEY.

THIS RESPONSE WILL BE SHOWN TO THE USER IN A WEB APP.
IF NEEDED, SEARCH THE WEB FOR THE LATEST TRENDS IN PERSONAL FINANCE.
Expenses:
\`\`\`json
${JSON.stringify(formatted, null, 2)}
\`\`\`
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
