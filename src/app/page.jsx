"use client";

import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Camera,
  Brain,
  LayoutDashboard,
  FileText,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  const user = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-black relative overflow-hidden">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4 z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Your Smart Finance Sidekick 💸
        </motion.h1>
        <motion.p
          className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mb-6 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Upload receipts, analyze spending, get AI summaries — all in one
          modern, secure dashboard.
        </motion.p>

        <motion.div
          className="space-x-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
              <Link href="/upload-only">
                <Button size="lg" variant="outline">
                  Upload Receipt
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/sign-up">
              <Button size="lg">Get Started Free</Button>
            </Link>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Features That Matter</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Designed to simplify your financial life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Feature
            icon={<Camera />}
            title="Scan Receipts"
            desc="Upload your receipts and let OCR handle the rest."
          />
          <Feature
            icon={<Brain />}
            title="AI Smart Summary"
            desc="Understand where your money goes with GPT-4.1 summaries."
          />
          <Feature
            icon={<CircleDollarSign />}
            title="Budget Tracker"
            desc="Visualize and manage your monthly spending."
          />
          <Feature
            icon={<LayoutDashboard />}
            title="Clean Dashboard"
            desc="All your insights in one place. Sleek, fast, secure."
          />
          <Feature
            icon={<FileText />}
            title="Expense History"
            desc="Browse, search, and filter your past spending easily."
          />
          <Feature
            icon={<ShieldCheck />}
            title="Private & Secure"
            desc="We respect your data. You own it. End of story."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100 dark:bg-gray-800 py-20 px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Why Users Love It</h2>
          <p className="text-gray-600 dark:text-gray-400">
            It’s not just features — it’s peace of mind.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <Testimonial
            name="Sarah M."
            text="FinBuddy helped me realize I was spending $250/month on coffee. Game changer."
          />
          <Testimonial
            name="Mark T."
            text="I love the AI summaries — finally a budgeting app that makes sense."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 text-white dark:bg-indigo-700 text-center px-6 py-20">
        <h3 className="text-3xl font-bold mb-4">
          Start mastering your money today
        </h3>
        <p className="mb-6 text-lg">
          FinBuddy gives you control, clarity, and confidence.
        </p>

        {user ? (
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-indigo-600"
            >
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Sign Up Free
            </Button>
          </Link>
        )}
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function Testimonial({ name, text }) {
  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
      <p className="italic text-gray-700 dark:text-gray-300">"{text}"</p>
      <p className="mt-4 text-right font-semibold text-gray-900 dark:text-white">
        — {name}
      </p>
    </div>
  );
}
