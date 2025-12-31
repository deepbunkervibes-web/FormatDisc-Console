import React from "react";

export default function Sidebar({
  sessionId,
  status,
  onClear,
  onInjectError,
  onLong
}: {
  sessionId: string;
  status: "Online" | "Executing" | "Degraded";
  onClear: () => void;
  onInjectError: () => void;
  onLong: () => void;
}) {
  return (
    <aside className="simulator-sidebar">
      <div style={{fontWeight:700}}>Orchestration — Simulator</div>
      <div className="simulator-small">Status: <strong>{status}</strong></div>
      <div className="simulator-small">Session: <code style={{color:"#9aa0a6"}}>{sessionId}</code></div>
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
        <button onClick={onClear}>Clear chat</button>
        <button onClick={onInjectError}>Simulate error</button>
        <button onClick={onLong}>Simulate long task</button>
      </div>
      <div style={{marginTop:"auto"}} className="simulator-small">Deterministic seed used — reproduce by keeping seed constant.</div>
    </aside>
  );
}
