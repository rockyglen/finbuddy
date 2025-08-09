"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useSWR from "swr";
import { getExpenses, getSmartSummary } from "@/lib/fetchers";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
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

/* ----------------------
   Helper: smooth number animation (no extra deps)
   ---------------------- */
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(target || 0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(target || 0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    fromRef.current = value;
    const start = performance.now();
    startRef.current = start;

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(next);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

/* ----------------------
   Skeleton components
   ---------------------- */
function MetricSkeleton() {
  return (
    <div className="animate-pulse bg-white/70 dark:bg-gray-800/50 backdrop-blur p-5 rounded-xl h-28" />
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-white/70 dark:bg-gray-800/50 backdrop-blur p-6 rounded-xl h-[48vh] sm:h-[64vh]" />
  );
}

/* ----------------------
   Dashboard
   ---------------------- */
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
  const { data: transactionsData, isLoading: loadingTransactions } = useSWR(
    shouldFetch ? ["expenses", user.id] : null,
    () => getExpenses(user.id)
  );

  const { data: summaryData, isLoading: loadingSummaryFromSWR } = useSWR(
    shouldFetch ? ["summary", user.id] : null,
    () => getSmartSummary(user.id)
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
      else setSmartSummary(`⚠️ ${json.error}`);
    } catch {
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
    await supabase.from("expenses").delete().eq("id", id);
    setFiltered((prev) => prev.filter((t) => t.id !== id));
  };

  const categories = [...new Set(filtered.map((tx) => tx.category))];
  const chartData = {
    labels: categories,
    datasets: [
      {
        label: "Spending ($)",
        data: categories.map((cat) =>
          filtered
            .filter((tx) => tx.category === cat)
            .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
        ),
        backgroundColor: categories.map(
          (_, i) =>
            `rgba(${60 + ((i * 30) % 180)}, ${130 + ((i * 20) % 120)}, ${
              200 - ((i * 10) % 100)
            }, 0.85)`
        ),
        borderRadius: 10,
        barThickness: 32,
      },
    ],
  };

  const totalSpending = filtered.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );
  const animatedTotal = useAnimatedNumber(totalSpending, 900);

  if (loadingUser || loadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900">
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

  /* Chart options */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "rgb(75 85 99)" },
      },
      y: {
        grid: {
          color: "rgba(15,23,42,0.06)",
          drawBorder: false,
        },
        ticks: {
          color: "rgb(75 85 99)",
          beginAtZero: true,
        },
      },
    },
    animation: {
      duration: 900,
      easing: "cubicBezier(.2,.8,.2,1)",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 px-6 lg:px-12 py-12">
      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HERO */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Hi,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {name}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              Your financial snapshot — clean, focused, and updated in real
              time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/add-expense">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 shadow-lg">
                  + Add Expense
                </Button>
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCategoryFilter("");
                setDateFilter("");
                setSearch("");
              }}
              className="px-4 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur text-sm"
            >
              Reset
            </motion.button>
          </div>
        </motion.header>

        {/* Filters (minimal) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 items-center"
        >
          <input
            type="text"
            placeholder="Search description or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[220px] px-3 py-2 rounded-lg border border-transparent bg-white/60 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-900/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </motion.div>

        {/* Metrics row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch"
        >
          {/* Total Spending - prominent */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(2,6,23,0.08)" }}
            className="col-span-1 sm:col-span-1 bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spending</p>
                <p className="text-3xl font-semibold mt-2">
                  $
                  {animatedTotal.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Across {filtered.length} transactions
                </p>
              </div>
              <div className="rounded-full bg-indigo-50 dark:bg-indigo-800/40 p-3">
                <ArrowUpRight className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          {/* Upload */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Upload Receipt</p>
                <p className="mt-2 text-base font-medium">
                  Keep your receipts in one place
                </p>
              </div>
              <div className="rounded-full bg-indigo-50 dark:bg-gray-800/40 p-3">
                <Upload className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/upload-only">
                <Button variant="outline" className="px-4 py-2">
                  Upload
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Smart summary */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 6 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Smart Summary</p>
                <p className="mt-2 text-base font-medium">
                  AI insights about your spending
                </p>
              </div>
              <div className="rounded-full bg-yellow-50 dark:bg-yellow-900/30 p-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={fetchSmartSummary}
                disabled={loadingSummaryFromSWR || loadingSummaryManually}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2"
              >
                {loadingSummaryFromSWR || loadingSummaryManually
                  ? "Generating..."
                  : "Refresh"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSmartSummary(null)}
                className="px-4 py-2"
              >
                Clear
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Big Chart - FULL WIDTH, prominent */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900/60 p-6 rounded-2xl shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Spending Overview</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{categories.length} categories</span>
              <span>•</span>
              <span>{filtered.length} transactions</span>
            </div>
          </div>

          {/* Chart container is tall — makes the chart the visual hero */}
          <div className="h-[48vh] sm:h-[64vh]">
            {filtered.length === 0 ? (
              <ChartSkeleton />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </motion.section>

        {/* Insights + Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights wide in desktop (span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> AI Insights
              </h3>
              <div className="text-sm text-gray-500">
                Updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            {smartSummary ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{smartSummary}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500">
                No summary yet. Click “Refresh” to generate AI insights.
              </p>
            )}
          </motion.div>

          {/* Recent transactions */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900/50 p-6 rounded-2xl shadow overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Link href="/transactions">
                <span className="text-sm text-indigo-600 hover:underline">
                  View all
                </span>
              </Link>
            </div>

            {filtered.length === 0 ? (
              <p className="text-gray-500">No transactions found.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="py-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-800/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {(tx.category || "X").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{tx.category}</p>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      {tx.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {tx.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-indigo-600">
                        ${Number(tx.amount || 0).toFixed(2)}
                      </p>
                      <div className="flex gap-2 mt-3 justify-end">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/edit-expense/${tx.id}`)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
