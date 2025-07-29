"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Upload, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("expenses") || "[]");
    setTransactions(existing);
  }, []);

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName || "FinBuddy"} 👋
        </h1>
        <SignedIn>
          <Link href="/add-expense">
            <Button
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Add Expense
            </Button>
          </Link>
        </SignedIn>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DashboardCard
          icon={<ArrowUpRight className="text-emerald-500 w-5 h-5" />}
          title="This Month's Spending"
          value={
            transactions.length
              ? `$${transactions
                  .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
                  .toFixed(2)}`
              : "$0.00"
          }
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
          icon={<Sparkles className="text-purple-500 w-5 h-5" />}
          title="AI Insights"
          value={
            transactions.length
              ? "Spending increased 12% vs last month"
              : "No data yet — upload a receipt to get insights."
          }
          action={
            transactions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-500 hover:underline mt-2"
              >
                View Details
              </Button>
            )
          }
        />
      </div>

      {/* Recent Transactions */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>

        {transactions.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-12">
            <p>No transactions yet.</p>
            <p className="mt-2">
              Start by uploading a receipt or adding an expense.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{tx.category || "Unknown"}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tx.date}
                  </p>
                  {tx.description && (
                    <p className="text-sm italic text-gray-600 dark:text-gray-400 mt-1">
                      {tx.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${Number(tx.amount || 0).toFixed(2)}
                  </p>
                  {tx.receiptName && (
                    <p className="text-xs text-gray-400 mt-1">
                      📎 {tx.receiptName}
                    </p>
                  )}
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
