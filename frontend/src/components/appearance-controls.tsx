"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Pause, Play } from "lucide-react";

export function AppearanceControls() {
  const [light, setLight] = useState(true);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    setLight(document.documentElement.dataset.theme === "light");
    setPaused(document.documentElement.dataset.motion === "paused");
  }, []);
  return (
    <div className="appearance-controls">
      <button
        type="button"
        className="appearance-button"
        aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
        onClick={() => {
          const theme = light ? "dark" : "light";
          document.documentElement.dataset.theme = theme;
          setLight(!light);
          try {
            localStorage.setItem("ls-theme", theme);
          } catch {
            /* Storage may be disabled. */
          }
        }}
      >
        {light ? <Moon size={17} /> : <Sun size={17} />}
      </button>
      <button
        type="button"
        className="appearance-button motion-button"
        aria-label={paused ? "Resume animations" : "Pause animations"}
        aria-pressed={paused}
        onClick={() => {
          const next = !paused;
          document.documentElement.dataset.motion = next ? "paused" : "running";
          setPaused(next);
          window.dispatchEvent(new Event("ls-motion"));
          try {
            localStorage.setItem("ls-motion", next ? "paused" : "running");
          } catch {
            /* Storage may be disabled. */
          }
        }}
      >
        {paused ? <Play size={15} /> : <Pause size={15} />}
      </button>
    </div>
  );
}
