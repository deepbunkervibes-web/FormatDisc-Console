
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { memo } from 'react';
import { useKernelTelemetry } from '../telemetry/useKernelTelemetry';
import { SystemCard } from './SystemCard';
import type { KernelModuleStatus } from '../telemetry/types';

type DisplayStatus = KernelModuleStatus | "UNKNOWN";

function statusLabel(status: DisplayStatus | undefined) {
  if (!status || status === "UNKNOWN") return "STATE: UNKNOWN";
  switch (status) {
    case "OK":
      return "STATE: STABLE_OPERATION";
    case "DEGRADED":
      return "STATE: DEGRADED // INVESTIGATE";
    case "ERROR":
      return "STATE: CRITICAL_FAULT // SAFETY_LOCK";
    default:
      return "STATE: UNKNOWN";
  }
}

export const OrchestratorPanel = memo(() => {
  const { data, loading, error } = useKernelTelemetry({
    moduleId: "EXECUTION_KERNEL",
  });

  const status: DisplayStatus = data?.status ?? "UNKNOWN";

  const footer = (
    <div className="mt-auto flex gap-2" aria-label="Execution kernel telemetry">
      <span className="font-mono text-[0.6rem] opacity-60">
        {loading && "Loading..."}
        {error && "Telemetry unavailable"}
        {data && `LATENCY: ${Math.round(data.latencyMs)}ms · INTEGRITY: ${data.integrityScore.toFixed(1)}%`}
      </span>
    </div>
  );

  return (
    <SystemCard
      label="B1 // EXECUTION_KERNEL"
      title="Orchestration Fabric"
      description="Runtime enforcement. Isolated agentic compute with instruction-level integrity checks."
      status={status}
      statusLabel={statusLabel(status)}
      footer={footer}
    />
  );
});

export const CompliancePanel = memo(() => {
  const { data } = useKernelTelemetry({
    moduleId: "COMPLIANCE_ENGINE",
  });

  const status: DisplayStatus = data?.status ?? "UNKNOWN";

  return (
    <SystemCard
      label="B2 // COMPLIANCE_ENGINE"
      title="Governance Hard-Stops"
      description="No exceptions. SOC2/ISO/EU AI Act enforced at the bytecode layer. Real-time policy mapping."
      status={status}
      statusLabel={statusLabel(status)}
    />
  );
});

export const ForensicsPanel = memo(() => {
  const { data } = useKernelTelemetry({
    moduleId: "FORENSICS_SERVICE",
  });

  const status: DisplayStatus = data?.status ?? "UNKNOWN";

  return (
    <SystemCard
      label="B3 // FORENSICS_SERVICE"
      title="Immutable Ledger"
      description="Court-ready evidence chains. Every state transition is hashed, signed, and locked into the ledger."
      status={status}
      statusLabel={statusLabel(status)}
      className="relative overflow-hidden"
      footer={status === "OK" ? <div className="merkle-pulse" /> : null}
    />
  );
});

export const SystemGrid = () => (
    <div className="system-grid">
        <OrchestratorPanel />
        <CompliancePanel />
        <ForensicsPanel />
    </div>
);
