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

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

export default function HomePage() {
  const user = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-black relative overflow-hidden">
        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold mb-6 z-10 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Stop Guessing Your Finances.
          <span className="text-indigo-600 dark:text-indigo-400">
            {" "}
            Take Control.
          </span>
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-8 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Snap a receipt. AI organizes, analyzes, and tells you
          <span className="font-semibold">
            {" "}
            exactly where your money is going
          </span>{" "}
          — instantly.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {user ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/upload-only">
                <Button size="lg" variant="outline" className="px-8">
                  Upload Receipt
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/sign-up">
              <Button
                size="lg"
                className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Get Started Free
              </Button>
            </Link>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Finally, a Finance Tool That Works for You
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            No more spreadsheets. No more manual tracking. Just effortless
            clarity.
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Feature
            icon={<Camera />}
            title="Snap & Forget"
            desc="Take a photo of your receipt and let our OCR + AI handle categorizing and logging it."
          />
          <Feature
            icon={<Brain />}
            title="AI Insights"
            desc="Get plain-language summaries of your spending habits — no charts you can’t read."
          />
          <Feature
            icon={<CircleDollarSign />}
            title="Budget You’ll Follow"
            desc="Set realistic goals and track progress without feeling restricted."
          />
          <Feature
            icon={<LayoutDashboard />}
            title="One Dashboard, Total Clarity"
            desc="Every expense, trend, and summary in one clean, fast, mobile-friendly view."
          />
          <Feature
            icon={<FileText />}
            title="Smart History"
            desc="Search any past expense instantly — coffee last month? Done."
          />
          <Feature
            icon={<ShieldCheck />}
            title="Your Data, Your Rules"
            desc="Private by design. We never sell your data. You own it, full stop."
          />
        </motion.div>
      </section>

      {user ? null : (
        <section className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 py-20 px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Unlock the Full Experience
          </h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-10">
            Create your free account and access features that take your finance
            game to the next level.
          </p>
          <ul className="text-left max-w-md mx-auto mb-10 space-y-4 text-gray-700 dark:text-gray-300">
            <li>✔ Unlimited receipt uploads</li>
            <li>✔ AI-powered spending breakdowns</li>
            <li>✔ Custom budgeting tools</li>
            <li>✔ Private & secure data storage</li>
            <li>✔ Early access to new features</li>
          </ul>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 text-lg font-semibold"
            >
              Sign Up Free
            </Button>
          </Link>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-gray-100 dark:bg-gray-800 py-20 px-6">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            What Our Users Are Saying
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Real people. Real financial wins.
          </motion.p>
        </div>

        <motion.div
          className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Testimonial
            name="Sarah M."
            text="FinBuddy helped me spot $250/month in coffee runs I didn’t even realize were adding up."
          />
          <Testimonial
            name="Mark T."
            text="Finally a budgeting app that doesn’t just dump charts on me — it explains my spending like a friend."
          />
          <Testimonial
            name="Priya R."
            text="The AI summaries are shockingly accurate. I make better money decisions without even trying."
          />
          <Testimonial
            name="James L."
            text="I stopped missing bill payments because FinBuddy reminds me and tracks them automatically."
          />
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 text-white dark:bg-indigo-700 text-center px-6 py-24">
        <motion.h3
          className="text-3xl sm:text-4xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Master Your Money — Starting Today
        </motion.h3>
        <motion.p
          className="mb-8 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Stop wondering where your money went. Start telling it where to go.
        </motion.p>

        {user ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-indigo-600 px-8"
              >
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 font-semibold"
              >
                Sign Up Free
              </Button>
            </Link>
          </motion.div>
        )}
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <motion.div
      className="flex items-start space-x-5"
      variants={fadeUp}
      viewport={{ once: true }}
    >
      <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{desc}</p>
      </div>
    </motion.div>
  );
}

function Testimonial({ name, text }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md flex flex-col justify-between"
      variants={fadeUp}
      viewport={{ once: true }}
    >
      <p className="italic text-gray-700 dark:text-gray-300 mb-4">"{text}"</p>
      <p className="text-right font-semibold text-gray-900 dark:text-white">
        — {name}
      </p>
    </motion.div>
  );
}
