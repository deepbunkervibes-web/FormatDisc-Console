import React, { useEffect, useRef, useState } from "react";
import MessageItem from "./MessageItem";
import { Simulator } from "../state/simulator";
import { Message } from "../simulator-types";

export default function Chat({ sim }: { sim: Simulator }) {
  const [msgs, setMsgs] = useState<Message[]>(sim.getMessages());
  const [val, setVal] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // poll simulator messages every 200ms to keep UI in sync (deterministic)
  useEffect(() => {
    const t = setInterval(() => setMsgs(sim.getMessages()), 200);
    return () => clearInterval(t);
  }, [sim]);

  useEffect(() => {
    // autoscroll on new messages
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs.length]);

  const send = () => {
    if (!val.trim()) return;
    sim.sendUser(val.trim());
    setVal("");
    setMsgs(sim.getMessages());
  };

  return (
    <div className="simulator-chatWrap">
      <div className="simulator-messageList" ref={listRef} aria-live="polite">
        {msgs.map((m) => (
          <MessageItem key={m.id} m={m} />
        ))}
      </div>
      <div className="simulator-composer">
        <input
          className="simulator-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask v0..."
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
