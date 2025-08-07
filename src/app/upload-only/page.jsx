"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

export default function UploadReceiptPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a receipt");
      return;
    }

    setUploading(true);
    const filename = `${uuidv4()}-${file.name}`;

    // Step 1: Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filename, file);

    if (uploadError) {
      console.error("❌ Upload error:", uploadError.message);
      toast.error("Failed to upload receipt");
      setUploading(false);
      return;
    }

    // Step 2: Insert into `expenses` table
    const { data: insertData, error: insertError } = await supabase
      .from("expenses")
      .insert([
        {
          receipt_url: filename,
          ocr_attempts: 0,
          amount: 0,
          category: "Uncategorized",
          date: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("❌ DB insert error:", insertError.message);
      toast.error("Failed to save expense to database");
      setUploading(false);
      return;
    }

    const expenseId = insertData.id;

    // Step 3: Trigger background OCR + GPT
    const triggerRes = await fetch("/api/ocr/full-process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: filename,
        expenseId: expenseId,
      }),
    });

    if (!triggerRes.ok) {
      toast.warning("Uploaded, but failed to trigger OCR.");
      console.warn("⚠️ OCR trigger failed");
    } else {
      toast.success("Receipt uploaded. Processing...");
    }

    // Step 4: Redirect to dashboard
    router.push("/dashboard");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-24 p-8 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-all">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Smart Receipt Upload
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Our AI extracts data instantly. Just drop your receipt below.
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="file"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
        >
          Receipt File
        </label>

        <div
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
            file ? "border-green-400" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <input
            id="file"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16l4-4m0 0l4 4m-4-4v12M21 12h-6.586a1 1 0 01-.707-.293l-4.414-4.414a1 1 0 00-1.414 0L3 14"
              />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Click or drag a file here to upload
            </span>
          </label>

          {file && (
            <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>
      </div>

      {previewUrl && (
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
            Preview
          </label>
          <div className="mt-2 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
            {file?.type?.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="w-full max-h-72 object-contain"
              />
            ) : (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                PDF selected. Preview not available.
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload Receipt"}
      </button>
    </div>
  );
}
