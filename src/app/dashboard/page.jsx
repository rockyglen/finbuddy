"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useSWR from "swr";
import { getExpenses, getSmartSummary } from "@/lib/fetchers";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Upload, Sparkles, Trash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import ReactMarkdown from "react-markdown";
import LoaderSpinner from "@/components/ui/LoaderSpinner";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [filtered, setFiltered] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loadingSummaryManually, setLoadingSummaryManually] = useState(false);
  const [smartSummary, setSmartSummary] = useState(null);

  // Initialize user
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        router.push("/sign-in");
      } else {
        setUser(data.session.user);
      }
      setLoadingUser(false);
    };
    loadUser();
  }, [router]);

  const shouldFetch = !!user?.id;

  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    error: txError,
  } = useSWR(shouldFetch ? ["expenses", user.id] : null, () =>
    getExpenses(user.id)
  );

  const {
    data: summaryData,
    isLoading: loadingSummaryFromSWR,
    error: sumError,
  } = useSWR(shouldFetch ? ["summary", user.id] : null, () =>
    getSmartSummary(user.id)
  );

  useEffect(() => {
    if (summaryData) {
      setSmartSummary(summaryData);
    }
  }, [summaryData]);

  useEffect(() => {
    const txs = transactionsData ?? [];
    const filteredArray = txs
      .filter((tx) => {
        const matchCategory = categoryFilter
          ? tx.category === categoryFilter
          : true;
        const matchDate = dateFilter ? tx.date === dateFilter : true;
        const matchSearch = search
          ? tx.description?.toLowerCase().includes(search.toLowerCase()) ||
            tx.category?.toLowerCase().includes(search.toLowerCase())
          : true;
        return matchCategory && matchDate && matchSearch;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 🆕 Sort by created_at DESC
    setFiltered(filteredArray);
  }, [transactionsData, categoryFilter, dateFilter, search]);

  const fetchSmartSummary = async () => {
    setLoadingSummaryManually(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch("/api/summary-insights", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      const json = await res.json();
      if (res.ok) {
        setSmartSummary(json.summary);
      } else {
        console.error("Server error summary:", json.error);
        setSmartSummary(`⚠️ ${json.error}`);
      }
    } catch (err) {
      console.error("Fetch summary failed:", err);
      setSmartSummary("⚠️ Failed to generate summary.");
    }
    setLoadingSummaryManually(false);
  };

  const handleDelete = async (id) => {
    const tx = (transactionsData ?? []).find((tx) => tx.id === id);
    if (tx?.receipt_url) {
      const match = tx.receipt_url.match(
        /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/
      );
      if (match) {
        const [, bucket, filePath] = match;
        await supabase.storage.from(bucket).remove([filePath]);
      }
    }
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setFiltered((prev) => prev.filter((t) => t.id !== id));
    } else {
      console.error("Delete failed:", error);
    }
  };

  const chartData = {
    labels: [...new Set(filtered.map((tx) => tx.category))],
    datasets: [
      {
        label: "Spending ($)",
        data: [...new Set(filtered.map((tx) => tx.category))].map((cat) =>
          filtered
            .filter((tx) => tx.category === cat)
            .reduce((sum, tx) => sum + Number(tx.amount), 0)
        ),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
    ],
  };

  if (loadingUser || loadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <LoaderSpinner />
      </div>
    );
  }

  if (txError) {
    console.error("SWR transactions error:", txError);
  }
  if (sumError) {
    console.error("SWR summary error:", sumError);
  }

  const txs = transactionsData ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">
          Welcome back, {user.user_metadata?.name || "FinBuddy"} 👋
        </h1>
        <Link href="/add-expense">
          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            size="sm"
          >
            + Add Expense
          </Button>
        </Link>
      </div>

      {txs.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Search description/category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Categories</option>
              {[
                "Food",
                "Transport",
                "Shopping",
                "Bills",
                "Health",
                "Travel",
                "Other",
              ].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="my-10">
            <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
              <Bar data={chartData} />
            </div>
          </div>
        </>
      )}

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardCard
          icon={<ArrowUpRight className="text-emerald-500 w-5 h-5" />}
          title="Total Spending"
          value={`$${filtered
            .reduce((sum, tx) => sum + Number(tx.amount), 0)
            .toFixed(2)}`}
        />
        <DashboardCard
          icon={<Upload className="text-blue-500 w-5 h-5" />}
          title="Upload Receipt"
          action={
            <Link href="/add-expense">
              <Button variant="outline" size="sm" className="mt-2">
                Upload <Upload className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          }
        />
        <DashboardCard
          icon={<Sparkles className="text-yellow-500 w-5 h-5" />}
          title="Smart Summary"
          action={
            <Button
              onClick={fetchSmartSummary}
              disabled={loadingSummaryFromSWR || loadingSummaryManually}
              className="mt-2 bg-yellow-500 text-white hover:bg-yellow-600"
            >
              {loadingSummaryFromSWR || loadingSummaryManually
                ? "Generating..."
                : "Regenerate"}
            </Button>
          }
        />
      </div>

      {/* Smart Summary */}
      {smartSummary && (
        <div className="relative mt-10 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 to-gray-800 rounded-xl shadow-lg border dark:border-gray-700 transition-all">
          {(loadingSummaryFromSWR || loadingSummaryManually) && (
            <LoaderSpinner />
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AI-Powered Smart Summary
            </h3>
            <Button
              onClick={fetchSmartSummary}
              disabled={loadingSummaryFromSWR || loadingSummaryManually}
              className="text-xs px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm"
            >
              {loadingSummaryFromSWR || loadingSummaryManually
                ? "Generating..."
                : "Regenerate"}
            </Button>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-li:marker:text-indigo-500 prose-ul:pl-5 prose-ul:mt-2">
            <ReactMarkdown>{smartSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {filtered.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-12">
            <p>No transactions match filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{tx.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tx.date} —{" "}
                      <span className="text-xs">
                        Created: {new Date(tx.created_at).toLocaleString()}
                      </span>
                    </p>

                    {tx.description && (
                      <p className="italic text-sm mt-1 dark:text-gray-400">
                        {tx.description}
                      </p>
                    )}
                    {tx.insights_json && (
                      <div className="mt-3 p-3 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">
                        <p className="font-semibold mb-1 text-purple-500">
                          AI Insight:
                        </p>
                        <ul className="list-disc list-inside dark:text-gray-200">
                          {tx.insights_json.items?.map((item, idx) => (
                            <li key={idx}>
                              {item} —{" "}
                              {
                                tx.insights_json.insights?.category_guesses?.[
                                  item
                                ]
                              }
                            </li>
                          ))}
                          <li>
                            Total: ${tx.insights_json.total_spent?.toFixed(2)}
                          </li>
                          <li>
                            Date Detected: {tx.insights_json.detected_date}
                          </li>
                          {tx.insights_json.insights?.unusual_spending && (
                            <li className="text-red-500 font-semibold">
                              ⚠️ Unusual Spending Detected
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      ${Number(tx.amount).toFixed(2)}
                    </p>
                    {tx.receipt_url && (
                      <a
                        href={tx.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 mt-1 underline block"
                      >
                        View Receipt
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="mt-2 text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/edit-expense/${tx.id}`)}
                      className="mt-2 text-indigo-500 hover:text-indigo-700"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, value, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border dark:border-gray-700"
    >
      <div className="flex items-center mb-2 space-x-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {value && <p className="text-2xl font-bold mt-1">{value}</p>}
      {action}
    </motion.div>
  );
}
