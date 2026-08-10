export default function DocsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-black tracking-tight text-stone-900">Docs</h1>
      <div className="mt-8 space-y-6 text-stone-700">
        <section>
          <h2 className="text-2xl font-bold text-stone-900">How scoring works</h2>
          <p className="mt-2">
            TestMyPrompt runs heuristic checks for prompt injection signals, data exfiltration intent,
            policy bypass language, and over-broad tool requests. Each rule contributes weighted
            penalties that map to a 0-100 safety score.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">Workspace model</h2>
          <p className="mt-2">
            Teams create workspaces and assign roles: Owner, Admin, Member. Every prompt test belongs to
            a workspace, enabling scoped history and quota controls.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">Billing model</h2>
          <p className="mt-2">
            Stripe checkout handles upgrades and Stripe customer portal handles subscription management.
            Webhooks synchronize plan tier and status back to your workspace records.
          </p>
        </section>
      </div>
    </main>
  );
}
