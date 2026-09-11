"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "For companies", href: "#companies" },
  { label: "For creators", href: "#creators" },
  { label: "For agencies", href: "#agencies" },
  { label: "How it works", href: "#how-it-works" },
];

const RESOURCES = [
  { label: "Blog", href: "#blog" },
  { label: "Free Tools", href: "#tools" },
  { label: "Case study: BlogSEO", href: "#case-study" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Naano home">
          <NaanoLogo />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-ink/80 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setResourcesOpen((open) => !open)}
              aria-expanded={resourcesOpen}
              className="flex items-center gap-1 text-sm text-ink/80 transition-colors hover:text-ink"
            >
              Resources
              <ChevronDown
                className={`size-3.5 transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              hidden={!resourcesOpen}
              className="absolute right-0 top-full w-56 pt-3"
            >
              <div className="rounded-2xl bg-white p-2 shadow-[0_16px_50px_-12px_rgba(11,11,15,0.25)] ring-1 ring-black/5">
                {RESOURCES.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block rounded-xl px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-neutral-50 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-1 px-2 text-sm text-ink/70 transition-colors hover:text-ink sm:flex"
          >
            <Globe className="size-4" />
            EN
          </button>
          <Button render={<Link href="/signin" />}
            variant="secondary"
            className="hidden rounded-full bg-white px-5 text-ink shadow-sm hover:bg-white/90 sm:inline-flex">Sign in</Button>
          <Button render={<Link href="/signup" />}
            className="rounded-full bg-ink px-5 text-white hover:bg-ink/90">Sign up</Button>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="ml-1 rounded-full p-2 text-ink lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <div hidden={!mobileOpen} className="px-4 pb-4 lg:hidden">
        <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5">
          {[...NAV_LINKS, ...RESOURCES].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-ink/80 hover:bg-neutral-50"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/signin"
            className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
