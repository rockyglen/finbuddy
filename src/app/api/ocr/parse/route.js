import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize GPT client (uses GPT-4.1 Nano or whichever model you're using)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { ocrText } = await req.json();

    if (!ocrText || typeof ocrText !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid OCR text" },
        { status: 400 }
      );
    }

    const prompt = `
Here is the text extracted from a receipt OCR:

"""
${ocrText}
"""

Extract and return a JSON object with the following fields:
- title (short description of the purchase)
- amount (number, in USD)
- date (ISO format if available)
- category (Food, Travel, Groceries, etc.)
- vendor (e.g., Walmart, Starbucks)

If any field is missing in the receipt, return null for that field.
Do NOT hallucinate or guess. Only extract what's explicitly in the text.
Respond with a valid JSON object only.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // Use your preferred model (GPT-4.1 Nano?)
      messages: [
        {
          role: "system",
          content:
            "You are a strict data extractor. You never guess or invent. You only extract.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    const rawContent = completion.choices[0]?.message?.content || "";

    // Attempt to extract the JSON from the response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "No JSON found in GPT response", raw: rawContent },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ parsed }, { status: 200 });
  } catch (err) {
    console.error("[OCR PARSE ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
