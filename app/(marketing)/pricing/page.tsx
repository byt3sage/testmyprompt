import Link from "next/link";

const TIERS = [
  {
    name: "Trial",
    price: "$0",
    sub: "2 scans",
    description: "Try TestMyPrompt with two full prompt scans before choosing a paid plan.",
    cta: "Start trial",
    href: "/sign-up",
    highlight: false,
    features: [
      "2 prompt scans included",
      "2 team seats",
      "6 core test categories",
      "AI-powered scoring",
      "Findings + remediation tips",
      "Suggested rewrite",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    sub: "/ month",
    description: "For startups running lightweight monthly prompt QA across their products.",
    cta: "Start Pro",
    href: "/sign-up",
    highlight: true,
    features: [
      "20 tests / month",
      "10 team seats",
      "22 test categories",
      "AI-powered scoring",
      "Findings + remediation tips",
      "Full test history",
      "API access",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: "$99",
    sub: "/ month from",
    description: "For teams that need full coverage with flexible test and seat allowances.",
    cta: "Contact us",
    href: "/contact",
    highlight: false,
    features: [
      "200 tests / month included",
      "25 team seats included",
      "22 test categories",
      "AI-powered scoring",
      "Full test history",
      "API access",
      "CI/CD integration",
      "Custom tests & team seats",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-stone-100 bg-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Pricing</p>
          <h1 className="mt-3 text-3xl font-black text-stone-900 md:text-5xl">
            Start with a quick trial, then scale.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
            Trial includes 6 core categories. Pro and Business unlock the full 22-category coverage.
            Try two prompt scans free, no credit card required.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="border-b border-stone-100 bg-stone-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-6 ${
                  tier.highlight
                    ? "border-amber-300 bg-amber-50 shadow-lg shadow-amber-100"
                    : "border-stone-200 bg-white"
                }`}
              >
                {tier.highlight && (
                  <span className="mb-3 inline-block self-start rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-900">
                    Most popular
                  </span>
                )}
                <h2 className="text-lg font-black text-stone-900">{tier.name}</h2>
                <div className="mt-2">
                  <span className="text-4xl font-black text-stone-900">{tier.price}</span>
                  <span className="ml-1 text-sm text-stone-500">{tier.sub}</span>
                </div>
                <p className="mt-2 text-sm text-stone-600">{tier.description}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-stone-600">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-amber-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-6 block rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
                    tier.highlight
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

      {/* FAQ / notes */}
      <section className="border-b border-stone-100 bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-xl font-black text-stone-900">Common questions</h2>
          <div className="mt-8 space-y-6">
            {[
              {
                q: "What counts as a test?",
                a: "One test = one prompt evaluation. Each POST to the test API (or dashboard scan) uses one credit from your monthly allowance.",
              },
              {
                q: "How does the trial work?",
                a: "You get 2 free prompt scans on the Trial tier. After that, upgrade to Pro or Business to continue testing.",
              },
              {
                q: "Do unused tests roll over?",
                a: "No. Monthly credits reset at the start of each billing period.",
              },
              {
                q: "Can I change plan mid-month?",
                a: "Yes. Upgrades take effect immediately. Your monthly limit updates to the new plan's allowance.",
              },
              {
                q: "Do you offer custom plans?",
                a: "Yes. Business plans can be customized for higher monthly tests and additional team seats based on your requirements.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold text-stone-900">{q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-black">Any questions? We&apos;re happy to help.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className="rounded-full bg-amber-400 px-7 py-3 font-semibold text-stone-900 hover:bg-amber-300 transition-colors">
              Start trial →
            </Link>
            <Link href="/contact" className="rounded-full border border-stone-700 px-7 py-3 font-semibold text-stone-300 hover:border-stone-500 transition-colors">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
