"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  BriefcaseBusiness,
  Check,
  Database,
  Images,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Newspaper,
  Users,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Button, LoadingState, Notice, Panel } from "@/components/ui";

type Overview = {
  users: number;
  administrators: number;
  database: string;
  environment: string;
  content: Record<string, number>;
  enquiries: number;
  new_enquiries: number;
  recent_enquiries: {
    reference: string;
    name: string;
    project_type: string | null;
    status: string;
    created_at: string;
  }[];
};

const contentCards = [
  { label: "Published services", key: "services", Icon: Layers3 },
  { label: "Portfolio projects", key: "portfolio", Icon: BriefcaseBusiness },
  { label: "Managed clients", key: "clients", Icon: Building2 },
  { label: "Published articles", key: "blog", Icon: Newspaper },
  { label: "Media assets", key: "media", Icon: Images },
  { label: "New enquiries", key: "new_enquiries", Icon: MessageSquare },
];

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      setData((await api<{ data: Overview }>("/admin/overview")).data);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) await refresh();
      else setError("Unable to load workspace data.");
    }
  }, [refresh]);
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR DIGITAL COMMAND CENTER</p>
          <h1>
            Welcome, {user?.name.split(" ")[0]}
            <span className="cyan">.</span>
          </h1>
          <p className="muted">
            A live view of your content and conversations.
          </p>
        </div>
        {(user?.permissions.includes("*") ||
          user?.permissions.includes("menus.view")) && (
          <Link href="/admin/menus" className="button secondary">
            Header & menus <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
      {error ? (
        <Notice error>
          {error} <Button onClick={() => void load()}>Retry</Button>
        </Notice>
      ) : !data ? (
        <LoadingState label="Loading your workspace" />
      ) : (
        <>
          <div className="stats-grid">
            <Panel>
              <Users className="stat-icon" />
              <span className="stat-label">Workspace users</span>
              <strong className="stat-value">
                {data.users.toLocaleString()}
              </strong>
              <small>Accounts with workspace access</small>
            </Panel>
            <Panel>
              <LockKeyhole className="stat-icon" />
              <span className="stat-label">Administrators</span>
              <strong className="stat-value">
                {data.administrators.toLocaleString()}
              </strong>
              <small>Full workspace access</small>
            </Panel>
            <Panel>
              <Database className="stat-icon" />
              <span className="stat-label">Database connection</span>
              <strong className="stat-value text-stat">Connected</strong>
              <small>
                {data.database} / {data.environment}
              </small>
            </Panel>
          </div>
          <div className="cms-stats-grid">
            {contentCards.map(({ label, key, Icon }) => {
              const value =
                key === "new_enquiries"
                  ? data.new_enquiries
                  : (data.content[key] ?? 0);
              return (
                <Panel key={key} className="cms-stat">
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{value.toLocaleString()}</strong>
                </Panel>
              );
            })}
          </div>
          <Panel className="recent-enquiries">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">INCOMING PROJECTS</p>
                <h2>Recent enquiries</h2>
              </div>
              <span className="phase-badge">
                {data.enquiries.toLocaleString()} total
              </span>
            </div>
            {data.recent_enquiries.length === 0 ? (
              <p className="muted">No project enquiries have arrived yet.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Contact</th>
                      <th>Project</th>
                      <th>Received</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_enquiries.map((item) => (
                      <tr key={item.reference}>
                        <td>{item.reference}</td>
                        <td>{item.name}</td>
                        <td>{item.project_type ?? "—"}</td>
                        <td>
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={"status-pill " + item.status}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
          <Panel className="next-phase">
            <div>
              <span className="eyebrow">
                CONTENT / CONNECTED TO YOUR WEBSITE
              </span>
              <h2>One source for your stories.</h2>
              <p className="muted">
                Published content is available through the public website API.
              </p>
            </div>
            <Check size={32} aria-hidden="true" />
            <ArrowUpRight
              className="dashboard-arrow"
              size={26}
              aria-hidden="true"
            />
          </Panel>
        </>
      )}
    </>
  );
}
