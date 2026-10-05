"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Code2,
  Factory,
  FileText,
  Gauge,
  Images,
  ListTree,
  MessageSquareQuote,
  Newspaper,
  PanelsTopLeft,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
  Layers3,
  Tags,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { Brand } from "./brand";
import { Button, LoadingState, Notice } from "./ui";
import type { LucideIcon } from "lucide-react";

const sections: {
  title: string;
  items: {
    href: string;
    label: string;
    permission: string;
    icon: LucideIcon;
  }[];
}[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        permission: "dashboard.view",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/menus",
        label: "Header & menus",
        permission: "menus.view",
        icon: ListTree,
      },
      {
        href: "/admin/activity",
        label: "Activity",
        permission: "dashboard.view",
        icon: Gauge,
      },
    ],
  },
  {
    title: "CONTENT",
    items: [
      {
        href: "/admin/services",
        label: "Services",
        permission: "services.view",
        icon: Layers3,
      },
      {
        href: "/admin/solutions",
        label: "Solutions",
        permission: "solutions.view",
        icon: PanelsTopLeft,
      },
      {
        href: "/admin/portfolio",
        label: "Portfolio",
        permission: "portfolio.view",
        icon: BriefcaseBusiness,
      },
      {
        href: "/admin/clients",
        label: "Clients",
        permission: "clients.view",
        icon: Building2,
      },
      {
        href: "/admin/testimonials",
        label: "Testimonials",
        permission: "testimonials.view",
        icon: MessageSquareQuote,
      },
      {
        href: "/admin/team",
        label: "Team",
        permission: "team.view",
        icon: UsersRound,
      },
      {
        href: "/admin/technologies",
        label: "Technologies",
        permission: "technologies.view",
        icon: Code2,
      },
      {
        href: "/admin/industries",
        label: "Industries",
        permission: "industries.view",
        icon: Factory,
      },
      {
        href: "/admin/blog",
        label: "Blog",
        permission: "blog.view",
        icon: Newspaper,
      },
      {
        href: "/admin/blog-taxonomies",
        label: "Blog categories & tags",
        permission: "blog.view",
        icon: Tags,
      },
      {
        href: "/admin/pages",
        label: "Pages",
        permission: "pages.view",
        icon: FileText,
      },
      {
        href: "/admin/media",
        label: "Media library",
        permission: "media.view",
        icon: Images,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        href: "/admin/enquiries",
        label: "Enquiries",
        permission: "enquiries.view",
        icon: MessageSquareQuote,
      },
    ],
  },
  {
    title: "CONTROL",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        permission: "users.view",
        icon: UsersRound,
      },
      {
        href: "/admin/roles",
        label: "Roles & permissions",
        permission: "roles.view",
        icon: ShieldCheck,
      },
      {
        href: "/admin/settings/site",
        label: "Site settings",
        permission: "settings.view",
        icon: Settings2,
      },
      {
        href: "/admin/settings/seo",
        label: "SEO settings",
        permission: "seo.view",
        icon: Search,
      },
      {
        href: "/admin/settings/contact",
        label: "Contact settings",
        permission: "settings.view",
        icon: MessageSquareQuote,
      },
      {
        href: "/admin/settings/social",
        label: "Social links",
        permission: "settings.view",
        icon: ArrowUpRight,
      },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, error, refresh, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!loading && !error && !user) router.replace("/login");
  }, [loading, error, user, router]);
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  async function signOut() {
    setBusy(true);
    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError("Unable to sign out. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <main id="main">
        <LoadingState />
      </main>
    );
  if (error)
    return (
      <main id="main" className="center-state">
        <Notice error>{error}</Notice>
        <Button onClick={() => void refresh()}>Retry connection</Button>
      </main>
    );
  if (!user)
    return (
      <main id="main">
        <LoadingState label="Opening sign in" />
      </main>
    );
  const can = (permission: string) =>
    user.permissions.includes("*") || user.permissions.includes(permission);
  const allowedSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => can(item.permission)),
    }))
    .filter((section) => section.items.length > 0);
  if (!can("dashboard.view") && allowedSections.length === 0)
    return (
      <main id="main" className="center-state">
        <h1>Access restricted</h1>
        <p>This account does not have workspace access.</p>
        {logoutError && <Notice error>{logoutError}</Notice>}
        <Button onClick={signOut} loading={busy}>
          Sign out
        </Button>
      </main>
    );
  return (
    <div className="admin-app">
      <aside
        className={`admin-sidebar ${open ? "is-open" : ""}`}
        id="admin-navigation"
      >
        <Brand />
        <p className="sidebar-label">WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {allowedSections.flatMap((section) => [
            <span
              className="sidebar-label nav-section-label"
              key={section.title}
            >
              {section.title}
            </span>,
            ...section.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path === href || path.startsWith(href + "/")
                    ? "page"
                    : undefined
                }
              >
                <Icon size={17} />
                {label}
              </Link>
            )),
          ])}
        </nav>
        <div className="sidebar-bottom">
          <span className="phase-badge">CMS / ADMIN</span>
          <p>Manage the LogicSphere workspace.</p>
          <Link href="/">
            View website <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <button
            className="icon-button mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="admin-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X /> : <Menu />}
          </button>
          <span className="breadcrumb">
            Workspace <span>/</span>{" "}
            {path === "/admin" ? "Overview" : "Design system"}
          </span>
          <div className="admin-user">
            <span className="avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="user-name">
              {user.name}
              <small>{user.role}</small>
            </span>
            <button
              onClick={signOut}
              disabled={busy}
              className="icon-button"
              aria-label="Sign out"
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main id="main" className="admin-content">
          {logoutError && <Notice error>{logoutError}</Notice>}
          {children}
        </main>
        <footer className="admin-footer">
          LogicSphere Inc <span>Content workspace / v0.2</span>
        </footer>
      </div>
    </div>
  );
}
