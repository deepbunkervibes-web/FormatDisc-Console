
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useReducer } from "react";
import { moduleReducer, ModuleState, MachineEvent } from "../state/machine";
import { SystemCard } from "./SystemCard";

export const ModuleStateDemo: React.FC = () => {
  const [state, dispatch] = useReducer(
    moduleReducer,
    { status: "OK" } as ModuleState
  );

  const statusLabel = `DEMO_STATE: ${state.status}`;

  const footer = (
    <div className="flex flex-wrap gap-2">
        <button
          className="artifact-action-btn text-[0.6rem] py-1 px-3"
          onClick={() => dispatch({ type: "DEGRADE" } as MachineEvent)}
          disabled={state.status === "ERROR"}
        >
          SIMULATE_DEGRADATION
        </button>
        <button
          className="artifact-action-btn action-danger text-[0.6rem] py-1 px-3"
          onClick={() => dispatch({ type: "CRITICAL_FAULT" } as MachineEvent)}
        >
          TRIGGER_CRITICAL_FAULT
        </button>
        <button
          className="artifact-action-btn text-[0.6rem] py-1 px-3"
          style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
          onClick={() => dispatch({ type: "RECOVER" } as MachineEvent)}
        >
          INIT_RECOVERY
        </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto stagger-1">
      <SystemCard
        label="DEMO // STATE_MACHINE"
        title="Kernel State Ritual"
        description="Manually toggle system partitions to observe deterministic state transitions and UI reactions."
        status={state.status}
        statusLabel={statusLabel}
        footer={footer}
      />
      <div className="mt-4 p-4 border border-white/5 bg-black/40 rounded font-mono text-xs opacity-60">
        <p>RECOVERY_PATH: {state.status === "ERROR" ? "RESTRICTED (RECOVER REQUIRED)" : "NORMAL"}</p>
        <p>TRANSITION_LOG: {state.status === "OK" ? "GENESIS_STABLE" : "STATE_ANOMALY"}</p>
      </div>
    </div>
  );
};
