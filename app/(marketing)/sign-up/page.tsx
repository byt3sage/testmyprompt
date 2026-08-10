import Link from "next/link";

import { SignUpForm } from "@/components/auth-forms";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="text-3xl font-black tracking-tight text-stone-900">Create your account</h1>
      <p className="mt-2 text-stone-600">Start with a 2-scan trial and upgrade when needed.</p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <SignUpForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        Already have an account? <Link href="/sign-in" className="font-semibold text-stone-900">Sign in</Link>
      </p>
    </main>
  );
}
