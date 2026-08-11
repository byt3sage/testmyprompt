import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions – TestMyPrompt",
  description: "Terms and Conditions for TestMyPrompt, operated by LE Digital LTD.",
};

const EFFECTIVE_DATE = "11 August 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-black tracking-tight text-stone-900">Terms and Conditions</h1>
      <p className="mt-3 text-sm text-stone-500">Effective date: {EFFECTIVE_DATE}</p>

      <div className="mt-10 space-y-10 text-stone-700">
        <section>
          <h2 className="text-2xl font-bold text-stone-900">1. About these terms</h2>
          <p className="mt-3">
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of
            TestMyPrompt, a service operated by <strong>LE Digital LTD</strong>, a company registered
            in England and Wales (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
          </p>
          <p className="mt-3">
            By creating an account or using any part of the service you agree to be bound by these
            Terms. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">2. The service</h2>
          <p className="mt-3">
            TestMyPrompt provides automated analysis of AI system prompts to identify potential
            security, safety, and quality risks. Results are informational and do not constitute
            professional security advice.
          </p>
          <p className="mt-3">
            We reserve the right to modify, suspend, or discontinue any part of the service at any
            time, with reasonable notice where practicable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">3. Accounts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>You must be at least 18 years old to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your credentials.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>You must notify us immediately of any unauthorised use of your account.</li>
            <li>One person may not maintain more than one free-tier account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">4. Acceptable use</h2>
          <p className="mt-3">You agree not to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Use the service for any unlawful purpose or in violation of any applicable regulation.</li>
            <li>Submit prompts designed to produce illegal, harmful, or harassing content.</li>
            <li>Attempt to reverse-engineer, scrape, or extract our scoring models or proprietary data.</li>
            <li>Circumvent usage limits or quotas through automation, multiple accounts, or other means.</li>
            <li>Introduce malware, denial-of-service attacks, or other harmful code.</li>
            <li>Resell, sublicense, or offer the service as a white-labelled product without written consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">5. Intellectual property</h2>
          <p className="mt-3">
            All software, design, branding, and content on TestMyPrompt is the intellectual property of
            LE Digital LTD unless otherwise stated. Nothing in these Terms grants you ownership of or
            a licence to our intellectual property beyond the right to use the service as described.
          </p>
          <p className="mt-3">
            You retain ownership of any prompt content you submit. You grant us a limited licence to
            process that content solely for the purpose of providing the service to you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">6. Billing and subscriptions</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Paid plans are billed in advance on a monthly or annual basis.</li>
            <li>
              All payments are processed by Stripe. By subscribing you agree to Stripe&rsquo;s terms of
              service.
            </li>
            <li>
              Prices are shown exclusive of any applicable taxes. UK VAT will be added where required.
            </li>
            <li>
              You may cancel your subscription at any time via the billing portal. You will retain
              access until the end of the current billing period. No partial refunds are issued for
              unused time unless required by law.
            </li>
            <li>
              We reserve the right to change pricing with 30 days&rsquo; notice. Continued use after the
              notice period constitutes acceptance of the new price.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">7. Disclaimer of warranties</h2>
          <p className="mt-3">
            The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranty of any kind,
            express or implied, including fitness for a particular purpose or non-infringement.
            We do not warrant that the service will be uninterrupted, error-free, or that any
            findings will be complete or accurate.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">8. Limitation of liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by law, LE Digital LTD shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, including loss of
            profits, data, or goodwill, arising out of your use of or inability to use the service.
          </p>
          <p className="mt-3">
            Our total aggregate liability to you in any 12-month period shall not exceed the greater
            of (a) the amount you paid us in that period or (b) £100.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">9. Indemnification</h2>
          <p className="mt-3">
            You agree to indemnify and hold harmless LE Digital LTD and its officers, directors, and
            employees from any claims, damages, or expenses (including reasonable legal fees) arising
            from your use of the service, your violation of these Terms, or your violation of any
            third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">10. Termination</h2>
          <p className="mt-3">
            We may suspend or terminate your account immediately if you breach these Terms or if
            required by law, without liability to you. You may close your account at any time from
            your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">11. Governing law</h2>
          <p className="mt-3">
            These Terms are governed by the laws of England and Wales. Any disputes shall be subject
            to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">12. Changes to these terms</h2>
          <p className="mt-3">
            We may update these Terms from time to time. Material changes will be communicated by
            email or a notice on the service at least 14 days before they take effect. Continued use
            after the effective date constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900">13. Contact</h2>
          <p className="mt-3">
            For questions about these Terms, contact us at{" "}
            <a
              href="mailto:jae@testmyprompt.net"
              className="text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              jae@testmyprompt.net
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
