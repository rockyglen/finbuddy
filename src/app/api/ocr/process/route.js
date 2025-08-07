import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ❗ Server-only secret
);

const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;

export async function POST() {
  try {
    // 1. Get ONE unprocessed receipt: ocr_text is null, < 3 attempts, and has receipt_url
    const { data: expenses, error: fetchError } = await supabase
      .from("expenses")
      .select("id, receipt_url, ocr_attempts")
      .is("ocr_text", null)
      .lt("ocr_attempts", 3)
      .not("receipt_url", "is", null)
      .limit(1);

    if (fetchError) {
      console.error("❌ Supabase fetch error:", fetchError);
      return Response.json(
        { error: "Failed to fetch receipt." },
        { status: 500 }
      );
    }

    if (!expenses || expenses.length === 0) {
      return Response.json(
        { message: "✅ No receipts to process." },
        { status: 200 }
      );
    }

    const expense = expenses[0];
    const imageUrl = expense.receipt_url;

    if (!imageUrl) {
      console.error("❌ Missing receipt_url for expense ID:", expense.id);
      return Response.json({ error: "Missing receipt URL." }, { status: 400 });
    }

    // 2. Detect filetype from URL
    const extension = imageUrl.split(".").pop().split("?")[0].toLowerCase();
    const allowedTypes = {
      jpg: "JPG",
      jpeg: "JPG",
      png: "PNG",
      gif: "GIF",
      pdf: "PDF",
    };
    const filetype = allowedTypes[extension] || "PNG";

    // 3. Send image URL to OCR.Space
    const formData = new URLSearchParams();
    formData.append("url", imageUrl);
    formData.append("apikey", OCR_API_KEY);
    formData.append("language", "eng");
    formData.append("OCREngine", "2");
    formData.append("filetype", filetype);

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const ocrJson = await ocrRes.json();

    const ocrSuccess =
      ocrJson &&
      ocrJson.ParsedResults?.[0]?.ParsedText &&
      ocrJson.IsErroredOnProcessing === false &&
      ocrJson.OCRExitCode === 1;

    const parsedText = ocrJson.ParsedResults?.[0]?.ParsedText || null;

    // 4. Update Supabase with parsed text (or just increment attempt count if failed)
    const { error: updateError } = await supabase
      .from("expenses")
      .update({
        ocr_text: parsedText,
        ocr_attempts: expense.ocr_attempts + 1,
      })
      .eq("id", expense.id);

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      return Response.json(
        { error: "Failed to update OCR result." },
        { status: 500 }
      );
    }

    // 5. Return response
    return Response.json({
      status: ocrSuccess ? "success" : "partial-fail",
      text: parsedText,
      ocr_response: ocrJson,
      expense_id: expense.id,
    });
  } catch (err) {
    console.error("❌ OCR processing error:", err);
    return Response.json({ error: "OCR processing failed." }, { status: 500 });
  }
}
