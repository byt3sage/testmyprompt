import Link from "next/link";

import { SignInForm } from "@/components/auth-forms";

export default function SignInPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="text-3xl font-black tracking-tight text-stone-900">Welcome back</h1>
      <p className="mt-2 text-stone-600">Sign in to run prompt vulnerability tests.</p>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <SignInForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        Need an account? <Link href="/sign-up" className="font-semibold text-stone-900">Create one</Link>
      </p>
    </main>
  );
}
