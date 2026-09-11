"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/app/actions/auth";
import { PasswordField, SubmitButton, TextField } from "@/components/auth/field";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {errors.form && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-[0.875rem] text-red-700">
          {errors.form}
        </p>
      )}

      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="john@company.com"
        defaultValue={values.email}
        error={errors.email}
      />

      <PasswordField
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password}
        action={
          <Link href="#" className="text-[0.8125rem] font-medium text-naano-blue">
            Forgot password?
          </Link>
        }
      />

      <SubmitButton pending={pending}>Sign in</SubmitButton>
    </form>
  );
}
