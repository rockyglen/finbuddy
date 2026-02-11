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

    // Step 2 & 3: GPT-4o Vision for extraction
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log("🧠 Sending image to GPT-4o Vision...");

    const chatRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract expense details from this receipt image. Return a JSON object with the following fields:
              - amount (number, total sum of all items)
              - category (one of: "Food", "Transport", "Shopping", "Bills", "Health", "Travel", "Other")
              - date (YYYY-MM-DD)
              - description (summary of items or merchant)
              - items (array of objects with "name" and "price")
              
              ONLY return the raw JSON object. No markdown, no explanations.`,
            },
            {
              type: "image_url",
              image_url: {
                url: receiptImageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
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

    // Step 4: Generate Embedding for Semantic Search
    console.log("🪄 Generating semantic embedding...");
    const embeddingInput = `Category: ${parsedJson.category}. Description: ${parsedJson.description}. Items: ${parsedJson.items?.map(i => i.name).join(", ")}`;

    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embeddingInput,
    });

    const embedding = embeddingRes.data[0].embedding;

    // Step 5: Update expense
    console.log("🛠️ Updating expense in DB...");
    const { error: updateError } = await supabase
      .from("expenses")
      .update({
        amount: parsedJson.amount,
        category: parsedJson.category,
        description: parsedJson.description || null,
        ocr_parsed: parsedJson,
        embedding: embedding, // Store the vector embedding
      })
      .eq("id", expenseId);

    if (updateError) {
      console.error("❌ DB update error:", updateError);
      return Response.json(
        { error: "Failed to update expense" },
        { status: 500 }
      );
    }

    console.log("✅ Expense updated successfully with embedding!");
    return Response.json({ success: true });
  } catch (err) {
    console.error("💥 Unhandled error in full-process route:", err);
    return Response.json({ error: "Unhandled error" }, { status: 500 });
  }
}
