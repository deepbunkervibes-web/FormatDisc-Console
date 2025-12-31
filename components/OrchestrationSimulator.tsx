import React, { useEffect, useMemo, useState } from "react";
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import { Simulator } from "../state/simulator";

export function OrchestrationSimulator() { // Renamed to OrchestrationSimulator
  // seed derived from url or fixed to reproduce runs
  const url = new URL(window.location.href);
  const seed = url.searchParams.has("seed") ? Number(url.searchParams.get("seed")) : undefined;

  const sim = useMemo(() => new Simulator({ seed }), [seed]);

  const [cpVisible, setCpVisible] = useState(false);
  const [status, setStatus] = useState<"Online" | "Executing" | "Degraded">("Online");

  // simple status derivation from messages
  useEffect(() => {
    const t = setInterval(() => {
      const ms = sim.getMessages();
      const executing = ms.some((m) => m.status === "executing");
      const hasErrors = ms.some((m) => m.status === "error");
      setStatus(executing ? "Executing" : hasErrors ? "Degraded" : "Online");
    }, 300);
    return () => clearInterval(t);
  }, [sim]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCpVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleCommand = (cmd: string) => {
    setCpVisible(false);
    if (cmd === "clear") sim.clear();
    if (cmd === "inject") sim.pushSystem("Injected system message via palette");
    if (cmd === "chaos") sim.toggleChaosMode();
  };

  return (
    <div className="simulator-app"> {/* Apply simulator-app class here */}
      <Sidebar
        sessionId={sim.getSessionId()}
        status={status}
        onClear={() => sim.clear()}
        onInjectError={() => sim.injectError()}
        onLong={() => sim.simulateLongRunning()}
      />
      <Chat sim={sim} />
      <CommandPalette visible={cpVisible} onClose={() => setCpVisible(false)} onCommand={handleCommand} />
    </div>
  );
}
