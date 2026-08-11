import type { Metadata } from "next";
import Link from "next/link";

import { SEO_PROBLEM_PAGES, getAppUrl } from "@/lib/seo";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "AI Prompt Security Solutions by Problem",
  description:
    "Explore problem-focused pages for prompt injection, jailbreak detection, hallucination risk, data leakage, bias, and LLM red teaming.",
  alternates: {
    canonical: "/solutions",
  },
  openGraph: {
    title: "AI Prompt Security Solutions by Problem",
    description:
      "Problem-focused SEO pages for teams hardening chatbot and LLM prompts before production.",
    type: "website",
    url: `${appUrl}/solutions`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Security Solutions by Problem",
    description:
      "Problem-focused pages covering injection, jailbreaks, hallucinations, and prompt safety audits.",
  },
};

export default function SolutionsIndexPage() {
  return (
    <main className="border-b border-stone-100 bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Solutions</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">
          Prompt Security Solutions for Production AI Teams
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-600">
          Practical guides to reduce prompt injection, jailbreak, data leakage, hallucination, and bias risks before they impact users.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {SEO_PROBLEM_PAGES.map((page) => (
            <article key={page.slug} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{page.keyword}</p>
              <h2 className="mt-2 text-xl font-black text-stone-900">{page.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{page.description}</p>
              <Link
                href={`/solutions/${page.slug}`}
                className="mt-4 inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 transition-colors hover:border-stone-400 hover:bg-white"
              >
                Read guide →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
