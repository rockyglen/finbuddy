"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Upload, Sparkles, Trash } from "lucide-react";
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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [smartSummary, setSmartSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const getUserAndData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/sign-in");
        return;
      }

      const user = session.user;
      setUser(user);

      await fetchExpenses(user.id);
      await fetchSavedSummary(user.id);
    };

    getUserAndData();
  }, [router]);

  const fetchExpenses = async (uid) => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: false });

    if (!error) {
      setTransactions(data);
      setFiltered(data);
    }
  };

  const fetchSavedSummary = async (uid) => {
    const { data, error } = await supabase
      .from("ai_summary")
      .select("summary_text, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data?.summary_text) {
      setSmartSummary(data.summary_text);
    }
  };

  const fetchSmartSummary = async () => {
    try {
      setLoadingSummary(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/summary-insights", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSmartSummary(data.summary);
      } else {
        setSmartSummary(`⚠️ ${data.error}`);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setSmartSummary("⚠️ Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDelete = async (id) => {
    const tx = transactions.find((tx) => tx.id === id);

    if (tx?.receipt_url) {
      try {
        const pathMatch = tx.receipt_url.match(
          /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/
        );
        if (pathMatch && pathMatch.length === 3) {
          const [, bucket, filePath] = pathMatch;
          await supabase.storage.from(bucket).remove([filePath]);
        }
      } catch (err) {
        console.error("Storage delete error:", err);
      }
    }

    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      const updated = transactions.filter((tx) => tx.id !== id);
      setTransactions(updated);
      setFiltered(updated);
    }
  };

  useEffect(() => {
    const filtered = transactions.filter((tx) => {
      const matchCategory = categoryFilter
        ? tx.category === categoryFilter
        : true;
      const matchDate = dateFilter ? tx.date === dateFilter : true;
      const matchSearch = search
        ? tx.description?.toLowerCase().includes(search.toLowerCase()) ||
          tx.category?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchCategory && matchDate && matchSearch;
    });
    setFiltered(filtered);
  }, [search, categoryFilter, dateFilter, transactions]);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
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

      {transactions.length > 0 && (
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
              disabled={loadingSummary}
              className="mt-2 bg-yellow-500 text-white hover:bg-yellow-600"
            >
              {loadingSummary ? "Generating..." : "Regenerate"}
            </Button>
          }
        />
      </div>

      {smartSummary && (
        <div className="mt-10 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AI-Powered Smart Summary
            </h3>
            <Button
              onClick={fetchSmartSummary}
              disabled={loadingSummary}
              className="text-xs px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm"
            >
              {loadingSummary ? "Generating..." : "Regenerate"}
            </Button>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-li:marker:text-indigo-500">
            <ReactMarkdown>{smartSummary}</ReactMarkdown>
          </div>
        </div>
      )}

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
                      {tx.date}
                    </p>
                    {tx.description && (
                      <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-1">
                        {tx.description}
                      </p>
                    )}
                    {tx.insights_json && (
                      <div className="mt-3 text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-purple-500 font-semibold mb-1">
                          AI Insight:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
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
