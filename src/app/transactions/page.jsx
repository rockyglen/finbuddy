"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { getExpenses } from "@/lib/fetchers";
import { motion } from "framer-motion";
import { Trash, Pencil, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoaderSpinner from "@/components/ui/LoaderSpinner";

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session?.user) return router.push("/sign-in");
      setUser(data.session.user);
      setLoadingUser(false);
    });
  }, [router]);

  const shouldFetch = !!user?.id;
  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    mutate,
  } = useSWR(shouldFetch ? ["expenses", user.id] : null, () =>
    getExpenses(user.id)
  );

  const handleDelete = async (id) => {
    await supabase.from("expenses").delete().eq("id", id);
    mutate(); // Refresh the list
  };

  const filtered = (transactionsData || [])
    .filter((tx) => {
      return (
        (categoryFilter ? tx.category === categoryFilter : true) &&
        (dateFilter ? tx.date === dateFilter : true) &&
        (search
          ? tx.description?.toLowerCase().includes(search.toLowerCase()) ||
            tx.category?.toLowerCase().includes(search.toLowerCase())
          : true)
      );
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (loadingUser || loadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 lg:px-12 py-10 bg-gradient-to-b from-indigo-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight">All Transactions</h1>
        <Button
          onClick={() => router.push("/add-expense")}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow hover:scale-105 transition"
        >
          + Add Transaction
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <option value="">All Categories</option>
          {[...new Set(transactionsData?.map((tx) => tx.category))].map(
            (cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            )
          )}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
        />
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-white/70 dark:bg-gray-900/50 rounded-xl shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <p className="text-xl font-semibold">{tx.category}</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
                {tx.description && (
                  <p className="text-sm italic text-gray-600 dark:text-gray-400">
                    {tx.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-500">
                  ${Number(tx.amount || 0).toFixed(2)}
                </p>
                <div className="flex gap-3 justify-end mt-2">
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push(`/edit-expense/${tx.id}`)}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
