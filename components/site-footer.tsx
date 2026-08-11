import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-100 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <span className="block font-black tracking-tight text-stone-900">
            TestMyPrompt
          </span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-400">
            <Link href="/features" className="transition-colors hover:text-stone-700">
              Features
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-stone-700">
              Pricing
            </Link>
            <Link href="/docs" className="transition-colors hover:text-stone-700">
              Docs
            </Link>
            <Link href="/contact" className="transition-colors hover:text-stone-700">
              Contact
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-stone-700">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-stone-700">
              Terms
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm text-stone-400 md:items-end">
          <a
            href="https://www.producthunt.com/products/testmyprompt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-testmyprompt"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View TestMyPrompt on Product Hunt"
            className="transition-opacity hover:opacity-90"
          >
            <Image
              alt="TestMyPrompt - Find vulnerabilities in your AI prompts before your users do | Product Hunt"
              width="250"
              height="54"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1220182&theme=light&t=1786437993796"
            />
          </a>
          <p>&copy; {new Date().getFullYear()} TestMyPrompt</p>
        </div>
      </div>
    </footer>
  );
}