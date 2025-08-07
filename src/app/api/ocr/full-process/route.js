import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import OpenAI from "openai";

export async function POST(req) {
  const supabase = supabaseAdmin;

  try {
    console.log("✅ [full-process] Request received");

    const { filePath, expenseId } = await req.json();
    console.log("📦 Payload received:", { filePath, expenseId });

    if (!filePath || !expenseId) {
      console.error("❌ Missing filePath or expenseId");
      return Response.json({ error: "Missing input" }, { status: 400 });
    }

    // Step 1: Create signed URL
    const { data: signedURLData, error: urlError } = await supabase.storage
      .from("receipts")
      .createSignedUrl(filePath, 60);

    if (urlError || !signedURLData?.signedUrl) {
      console.error("❌ Signed URL error:", urlError);
      return Response.json(
        { error: "Failed to get signed URL" },
        { status: 500 }
      );
    }

    const receiptImageUrl = signedURLData.signedUrl;
    console.log("🔗 Signed URL generated:", receiptImageUrl);

    // Step 2: OCR.space API
    console.log("🔍 Sending image to OCR.space...");
    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCR_SPACE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        url: receiptImageUrl,
        language: "eng",
      }),
    });

    const ocrJson = await ocrRes.json();
    const ocrText = ocrJson?.ParsedResults?.[0]?.ParsedText;
    console.log("📄 OCR Result:", ocrText?.slice(0, 200)); // limit log length

    if (!ocrText) {
      console.error("❌ No OCR text extracted:", ocrJson);
      return Response.json(
        { error: "Failed to extract text via OCR" },
        { status: 500 }
      );
    }

    // Step 3: Call OpenAI for parsing
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Extract expense details from this receipt OCR text:\n\n${ocrText}\n\nReturn a JSON like:\n{\n  "amount": number,\n  "category": string,\n  "date": "YYYY-MM-DD",\n  "description": string\n}
    "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Travel",
  "Other",

  place the expense in any of these categories.

  IF THERE ARE MULTIPLE AMOUNTS? JUST ADD THEM UP AND RETURN THE TOTAL.

  also.. RETURN JUST THE RAW JSON, nothing else. No explanations, no text, just the JSON object.
    
    `;
    console.log("🧠 Sending prompt to OpenAI...");

    const chatRes = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsedContent = chatRes.choices?.[0]?.message?.content;
    console.log("🧾 Raw GPT Response:", parsedContent);

    let parsedJson;
    try {
      parsedJson = JSON.parse(parsedContent);
    } catch (jsonError) {
      console.error("❌ Failed to parse GPT JSON:", jsonError);
      return Response.json(
        { error: "GPT response is not valid JSON" },
        { status: 500 }
      );
    }

    if (!parsedJson.amount || !parsedJson.category || !parsedJson.date) {
      console.error("❌ Missing fields in GPT output:", parsedJson);
      return Response.json(
        { error: "Missing fields in GPT response" },
        { status: 400 }
      );
    }

    // Step 4: Update expense
    console.log("🛠️ Updating expense in DB...");
    const { error: updateError } = await supabase
      .from("expenses")
      .update({
        amount: parsedJson.amount,
        category: parsedJson.category,
        date: parsedJson.date,
        description: parsedJson.description || null,
        ocr_text: ocrText,
        ocr_parsed: parsedJson,
      })
      .eq("id", expenseId);

    if (updateError) {
      console.error("❌ DB update error:", updateError);
      return Response.json(
        { error: "Failed to update expense" },
        { status: 500 }
      );
    }

    console.log("✅ Expense updated successfully!");
    return Response.json({ success: true });
  } catch (err) {
    console.error("💥 Unhandled error in full-process route:", err);
    return Response.json({ error: "Unhandled error" }, { status: 500 });
  }
}
