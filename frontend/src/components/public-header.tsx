"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { AppearanceControls } from "@/components/appearance-controls";
import type { PublicRecord } from "@/lib/public-content";
import { isSafeNavigationHref } from "@/lib/urls";

export function PublicHeader({ menu }: { menu: PublicRecord[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);
  const publishedLinks = menu
    .filter((item) => item.attributes.menu === "primary")
    .map((item) => ({
      label: String(item.attributes.label ?? item.title),
      href: String(item.attributes.url ?? "/"),
    }))
    .filter((item) => isSafeNavigationHref(item.href));
  const navLinks = publishedLinks;
  const mobileLinks = publishedLinks;
  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-header-inner">
        <Brand header />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              {...(href.startsWith("https://")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              aria-current={path === href ? "page" : undefined}
              className={path === href ? "active" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>
        <AppearanceControls />
        <Link className="button header-cta" href="/contact">
          Start a project <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className={`mobile-nav${open ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        inert={!open}
      >
        {mobileLinks.map(({ label, href }, i) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            {...(href.startsWith("https://")
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
            style={{ transitionDelay: open ? `${i * 35}ms` : "0ms" }}
          >
            <span>0{i + 1}</span> {label} <ArrowUpRight size={17} />
          </Link>
        ))}
      </nav>
    </header>
  );
}
