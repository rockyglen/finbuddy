"use client";

import { motion } from "framer-motion";
import { FaBrain, FaTools, FaUserTie, FaGlobeAmericas } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-6 py-16 max-w-4xl mx-auto">
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold mb-8 text-indigo-600 dark:text-indigo-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        About FinBuddy
      </motion.h1>

      <motion.section
        className="space-y-6 text-lg leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p>
          <strong className="text-indigo-600 dark:text-indigo-400">
            FinBuddy
          </strong>{" "}
          is your personal finance companion, designed to help you understand
          and optimize your spending using AI and modern UI/UX.
        </p>

        <p>
          Whether you're tracking receipts, analyzing monthly trends, or getting
          personalized spending insights — FinBuddy puts real financial power in
          your hands. Built for the US market, it's designed to answer the
          questions that matter:
        </p>

        <ul className="list-disc list-inside pl-4">
          <li>💸 Where am I overspending?</li>
          <li>🍕 What's my average food spending?</li>
          <li>📊 How much should I budget next month?</li>
        </ul>
      </motion.section>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <InfoCard
          icon={<FaBrain className="w-6 h-6 text-indigo-500" />}
          title="Our Mission"
          text="Make AI-powered personal finance simple, actionable, and accessible for everyone — no financial jargon, just insights."
        />
        <InfoCard
          icon={<FaUserTie className="w-6 h-6 text-emerald-500" />}
          title="The Creator"
          text="Built by Glen Louis, a hybrid engineer blending data science, machine learning, and full-stack dev to create real-world impact."
        />
        <InfoCard
          icon={<FaTools className="w-6 h-6 text-yellow-500" />}
          title="Tech Stack"
          text="Next.js App Router, Tailwind CSS, Supabase (DB & Auth), GPT-4.1 Nano via OCI API, Tesseract.js OCR — all production-grade."
        />
        <InfoCard
          icon={<FaGlobeAmericas className="w-6 h-6 text-pink-500" />}
          title="Vision"
          text="To empower everyday users with AI tools that go beyond tracking — they guide, recommend, and transform your relationship with money."
        />
      </div>

      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <p className="text-lg text-gray-600 dark:text-gray-400">
          FinBuddy is more than an app — it's your smart financial ally.
        </p>
        <p className="mt-2 text-indigo-500 font-semibold">
          Let's build smarter spending habits, together.
        </p>
      </motion.div>
    </main>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <motion.div
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center space-x-3 mb-3">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </motion.div>
  );
}
