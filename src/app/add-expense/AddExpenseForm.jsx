"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ReceiptUpload from "@/components/ReceiptUpload";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Travel",
  "Other",
];

export default function AddExpenseForm() {
  const session = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const userId = session?.user?.id;

  // ✅ Auth check logic
  useEffect(() => {
    if (session === null) return;
    if (!session?.user) router.push("/sign-in");
    else setLoading(false);
  }, [session, router]);

  if (loading) return null;

  const handleFileChange = (file) => {
    if (file) {
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("🚀 Form submitted");

    try {
      let receiptUrl = null;

      if (receipt) {
        const fileExt = receipt.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, receipt, {
            upsert: false,
            contentType: receipt.type,
            metadata: { owner: userId },
          });

        if (uploadError) {
          console.error("Upload failed:", uploadError);
          setError("Receipt upload failed.");
          return;
        }

        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("receipts")
            .createSignedUrl(filePath, 60 * 60);

        if (signedUrlError) {
          console.error("Signed URL generation failed:", signedUrlError);
          setError("Could not generate access URL.");
          return;
        }

        receiptUrl = signedUrlData?.signedUrl;
        console.log("🧾 Signed Receipt URL:", receiptUrl);
      }

      // ✅ Required check moved here
      if (!amount || !category || !date) {
        setError("Please fill in all required fields.");
        return;
      }

      const { error: dbError } = await supabase.from("expenses").insert([
        {
          user_id: userId,
          amount: parseFloat(amount),
          category,
          date,
          description,
          receipt_url: receiptUrl,
        },
      ]);

      if (dbError) {
        console.error("Database insert failed:", dbError);
        setError("Saving to database failed.");
        return;
      }

      console.log("✅ Expense saved successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <motion.div
      className="max-w-xl mx-auto px-4 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Expense</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/upload-only"; // Or use navigation hook
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          Just want to upload a receipt?
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow"
      >
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
            required
          >
            <option value="">Select</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 mt-1 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700"
            placeholder="Extensive description of the expense..."
          />
        </div>

        <ReceiptUpload onFileSelect={handleFileChange} />

        {receipt && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt Preview:
            </p>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-[500px] object-contain rounded-lg shadow-lg border dark:border-gray-700"
              onClick={() => setShowModal(true)}
            />
          </motion.div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Full Receipt"
              className="max-w-full max-h-full rounded-lg shadow-lg"
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-400"
            >
              ×
            </button>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Save Expense
        </Button>
      </form>
    </motion.div>
  );
}
