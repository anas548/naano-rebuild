import { cn } from "@/lib/utils";

export function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 9.6H4.8V19h2.3V9.6ZM5.95 8.6a1.35 1.35 0 1 0 0-2.7 1.35 1.35 0 0 0 0 2.7ZM19.2 19h-2.3v-4.9c0-1.2-.44-2-1.5-2-.82 0-1.3.55-1.51 1.08-.08.19-.1.45-.1.72V19H11.5s.03-8.53 0-9.4h2.29v1.33c.3-.47.85-1.14 2.07-1.14 1.51 0 2.64.99 2.64 3.11V19Z"
      />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.9 10.5 21.3 2h-1.8l-6.4 7.4L8 2H2l7.8 11.3L2 22h1.8l6.8-7.9L16 22h6l-8.1-11.5Zm-2.4 2.8-.8-1.1L4.4 3.3h2.7l5 7.2.8 1.1 6.6 9.4h-2.7l-5.3-7.7Z"
      />
    </svg>
  );
}
