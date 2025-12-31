import React, { FC } from "react";
import { Message } from "../simulator-types";
import StatusBadge from "./StatusBadge";
import { formatShort } from "../utils/time";

// Fix: Define an explicit interface for MessageItem props.
interface MessageItemProps {
  m: Message;
}

// Fix: Use React.FC to explicitly type the functional component, allowing TypeScript to correctly handle intrinsic JSX attributes like 'key'.
const MessageItem: FC<MessageItemProps> = ({ m }) => {
  const cls = m.role === "user" ? "simulator-msg simulator-user" : m.role === "assistant" ? "simulator-msg simulator-assistant" : "simulator-msg simulator-system";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:m.role==="user" ? "flex-end" : m.role==="assistant" ? "flex-start":"center"}}>
      <div className={cls} aria-role="message" data-id={m.id}>
        <div dangerouslySetInnerHTML={{ __html: escapeToHtml(m.content) }} />
        <div className="simulator-badge" aria-hidden>
          <StatusBadge status={m.status} />
        </div>
        <div className="simulator-ts">{m.finishedAt ? formatShort(m.finishedAt) : formatShort(m.startedAt)}</div>
      </div>
    </div>
  );
}

function escapeToHtml(md: string) {
  // Minimal markdown -> html for headings and code fences and linebreaks. Keep deterministic & small.
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // code block
  const code = escaped.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code}</code></pre>`);
  const br = code.replace(/\n/g, "<br/>");
  return br;
}

export default MessageItem;