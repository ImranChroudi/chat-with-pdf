"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MessagesSquare,
  Search,
  Zap,
  History,
  Smartphone,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

// ── Palette (used inline via Tailwind arbitrary values) ──────────────────
// paper       #FAFAF7   page background
// paper-warm  #F5F3EE   card / panel background
// ink         #14161F   headings, primary text, primary buttons
// ink-soft    #4A4D57   body copy, secondary text
// hairline    #E4E2DC   borders, dividers
// highlighter #FFE066   the one accent — reads as a literal highlighter mark
// indigo      #4F46E5   interactive/hover state

const features = [
  {
    name: "Organized by default",
    description:
      "Every upload is indexed the moment it lands, so you can find any document in seconds — no folders to maintain.",
    icon: FileText,
  },
  {
    name: "Ask, don't search",
    description:
      "Type a question in plain language and get an answer pulled straight from the page it lives on.",
    icon: MessagesSquare,
  },
  {
    name: "Surface what matters",
    description:
      "Pull figures, dates, and clauses out of long documents without reading them start to finish.",
    icon: Search,
  },
  {
    name: "Answers in seconds",
    description:
      "Even a 300-page filing returns a sourced answer before your coffee gets cold.",
    icon: Zap,
  },
  {
    name: "Remembers every thread",
    description:
      "Come back a week later and pick the conversation up exactly where you left it.",
    icon: History,
  },
  {
    name: "Read from anywhere",
    description:
      "The same conversation follows you from your laptop to your phone, mid-sentence.",
    icon: Smartphone,
  },
];

const rotating = ["a summary", "the key clause", "the exact figure", "the citation"];

