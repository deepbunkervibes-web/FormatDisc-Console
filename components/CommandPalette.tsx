import React, { useEffect, useState } from "react";

export default function CommandPalette({
  visible,
  onClose,
  onCommand
}: {
  visible: boolean;
  onClose: () => void;
  onCommand: (cmd: string) => void;
}) {
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!visible) setQ("");
  }, [visible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = [
    { id: "clear", label: "Clear session" },
    { id: "inject", label: "Inject system message" },
    { id: "chaos", label: "Toggle chaos mode" }
  ].filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  if (!visible) return null;
  return (
    <div className={"simulator-cmdPalette simulator-show"} role="dialog" aria-modal>
      <input className="simulator-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command..." />
      <div style={{marginTop:8}}>
        {commands.map((c) => (
          <div key={c.id} style={{padding:"8px 10px",cursor:"pointer"}} onClick={() => onCommand(c.id)}>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
