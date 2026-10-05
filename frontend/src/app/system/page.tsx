"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Brand } from "@/components/brand";
import {
  ActionLink,
  Button,
  LoadingState,
  Notice,
  Panel,
} from "@/components/ui";
export default function System() {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  async function check() {
    setState("loading");
    try {
      await api("/health");
      setState("ready");
    } catch {
      setState("error");
    }
  }
  useEffect(() => {
    void check();
  }, []);
  return (
    <>
      <header className="public-nav">
        <Brand />
        <ActionLink href="/">Website</ActionLink>
      </header>
      <main id="main" className="center-state">
        <Panel>
          <p className="eyebrow">PLATFORM STATUS</p>
          <h1>System connection</h1>
          {state === "loading" ? (
            <LoadingState label="Checking connection" />
          ) : state === "ready" ? (
            <Notice>The API and database are responding.</Notice>
          ) : (
            <Notice error>The platform is temporarily unavailable.</Notice>
          )}
          <Button onClick={() => void check()} loading={state === "loading"}>
            Check again
          </Button>
        </Panel>
      </main>
    </>
  );
}
