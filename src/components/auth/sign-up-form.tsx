"use client";

import { useActionState, useState } from "react";
import { signUpAction } from "@/app/actions/auth";
import {
  LABEL,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/field";
import type { UserRole } from "@/generated/prisma/enums";

const HEARD_OPTIONS = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "WORD_OF_MOUTH", label: "Word of mouth" },
  { value: "GOOGLE_SEARCH", label: "Google search" },
  { value: "A_CREATOR", label: "A creator" },
  { value: "OTHER", label: "Other" },
];

export function SignUpForm({
  role,
  emailLabel,
}: {
  role: UserRole;
  emailLabel: string;
}) {
  const signUp = signUpAction.bind(null, role);
  const [state, formAction, pending] = useActionState(signUp, null);
  const [heard, setHeard] = useState<string>("");
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <TextField
          name="firstName"
          label="First name"
          autoComplete="given-name"
          defaultValue={values.firstName}
          error={errors.firstName}
        />
        <TextField
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          defaultValue={values.lastName}
          error={errors.lastName}
        />
      </div>

      <TextField
        name="email"
        label={emailLabel}
        type="email"
        autoComplete="email"
        placeholder="john@company.com"
        defaultValue={values.email}
        error={errors.email}
      />

      <PasswordField
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password}
      />

      {role === "BRAND" && (
        <div>
          <span className={LABEL}>How did you hear about us?</span>
          <input type="hidden" name="heardAboutUs" value={heard} />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {HEARD_OPTIONS.map((option) => {
              const selected = heard === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHeard(selected ? "" : option.value)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors ${
                    selected
                      ? "border-naano-blue bg-naano-blue text-white"
                      : "border-neutral-200 bg-white text-ink/70 hover:border-neutral-300"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SubmitButton pending={pending}>Continue</SubmitButton>
    </form>
  );
}
