"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const LABEL =
  "text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase";
const FIELD =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] text-ink shadow-[0_1px_2px_rgba(11,11,15,0.04)] outline-none transition-colors placeholder:text-ink/35 focus:border-naano-blue";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    // Auth is stubbed, so this deliberately goes nowhere yet.
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div>
        <label htmlFor="email" className={LABEL}>
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="john@company.com"
          className={`mt-2 ${FIELD}`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className={LABEL}>
            Password
          </label>
          <Link
            href="#"
            className="text-[0.8125rem] font-medium text-naano-blue"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative mt-2">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${FIELD} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-ink/40 transition-colors hover:text-ink/70"
          >
            {showPassword ? (
              <EyeOff className="size-4.5" />
            ) : (
              <Eye className="size-4.5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-naano-blue py-3.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-naano-blue/90"
      >
        Sign in
      </button>
    </form>
  );
}
