import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SEO_PROBLEM_PAGES, getAppUrl, getSeoProblemPage } from "@/lib/seo";

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

export function generateStaticParams(): Params[] {
  return SEO_PROBLEM_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoProblemPage(slug);
  if (!page) {
    return {
      title: "Solution Not Found",
    };
  }

  const url = `${getAppUrl()}/solutions/${page.slug}`;

  return {
    title: `${page.title} | TestMyPrompt`,
    description: page.description,
    keywords: [
      page.keyword,
      "prompt security",
      "LLM safety",
      "chatbot security testing",
      "prompt vulnerability testing",
    ],
    alternates: {
      canonical: `/solutions/${page.slug}`,
    },
    openGraph: {
      title: `${page.title} | TestMyPrompt`,
      description: page.description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | TestMyPrompt`,
      description: page.description,
    },
  };
}

export default async function SolutionProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoProblemPage(slug);
  if (!page) notFound();

  return (
    <main className="border-b border-stone-100 bg-white">
      <article className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{page.keyword}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 md:text-5xl">{page.title}</h1>
        <p className="mt-3 text-lg font-medium text-stone-700">{page.subtitle}</p>
        <p className="mt-6 text-base leading-relaxed text-stone-600">{page.intro}</p>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-black text-stone-900">Why this matters in production</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Teams rarely lose trust because of a single bad response. They lose trust when risky behavior repeats under pressure,
            at scale, and in front of real users. {page.title} is about turning unknown failure modes into measurable risks you can
            review before release.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Instead of relying on ad hoc manual reviews, use a repeatable scoring process so product, security, and engineering teams
            can align on what is acceptable, what must be fixed, and what should block deployment.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-xl font-black text-stone-900">Common failure patterns this catches</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            These are the patterns that most often create production incidents for AI assistants, copilots, and internal agents.
            Treat them as concrete test cases, not abstract guidance.
          </p>
          <ul className="mt-4 space-y-2">
            {page.problems.map((problem) => (
              <li key={problem} className="flex gap-2 text-sm leading-relaxed text-stone-700">
                <span className="mt-0.5 text-amber-600">•</span>
                <span>{problem}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-black text-stone-900">Example risky prompts</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            These examples are intentionally direct so teams can pressure-test prompt boundaries. If your current prompt accepts
            or partially follows requests like these, it likely needs stronger guardrails.
          </p>
          <div className="mt-4 grid gap-3">
            {page.examples.map((example) => (
              <pre
                key={example}
                className="overflow-auto rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs leading-relaxed text-stone-600"
              >
                {example}
              </pre>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-black text-stone-900">How TestMyPrompt helps</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Run these checks before launch, and rerun them as prompts evolve. Every report combines severity, explanation,
            and remediation so your team can act quickly instead of debating interpretation.
          </p>
          <ul className="mt-4 space-y-2">
            {page.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-2 text-sm leading-relaxed text-stone-700">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-xl font-black text-stone-900">Practical implementation checklist</h2>
          <ol className="mt-4 space-y-2 text-sm leading-relaxed text-stone-700">
            <li>1. Define a release threshold for acceptable prompt risk scores by environment.</li>
            <li>2. Test known adversarial prompts and edge cases before every production rollout.</li>
            <li>3. Treat high-severity findings as blockers until remediation is verified.</li>
            <li>4. Track prompt changes over time so risk drift is visible to the whole team.</li>
            <li>5. Export reports for security, compliance, and stakeholder review.</li>
          </ol>
        </section>

        <section className="mt-10 rounded-2xl border border-stone-900 bg-stone-900 p-8 text-white">
          <h2 className="text-2xl font-black">Run your first scan in minutes</h2>
          <p className="mt-2 text-stone-300">
            Start with 2 free trial scans and get a score, findings, and remediation guidance for your prompt.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-amber-300"
            >
              Start trial
            </Link>
            <Link
              href="/features"
              className="rounded-full border border-stone-700 px-6 py-2.5 text-sm font-semibold text-stone-200 transition-colors hover:border-stone-500"
            >
              See all checks
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
