"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import posthog from "posthog-js";

export function SiteHeader() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-stone-900">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1L2 4v4c0 3.3 2.5 6.4 6 7 3.5-.6 6-3.7 6-7V4L8 1z" fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M5.5 8.5l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-stone-900">TestMyPrompt</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-stone-500">
          <Link href="/features" className="hover:text-stone-900 transition-colors">Features</Link>
          <Link href="/pricing"  className="hover:text-stone-900 transition-colors">Pricing</Link>
          <Link href="/docs"     className="hover:text-stone-900 transition-colors">Docs</Link>

          <div className="ml-2 flex items-center gap-2">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    posthog.capture("user_signed_out");
                    posthog.reset();
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="rounded-full border border-stone-200 px-4 py-1.5 text-sm font-semibold text-stone-700 hover:border-stone-300 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="rounded-full border border-stone-200 px-4 py-1.5 text-sm font-semibold text-stone-700 hover:border-stone-300 transition-colors">
                  Sign in
                </Link>
                <Link href="/sign-up" className="rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-stone-900 hover:bg-amber-300 transition-colors">
                  Start trial
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
