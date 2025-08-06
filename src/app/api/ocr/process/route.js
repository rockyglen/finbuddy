import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // WARNING: server only
);

const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;

export async function POST() {
  try {
    // 1. Get one unprocessed receipt (null ocr_text, <3 attempts)
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("id, receipt_url, ocr_attempts")
      .is("ocr_text", null)
      .lt("ocr_attempts", 3)
      .limit(1);

    if (error) {
      console.error("DB fetch error:", error);
      return Response.json(
        { error: "Failed to fetch receipt." },
        { status: 500 }
      );
    }

    if (!expenses || expenses.length === 0) {
      return Response.json({ message: "No receipts to process." });
    }

    const expense = expenses[0];
    const imageUrl = expense.receipt_url;
    console.log("🔍 OCR on:", imageUrl);

    // 2. Detect filetype from URL
    const extension = imageUrl.split(".").pop().split("?")[0].toLowerCase();

    const allowedFiletypes = {
      jpg: "JPG",
      jpeg: "JPG",
      png: "PNG",
      gif: "GIF",
      pdf: "PDF",
    };

    const filetype = allowedFiletypes[extension] || "PNG"; // safe fallback

    // 3. Send to OCR API
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

    const parsedText = ocrJson?.ParsedResults?.[0]?.ParsedText || null;
    const ocrError =
      ocrJson?.IsErroredOnProcessing || ocrJson?.OCRExitCode !== 1;

    // 4. Update Supabase with result
    const { error: updateError } = await supabase
      .from("expenses")
      .update({
        ocr_text: parsedText,
        ocr_attempts: expense.ocr_attempts + 1,
      })
      .eq("id", expense.id);

    if (updateError) {
      console.error("Update failed:", updateError);
      return Response.json(
        { error: "Failed to update OCR result." },
        { status: 500 }
      );
    }

    return Response.json({
      status: ocrError ? "partial-fail" : "success",
      ocr_response: ocrJson,
      text: parsedText,
    });
  } catch (err) {
    console.error("OCR error:", err);
    return Response.json({ error: "OCR processing failed." }, { status: 500 });
  }
}
