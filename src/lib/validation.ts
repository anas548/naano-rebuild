export type FormErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!input.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!input.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!EMAIL.test(input.email)) errors.email = "Enter a valid email address.";
  if (input.password.length < 8)
    errors.password = "Use at least 8 characters.";
  return errors;
}

export function validateSignIn(input: { email: string; password: string }) {
  const errors: FormErrors = {};
  if (!EMAIL.test(input.email)) errors.email = "Enter a valid email address.";
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}

/** Card slugs must be unique, so the random suffix matters. */
export function cardSlug(firstName: string, lastName: string) {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "creator"}-${Math.random().toString(36).slice(2, 8)}`;
}
