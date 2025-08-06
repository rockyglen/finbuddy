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
You are my personal financial assistant. I’ve provided you with at least 5 of my monthly expenses. Your job is to:

    Track my spending across categories and show me clear trends over time.

    Summarize where my money is going (percentages, visuals if possible).

    Identify areas I might be overspending, gently suggesting optimizations without judgment.

    Provide insights into how my spending aligns with healthy financial habits (e.g., ideal % for rent, savings, discretionary).

    Help me plan ahead, offering monthly and weekly summaries, suggestions for savings, and light goal tracking.

Please keep everything clear, professional, and friendly — I want helpful, data-driven insights that support smarter decisions, not pressure or shame. Be encouraging and honest..

Also tell me how I can use this data to improve my financial health and save money. Make it actionable and easy to understand, with clear next steps I can take.
  
make it nice for a website.
    
    Include as many emojis as possible to make it fun and engaging.   
    ONLY PURE TEXT
    
    DO NOT GIVE ME A JARGON RESPONSE, COME TO THE POINT QUICKLY AND EFFICIENTLY.
    EVEN A DUMB PERSON SHOULD BE ABLE TO UNDERSTAND IT.
    NOT MORE THAN 250 WORDS.
    Use the following data to generate insights:
Data:
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
  const { error: insertError } = await supabase.from("ai_summary").insert([
    {
      user_id: user.id,
      summary_text: summary,
    },
  ]);

  if (insertError) {
    return Response.json({ error: "Failed to save summary" }, { status: 500 });
  }

  return Response.json({ summary });
}
