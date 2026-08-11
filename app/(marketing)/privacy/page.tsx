import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – TestMyPrompt",
  description: "Privacy Policy for TestMyPrompt, operated by LE Digital LTD.",
};

const EFFECTIVE_DATE = "11 August 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-black tracking-tight text-stone-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-stone-500">Effective date: {EFFECTIVE_DATE}</p>

      <div className="mt-10 space-y-10 text-stone-700">
        <section>
          <h2 className="text-2xl font-bold text-stone-900">1. Who we are</h2>
          <p className="mt-3">
            TestMyPrompt is operated by <strong>LE Digital LTD</strong>, a company registered in England
            and Wales. References to &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo; in this
            policy refer to LE Digital LTD.
          </p>
          <p className="mt-3">
            If you have questions about this policy, contact us at{" "}
            <a href="mailto:jae@testmyprompt.net" className="text-stone-900 underline underline-offset-2 hover:text-stone-600">
              jae@testmyprompt.net
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">2. What data we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Account data</strong> — name, email address, and password hash when you register.
            </li>
            <li>
              <strong>Usage data</strong> — prompt texts you submit for testing, test results, and
              workspace activity.
            </li>
            <li>
              <strong>Billing data</strong> — payment method details are handled directly by Stripe;
              we only store a Stripe customer ID and subscription status.
            </li>
            <li>
              <strong>Technical data</strong> — IP address, browser type, referring URL, and page
              interaction data collected via server logs and analytics.
            </li>
            <li>
              <strong>Cookies</strong> — session cookies for authentication and, where consented,
              analytics cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">3. How we use your data</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To provide, operate, and improve the TestMyPrompt service.</li>
            <li>To authenticate you and manage your account and workspaces.</li>
            <li>To process payments and manage subscriptions via Stripe.</li>
            <li>To send transactional emails (e.g. account confirmation, billing receipts).</li>
            <li>To detect and prevent abuse, fraud, or security incidents.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> sell your personal data to third parties, and we do not use
            prompt content you submit to train external AI models.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">4. Legal basis (UK GDPR)</h2>
          <p className="mt-3">
            We process your personal data under the following lawful bases:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><strong>Contract</strong> — to fulfil our service agreement with you.</li>
            <li><strong>Legitimate interests</strong> — for security, fraud prevention, and service improvement.</li>
            <li><strong>Legal obligation</strong> — where required by applicable law.</li>
            <li><strong>Consent</strong> — for optional analytics cookies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">5. Data retention</h2>
          <p className="mt-3">
            We retain account and usage data for as long as your account is active. If you delete your
            account, we delete or anonymise your personal data within 30 days, except where retention
            is required by law (e.g. financial records kept for 6 years under UK law).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">6. Third-party services</h2>
          <p className="mt-3">We share data with the following sub-processors:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><strong>Stripe</strong> — payment processing.</li>
            <li><strong>Vercel</strong> — hosting and edge infrastructure.</li>
            <li><strong>OpenAI / AI providers</strong> — prompt analysis (prompt content is sent to the configured AI provider; refer to their privacy policy for how they handle API data).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">7. Your rights</h2>
          <p className="mt-3">Under UK GDPR you have the right to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request erasure (&ldquo;right to be forgotten&rdquo;).</li>
            <li>Object to or restrict certain processing.</li>
            <li>Data portability.</li>
            <li>Withdraw consent at any time where processing is based on consent.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email{" "}
            <a href="mailto:jae@testmyprompt.net" className="text-stone-900 underline underline-offset-2 hover:text-stone-600">
              jae@testmyprompt.net
            </a>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">8. Security</h2>
          <p className="mt-3">
            We implement industry-standard security measures including encryption in transit (TLS),
            hashed passwords, and access controls. No method of transmission over the internet is
            100% secure, however, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">9. Changes to this policy</h2>
          <p className="mt-3">
            We may update this policy from time to time. Material changes will be communicated by
            email or a notice on the site. Continued use of the service after the effective date
            constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">10. Complaints</h2>
          <p className="mt-3">
            If you believe we have not handled your data lawfully, you have the right to lodge a
            complaint with the{" "}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              Information Commissioner&rsquo;s Office (ICO)
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
