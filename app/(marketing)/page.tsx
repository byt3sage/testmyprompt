import Link from "next/link";

const VULN_CATEGORIES = [
  // Security
  "Prompt Injection", "Policy Bypass", "Data Exfiltration", "Social Engineering",
  "Indirect Prompt Risk", "Tooling Permissions", "Insecure Output", "Training Manipulation",
  // Safety & Ethics
  "Political Bias", "Gender Bias", "Racial Bias", "Religious Bias",
  "Age Bias", "Stereotyping", "Toxicity", "Harmful Advice",
  // Quality
  "Hallucination Risk", "Factual Consistency", "Instruction Following",
  "Response Consistency", "Refusal Behaviour", "Formatting Compliance",
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Results in seconds",
    body: "Paste any system prompt and get a 0–100 risk score with categorised findings before you ship.",
  },
  {
    icon: "🔍",
    title: "22 test categories",
    body: "Comprehensive checks across security, safety & ethics, and quality — covering injection, bias, toxicity, and hallucination risk.",
  },
  {
    icon: "🛠",
    title: "Actionable fixes",
    body: "Every finding includes a plain-English explanation and a concrete remediation step, not just a flag.",
  },
  {
    icon: "👥",
    title: "Team workspaces",
    body: "Organise tests by product, model, or environment. Assign owner, admin, and member roles per workspace.",
  },
  {
    icon: "📋",
    title: "Full test history",
    body: "Every scan is stored. Review how a prompt's risk profile changed as you iterated.",
  },
  {
    icon: "🔌",
    title: "API access (coming soon)",
    body: "Integrate directly into your CI/CD pipeline. Fail deployments when a prompt exceeds your risk threshold.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Paste your prompt", body: "Drop in any system prompt — from a customer-facing chatbot to an internal agent." },
  { step: "02", title: "AI analyses the risk", body: "Our model scans for known attack vectors across 22 categories in real time." },
  { step: "03", title: "Score, fix, ship", body: "Get a clear 0–100 score, severity-graded findings, and remediation guidance." },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-stone-100 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(251,191,36,0.18),transparent)]" />
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                For chatbot &amp; LLM builders
              </span>
              <h1 className="mt-5 text-balance text-4xl font-black leading-[1.1] tracking-tight text-stone-900 md:text-5xl lg:text-6xl">
                Test your chatbot&apos;s prompts before your users do.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
                Automatically scan system prompts for injection vulnerabilities, policy bypass
                attempts, and data leakage risks. Ship safer AI products with confidence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-stone-800 transition-colors"
                >
                  Start trial →
                </Link>
                <Link
                  href="/features"
                  className="rounded-full border border-stone-200 px-6 py-3 font-semibold text-stone-700 hover:border-stone-300 transition-colors"
                >
                  See all features
                </Link>
              </div>
              <p className="mt-4 text-xs text-stone-400">
                No credit card required · Trial includes 2 prompt scans
              </p>
            </div>

            {/* Mockup score card */}
            <div className="relative rounded-2xl border border-stone-200 bg-stone-950 p-5 font-mono text-sm shadow-xl">
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-xs text-stone-500">prompt-test</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500">RISK SCORE</p>
                  <p className="text-4xl font-black text-amber-400">72</p>
                </div>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-400">
                  At Risk
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                Moderate risk. Improve guardrails before production use.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  { cat: "Prompt Injection", sev: "medium", color: "text-amber-400 border-amber-400/20 bg-amber-400/10" },
                  { cat: "Policy Bypass", sev: "medium", color: "text-amber-400 border-amber-400/20 bg-amber-400/10" },
                ].map((f) => (
                  <div key={f.cat} className="flex items-center justify-between rounded-lg bg-stone-900 px-3 py-2">
                    <span className="text-xs text-stone-300">{f.cat}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${f.color}`}>
                      {f.sev}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-stone-900 px-3 py-2">
                  <span className="text-xs text-stone-300">Data Exfiltration</span>
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400">
                    low
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-stone-800 bg-stone-900 p-3 text-xs text-stone-400">
                <span className="font-semibold text-stone-300">Fix: </span>
                Constrain instruction hierarchy and reject attempts to override system rules.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section className="border-b border-stone-100 bg-stone-50">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-stone-500">
            <span><strong className="text-stone-900">22</strong> test categories</span>
            <span className="hidden text-stone-200 sm:block">·</span>
            <span><strong className="text-stone-900">0–100</strong> risk score</span>
            <span className="hidden text-stone-200 sm:block">·</span>
            <span>Results in <strong className="text-stone-900">seconds</strong></span>
            <span className="hidden text-stone-200 sm:block">·</span>
            <span>Works with <strong className="text-stone-900">any LLM</strong></span>
          </div>
        </div>
      </section>

      {/* ── Vulnerability categories ─────────────────────────────────────────── */}
      <section className="border-b border-stone-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">What we test</p>
          <h2 className="mt-3 text-2xl font-black text-stone-900 md:text-3xl">
            Every attack surface your chatbot faces.
          </h2>
          <p className="mt-3 max-w-xl text-stone-600">
            Our AI evaluator checks prompts across security, safety, ethics, and quality dimensions so nothing slips through.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { label: "Security", color: "bg-red-50 border-red-200 text-red-700" },
              { label: "Safety & Ethics", color: "bg-amber-50 border-amber-200 text-amber-700" },
              { label: "Quality", color: "bg-blue-50 border-blue-200 text-blue-700" },
            ].map((g) => (
              <span key={g.label} className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${g.color}`}>
                {g.label}
              </span>
            ))}
            <span className="mt-1 w-full" />
            {VULN_CATEGORIES.map((cat) => (
              <span key={cat} className="rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-sm font-medium text-stone-700">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-stone-100 bg-stone-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Features</p>
          <h2 className="mt-3 text-2xl font-black text-stone-900 md:text-3xl">
            Everything your team needs to ship safe prompts.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-stone-200 bg-white p-6">
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="font-bold text-stone-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="border-b border-stone-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">How it works</p>
          <h2 className="mt-3 text-2xl font-black text-stone-900 md:text-3xl">
            From paste to passing in under a minute.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-stone-900">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{step.body}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <span className="mt-4 hidden text-stone-300 md:block">→</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── API / CI section ─────────────────────────────────────────────────── */}
      <section className="border-b border-stone-100 bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                Coming soon
              </span>
              <h2 className="mt-4 text-2xl font-black md:text-3xl">
                Shift prompt security left.<br />
                <span className="text-amber-400">Gate your CI/CD pipeline.</span>
              </h2>
              <p className="mt-4 text-stone-400 leading-relaxed">
                The TestMyPrompt API lets you run vulnerability scans as part of your deployment
                workflow. Fail builds automatically when a prompt exceeds your risk threshold.
                Perfect for MLOps teams and anyone building production-grade AI products.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-stone-400">
                {[
                  "Single API call per prompt test",
                  "Machine-readable JSON response with score + findings",
                  "Set a risk threshold — fail the build above it",
                  "Works with GitHub Actions, GitLab CI, Jenkins, and more",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-amber-400">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="mt-8 inline-flex rounded-full border border-stone-700 px-5 py-2.5 text-sm font-semibold text-stone-300 hover:border-stone-500 hover:text-white transition-colors"
              >
                Request early API access
              </Link>
            </div>

            {/* Code block */}
            <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 text-sm font-mono">
              <div className="flex items-center gap-1.5 border-b border-stone-800 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-stone-700" />
                <span className="ml-2 text-xs text-stone-500">ci-check.sh</span>
              </div>
              <div className="p-5 text-xs leading-relaxed">
                <p className="text-stone-500"># In your CI/CD pipeline</p>
                <p className="mt-2 text-stone-300">
                  <span className="text-amber-400">curl</span> -X POST \
                </p>
                <p className="pl-4 text-stone-300">
                  https://api.testmyprompt.net/v1/test \
                </p>
                <p className="pl-4 text-stone-300">
                  -H <span className="text-emerald-400">&quot;Authorization: Bearer $TMP_KEY&quot;</span> \
                </p>
                <p className="pl-4 text-stone-300">
                  -d <span className="text-emerald-400">&apos;&#123;&quot;prompt&quot;: &quot;...&quot;&#125;&apos;</span>
                </p>
                <div className="mt-5 rounded-lg border border-stone-800 bg-stone-950 p-3">
                  <p className="text-stone-500">{"// Response"}</p>
                  <p className="mt-1 text-stone-300">&#123;</p>
                  <p className="pl-4"><span className="text-sky-400">&quot;score&quot;</span><span className="text-stone-400">: </span><span className="text-amber-400">91</span>,</p>
                  <p className="pl-4"><span className="text-sky-400">&quot;level&quot;</span><span className="text-stone-400">: </span><span className="text-emerald-400">&quot;low-risk&quot;</span>,</p>
                  <p className="pl-4"><span className="text-sky-400">&quot;findings&quot;</span><span className="text-stone-400">: </span><span className="text-stone-300">[]</span></p>
                  <p className="text-stone-300">&#125;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────────────────── */}
      <section className="border-b border-stone-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Pricing</p>
          <h2 className="mt-3 text-2xl font-black text-stone-900 md:text-3xl">
            Start with a trial. Scale when you need to.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Trial",
                price: "$0",
                sub: "2 scans",
                cta: "Start trial",
                href: "/sign-up",
                highlight: false,
                features: ["2 prompt scans included", "2 team seats", "6 core test categories", "Test history"],
              },
              {
                name: "Pro",
                price: "$29",
                sub: "/ month",
                cta: "Start Pro",
                href: "/sign-up",
                highlight: true,
                features: ["20 tests / month", "10 team seats", "22 test categories", "Full test history", "Priority support"],
              },
              {
                name: "Business",
                price: "$99",
                sub: "/ month from",
                cta: "Contact us",
                href: "/contact",
                highlight: false,
                features: ["200 tests / month included", "25 team seats included", "22 test categories", "Custom tests & seats", "Dedicated support"],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-6 ${tier.highlight
                  ? "border-amber-300 bg-amber-50 shadow-md shadow-amber-100"
                  : "border-stone-200 bg-white"
                  }`}
              >
                {tier.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-900">
                    Most popular
                  </span>
                )}
                <h3 className="font-bold text-stone-900">{tier.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-black text-stone-900">{tier.price}</span>
                  <span className="ml-1 text-sm text-stone-500">{tier.sub}</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-stone-600">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-amber-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-6 block rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${tier.highlight
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : "border border-stone-200 text-stone-700 hover:border-stone-300"
                    }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-black md:text-4xl">
            Your chatbot is only as safe as its prompt.
          </h2>
          <p className="mt-4 text-lg text-stone-400">
            Join AI teams that test before they ship.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex rounded-full bg-amber-400 px-8 py-3.5 font-semibold text-stone-900 hover:bg-amber-300 transition-colors"
          >
            Start trial →
          </Link>
          <p className="mt-3 text-sm text-stone-600">No credit card required</p>
        </div>
      </section>
    </>
  );
}
