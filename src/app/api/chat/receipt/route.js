import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
    try {
        const { message, receiptData } = await req.json();

        if (!message || !receiptData) {
            return Response.json({ error: "Missing data" }, { status: 400 });
        }

        const systemPrompt = `
You are the FinBuddy Receipt Assistant. You are provided with the parsed contents of a specific receipt.
Answer the user's questions about this specific transaction accurately and helpfully.

RECEIPT DATA:
${JSON.stringify(receiptData, null, 2)}

If the user asks about health, business utility, or savings, provide professional advice based on the items listed.
Keep your pulse quick and your answers concise (under 80 words).
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
            ],
            temperature: 0.7,
        });

        const answer = response.choices[0].message.content;
        return Response.json({ answer });
    } catch (err) {
        console.error("🔥 Receipt Chat API Error:", err);
        return Response.json({ error: "Chat failed" }, { status: 500 });
    }
}
