"use client";

import { motion } from "framer-motion";
import { FaBrain, FaTools, FaUserTie, FaGlobeAmericas } from "react-icons/fa";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white px-6 py-16 max-w-5xl mx-auto">
      {/* Hero Title */}
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold mb-10 text-indigo-600 dark:text-indigo-400 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        About FinBuddy
      </motion.h1>

      {/* Intro */}
      <motion.section
        className="text-lg leading-relaxed space-y-6 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            FinBuddy
          </span>{" "}
          is your smart finance companion — built to track, analyze, and
          optimize your spending through AI-powered insights.
        </p>

        <p>
          Whether it’s receipt scanning, trend analysis, or personalized
          recommendations, FinBuddy helps you take control of your finances —
          intelligently and effortlessly.
        </p>

        <div className="pl-4">
          <ul className="list-disc list-inside space-y-1">
            <li>💸 Pinpoint overspending patterns</li>
            <li>
              🍕 Understand category-wise habits (like food, travel, bills)
            </li>
            <li>📊 Budget smarter with predictive insights</li>
          </ul>
        </div>
      </motion.section>

      {/* Info Grid */}
      <section className="grid md:grid-cols-2 gap-10">
        <InfoCard
          icon={<FaBrain className="w-6 h-6 text-indigo-500" />}
          title="Our Mission"
          text="Simplify personal finance using AI. No jargon, just insights you can act on."
        />
        <InfoCard
          icon={<FaUserTie className="w-6 h-6 text-emerald-500" />}
          title="The Creator"
          text="Crafted by Glen Louis — a hybrid engineer obsessed with blending full-stack, ML, and real-world impact."
        />
        <InfoCard
          icon={<FaTools className="w-6 h-6 text-yellow-500" />}
          title="Tech Stack"
          text="Next.js App Router, Tailwind CSS, Supabase (DB/Auth), GPT-4.1 Nano (OCI), and Tesseract.js for OCR — fully production-tuned."
        />
        <InfoCard
          icon={<FaGlobeAmericas className="w-6 h-6 text-pink-500" />}
          title="Vision"
          text="Transform your relationship with money — from reactive tracking to proactive financial intelligence."
        />
      </section>

      {/* Footer CTA */}
      <motion.div
        className="text-center mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <p className="text-lg text-gray-600 dark:text-gray-400">
          FinBuddy isn’t just an app — it’s your AI-powered financial ally.
        </p>
        <p className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xl">
          Build smarter money habits, starting today.
        </p>
      </motion.div>
    </main>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <motion.div
      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </motion.div>
  );
}
