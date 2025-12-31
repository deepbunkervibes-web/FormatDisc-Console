import React from "react";
import { Status } from "../simulator-types";

export default function StatusBadge({ status }: { status: Status }) {
  if (status === "executing") {
    return (
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div className="simulator-pulse" />
        <span className="simulator-small">executing</span>
      </div>
    );
  }
  const cls = `simulator-dot simulator-${status}`;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:10,height:10,borderRadius:6}} className={cls} />
      <span className="simulator-small">{status}</span>
    </div>
  );
}
