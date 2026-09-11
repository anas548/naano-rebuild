"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const LABEL =
  "text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase";
export const FIELD =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] text-ink shadow-[0_1px_2px_rgba(11,11,15,0.04)] outline-none transition-colors placeholder:text-ink/35 focus:border-naano-blue";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[0.8125rem] text-red-600">{message}</p>;
}

export function TextField({
  name,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={LABEL}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        className={`mt-2 ${FIELD} ${error ? "border-red-400" : ""}`}
        {...props}
      />
      <FieldError message={error} />
    </div>
  );
}

export function PasswordField({
  name = "password",
  label = "Password",
  error,
  action,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  name?: string;
  label?: string;
  error?: string;
  action?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className={LABEL}>
          {label}
        </label>
        {action}
      </div>
      <div className="relative mt-2">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          className={`${FIELD} pr-12 ${error ? "border-red-400" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-ink/40 transition-colors hover:text-ink/70"
        >
          {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-naano-blue py-3.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-naano-blue/90 disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}