function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const words = useMemo(() => rotating, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setWordIndex((prev) => (prev === words.length - 1 ? 0 : prev + 1));
    }, 2200);
    return () => clearTimeout(id);
  }, [wordIndex, words]);

  return (
    <main className="bg-[#FAFAF7] [font-family:var(--font-body)]">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center">
        <Navbar />

        {/* frame lines */}
        <div className="absolute inset-y-0 left-0 hidden h-full w-px bg-[#E4E2DC] md:block">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-[#4F46E5]/50 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-0 hidden h-full w-px bg-[#E4E2DC] md:block">
          <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-[#4F46E5]/50 to-transparent" />
        </div>

        <div className="px-6 py-16 md:py-24">
          {/* eyebrow */}
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F46E5] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4F46E5]" />
            </span>
            <span className="[font-family:var(--font-mono)] text-xs font-medium uppercase tracking-[0.16em] text-[#4A4D57]">
              AI reading assistant
            </span>
          </div>

          {/* headline */}
          <h1 className="relative z-10 mx-auto mt-6 max-w-3xl text-center text-4xl font-medium leading-[1.08] text-[#14161F] [font-family:var(--font-display)] md:text-6xl lg:text-7xl">
            {"Turn any PDF into a conversation."
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06, ease: "easeInOut" }}
                  className="mr-2 inline-block"
                >
                  {word}
                </motion.span>
              ))}
          </h1>

          {/* rotating highlight line */}
          <div className="relative z-10 mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-lg text-[#4A4D57] md:text-xl">
            <span>Ask for</span>
            <span className="relative inline-flex h-[1.7em] min-w-[10ch] items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[wordIndex]}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="inline-flex items-center whitespace-nowrap rounded-[3px] bg-[#FFE066] px-1.5 font-medium text-[#14161F]"
                >
                  {words[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span>— back in seconds.</span>
          </div>

          {/* subhead */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="relative z-10 mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-[#4A4D57] md:text-lg"
          >
            Upload a contract, a research paper, or a 300-page manual. Ask it
            questions the way you&apos;d ask a colleague, and get answers with
            the page they came from.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              className="h-12 rounded-md bg-[#14161F] px-7 text-[15px] font-medium text-[#FAFAF7] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4F46E5]"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Get started <MoveRight size={18} />
              </Link>
            </Button>
            <button className="flex h-12 items-center gap-1.5 px-2 text-[15px] font-medium text-[#14161F] transition-colors hover:text-[#4F46E5]">
              See how it works <MoveRight size={16} />
            </button>
          </motion.div>

          {/* hero mock — document turning into chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="relative z-10 mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-[#E4E2DC] bg-[#F5F3EE] p-3 shadow-[0_20px_60px_-25px_rgba(20,22,31,0.35)] md:p-4"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* document pane */}
              <div className="rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] p-5">
                <div className="mb-4 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E4E2DC]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E4E2DC]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E4E2DC]" />
                  <span className="ml-2 [font-family:var(--font-mono)] text-[11px] uppercase tracking-wide text-[#8A8D97]">
                    lease-agreement.pdf
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="h-2 w-[92%] rounded-full bg-[#E4E2DC]" />
                  <div className="h-2 w-[78%] rounded-full bg-[#E4E2DC]" />
                  <div className="h-2 w-[85%] rounded-full bg-[#FFE066]" />
                  <div className="h-2 w-[60%] rounded-full bg-[#E4E2DC]" />
                  <div className="h-2 w-[88%] rounded-full bg-[#E4E2DC]" />
                  <div className="h-2 w-[70%] rounded-full bg-[#E4E2DC]" />
                </div>
              </div>

              {/* chat pane */}
              <div className="flex flex-col justify-center rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] p-5">
                <div className="space-y-3">
                  <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[#14161F] px-3.5 py-2 text-[13px] text-[#FAFAF7]">
                    What&apos;s the early termination fee?
                  </div>
                  <div className="max-w-[92%] rounded-lg rounded-tl-sm border border-[#E4E2DC] bg-white px-3.5 py-2.5 text-[13px] text-[#14161F]">
                    Two months&apos; rent, due within 15 days of notice.
                    <span className="ml-1.5 inline-block rounded-[3px] bg-[#FFE066] px-1 [font-family:var(--font-mono)] text-[10px] font-medium">
                      p. 12
                    </span>
                    <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-[#4F46E5] align-middle" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* features */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="w-full border-t border-[#E4E2DC]"
        >
          <div className="mx-auto my-20 max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <span className="[font-family:var(--font-mono)] text-xs font-medium uppercase tracking-[0.14em] text-[#4F46E5]">
                What you get
              </span>
              <h2 className="mt-3 text-3xl font-medium text-[#14161F] [font-family:var(--font-display)] sm:text-4xl">
                Everything you need to read less and know more.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                  className="group rounded-xl border border-[#E4E2DC] bg-[#FAFAF7] p-6 transition-shadow hover:shadow-[0_12px_32px_-20px_rgba(20,22,31,0.4)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#14161F] transition-colors group-hover:bg-[#4F46E5]">
                    <feature.icon className="h-5 w-5 text-[#FFE066]" aria-hidden="true" />
                  </div>
                  <p className="mt-4 [font-family:var(--font-display)] text-lg font-medium text-[#14161F]">
                    {feature.name}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4A4D57]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-[#E4E2DC] bg-[#FAFAF7]/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#14161F]">
          <span className="h-2.5 w-2 border-l-0 border border-[#FFE066]" />
        </span>
        <span className="[font-family:var(--font-mono)] text-[13px] font-medium uppercase tracking-[0.14em] text-[#14161F]">
          Chat with PDF
        </span>
      </div>
      <div className="flex items-center gap-3">
        
            <Show when="signed-in">
              <UserButton />
            </Show>
           <button className="text-sm font-medium text-[#4A4D57] transition-colors hover:text-[#14161F]">
          <Link href="https://immense-bream-87.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F">
            Sign in
          </Link>
        </button>
        <Button
          
          className="rounded-md bg-[#14161F] px-5 py-2 text-sm font-medium text-[#FAFAF7] transition-colors hover:bg-[#4F46E5]"
        >
          <Link href="/dashboard">Get started</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Hero;