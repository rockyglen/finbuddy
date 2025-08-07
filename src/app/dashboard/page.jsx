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
    if (summaryData !== undefined) setSmartSummary(summaryData);
  }, [summaryData]);

  useEffect(() => {
    const txs = transactionsData || [];
    const filteredTx = txs
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
    setFiltered(filteredTx);
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
      if (res.ok) setSmartSummary(json.summary);
      else {
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
    const tx = transactionsData?.find((t) => t.id === id);
    if (tx?.receipt_url) {
      const match = tx.receipt_url.match(
        /\/storage\/v1\/object\/public\/([^/]+)\/(.+)/
      );
      if (match) {
        await supabase.storage.from(match[1]).remove([match[2]]);
      }
    }
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) setFiltered((prev) => prev.filter((t) => t.id !== id));
    else console.error("Delete failed:", error);
  };

  const chartData = {
    labels: [...new Set(filtered.map((tx) => tx.category))],
    datasets: [
      {
        label: "Spending ($)",
        data: [...new Set(filtered.map((tx) => tx.category))].map((cat) =>
          filtered
            .filter((tx) => tx.category === cat)
            .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
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

  const name =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "FinBuddy";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Welcome back, {name} 👋</h1>
        <Link href="/add-expense">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
            + Add Expense
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800"
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
          className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800"
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<ArrowUpRight className="text-emerald-500 w-5 h-5" />}
          label="Total Spending"
          value={`$${filtered
            .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
            .toFixed(2)}`}
        />
        <MetricCard
          icon={<Upload className="text-blue-500 w-5 h-5" />}
          label="Upload Receipt"
          action={
            <Link href="/upload-only">
              <Button variant="outline" size="sm">
                Upload
              </Button>
            </Link>
          }
        />
        <MetricCard
          icon={<Sparkles className="text-yellow-500 w-5 h-5" />}
          label="Smart Summary"
          action={
            <Button
              onClick={fetchSmartSummary}
              loading={loadingSummaryFromSWR || loadingSummaryManually}
            >
              {loadingSummaryFromSWR || loadingSummaryManually
                ? "Loading..."
                : "Refresh"}
            </Button>
          }
        />
      </div>

      {/* AI Summary */}
      {smartSummary && (
        <section className="p-6 bg-indigo-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">AI Insights</h2>
            <span className="text-sm text-gray-500">
              Updated: {new Date().toLocaleDateString()}
            </span>
          </div>
          <ReactMarkdown>{smartSummary}</ReactMarkdown>
        </section>
      )}

      {/* Spending Chart */}
      {filtered.length > 0 && (
        <section className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Spend by Category</h2>
          <Bar data={chartData} />
        </section>
      )}

      {/* Recent Transactions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {filtered.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx, idx) => (
              <div
                key={tx.id}
                className={`p-4 rounded-lg ${
                  idx % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-700"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{tx.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tx.date}
                    </p>
                    {tx.description && (
                      <p className="italic text-sm">{tx.description}</p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">
                      ${Number(tx.amount || 0).toFixed(2)}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/edit-expense/${tx.id}`)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, action }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          {value && <p className="text-xl font-bold">{value}</p>}
        </div>
      </div>
      {action && action}
    </div>
  );
}
