"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CheckCircle, Brain, Camera, ShieldCheck } from "lucide-react";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="w-full border-b bg-white sticky top-0 z-50">
        <div className="mx-auto w-full max-w-screen-xl px-6 py-4 flex items-center justify-between">
          {/* Logo centered */}
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mx-auto">
            FinBuddy
          </h1>

          {/* Auth buttons (visually aligned to right) */}
          <div className="absolute right-6 flex items-center space-x-4 min-w-[200px]">
            <DarkModeToggle />
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black dark:bg-gray-950 overflow-hidden">
        {/* Background SVG Blob */}
        <svg
          className="absolute top-0 left-0 w-full h-full object-cover opacity-20 dark:opacity-10 -z-10"
          viewBox="0 0 1024 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="url(#gradient)"
            d="M737.6 104.2c54.7 39.8 95.4 103 96.5 168.8.9 65.1-35.8 131.5-86.2 183.3-50.5 51.8-115.6 89.1-178.8 109.2-63.3 20.1-125.7 23.2-183.2 6.4-57.4-16.8-109.9-55.7-137.3-107.8-27.5-52.2-29.9-116.6-4.2-172.2 25.7-55.6 77.2-102.2 135.6-125.2 58.5-23 124.1-22.6 186.1-2.5 62 20.1 120.6 58 171.5 99.8z"
          />
          <defs>
            <linearGradient
              id="gradient"
              x1="0"
              x2="1024"
              y1="0"
              y2="1024"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated Heading */}
        <motion.h2
          className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Master your money with FinBuddy 💰
        </motion.h2>

        <motion.p
          className="text-gray-600 dark:text-gray-300 max-w-xl mb-6 text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your personal finance sidekick — track your expenses, scan receipts,
          and get smart AI insights all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-x-4"
        >
          <SignedOut>
            <Link href="/sign-up">
              <Button size="lg">Create your account</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          </SignedIn>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h3 className="text-3xl font-semibold">Why FinBuddy?</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            We combine simplicity, AI, and automation to make your finances
            effortless.
          </p>
          {/* <h3 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
            See it in Action
          </h3>
          <p className="text-gray-600 mb-6">
            Here’s a quick look at FinBuddy in real use.
          </p>
          <img
            src="/assets/dashboard-demo.gif"
            alt="FinBuddy Dashboard Preview"
            className="rounded-lg shadow-xl mx-auto max-w-full"
          /> */}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Feature
            icon={<CheckCircle className="text-indigo-600 w-6 h-6" />}
            title="Track Every Penny"
            description="Manually or automatically log expenses with intuitive tools."
          />
          <Feature
            icon={<Camera className="text-indigo-600 w-6 h-6" />}
            title="Scan Receipts Instantly"
            description="Use OCR to capture expenses from photos — fast and accurate."
          />
          <Feature
            icon={<Brain className="text-indigo-600 w-6 h-6" />}
            title="AI-Powered Insights"
            description="Get smart summaries and spending tips generated by GPT-4.1."
          />
          <Feature
            icon={<ShieldCheck className="text-indigo-600 w-6 h-6" />}
            title="Secure & Private"
            description="Google, GitHub, and email sign-in — your data stays yours."
          />
        </div>
      </section>

      {/* Final CTA */}

      <section className="px-6 py-16 bg-gray-100 dark:bg-gray-950 ">
        <motion.div
          className="grid md:grid-cols-2 gap-6 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
        >
          <Testimonial
            name="Priya Nair"
            text="FinBuddy helped me understand where my money was leaking. The AI insights are scary accurate!"
          />
          <Testimonial
            name="Liam Carter"
            text="Clean UI. Fast UX. Exactly what I needed to manage personal + freelance expenses in one place."
          />
        </motion.div>
      </section>
      <section className="bg-indigo-600 text-white text-center px-6 py-16">
        <h4 className="text-3xl font-bold mb-4">
          Start taking control of your finances
        </h4>
        <p className="mb-6 text-lg">
          Sign up now and join the modern finance revolution.
        </p>
        <SignedOut>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 transition"
            >
              Get Started
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-indigo-600 transition"
            >
              Go to Dashboard
            </Button>
          </Link>
        </SignedIn>
      </section>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center mb-3">
        {icon}
        <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}

function Testimonial({ name, text }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-gray-700 dark:text-gray-300 italic">“{text}”</p>
      <div className="mt-4 font-semibold text-indigo-600 dark:text-indigo-400">
        {name}
      </div>
    </motion.div>
  );
}
