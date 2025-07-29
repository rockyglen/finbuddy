"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ReceiptUpload from "@/components/ReceiptUpload";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";

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
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      setError("Please fill in all required fields.");
      return;
    }

    let receiptUrl = null;
    // Uploading receipt
    if (receipt) {
      const fileExt = receipt.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(`user-${user.id}/${fileName}`, receipt);

      if (uploadError) {
        console.error(uploadError);
        setError("Receipt upload failed.");
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(`user-${user.id}/${fileName}`);

      receiptUrl = publicUrlData?.publicUrl;
    }

    // Save expense to DB

    const { error: dbError } = await supabase.from("expenses").insert([
      {
        user_id: user.id,
        amount: parseFloat(amount),
        category,
        date,
        description,
        receipt_url: receiptUrl,
      },
    ]);

    if (dbError) {
      console.error(dbError);
      setError("Saving to database failed.");
      return;
    }

    router.push("/dashboard");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
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
            placeholder="E.g. Bought groceries at Walmart"
          />
        </div>
        <ReceiptUpload onFileSelect={(file) => setReceipt(file)} />
        {receipt && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt Preview:
            </p>
            {receipt?.type.startsWith("image/") ? (
              <motion.img
                key={receipt.name}
                src={URL.createObjectURL(receipt)}
                alt="Receipt preview"
                className="w-full max-h-[500px] object-contain rounded-lg shadow-lg border dark:border-gray-700 cursor-zoom-in"
                onClick={() => setShowModal(true)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <motion.div
                className="text-sm text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="font-medium">Uploaded file: </span>
                {receipt.name}
              </motion.div>
            )}
          </motion.div>
        )}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
            <img
              src={URL.createObjectURL(receipt)}
              alt="Full Receipt"
              className="max-w-full max-h-full rounded-lg shadow-lg"
              onClick={() => setShowModal(false)}
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
