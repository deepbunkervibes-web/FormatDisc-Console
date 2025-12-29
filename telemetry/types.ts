
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModuleId = "EXECUTION_KERNEL" | "COMPLIANCE_ENGINE" | "FORENSICS_SERVICE";

/** 
 * Canonical Kernel Module Status as per ADR-KTL-001.
 */
export type KernelModuleStatus = "OK" | "DEGRADED" | "ERROR";

export interface ModuleTelemetry {
  id: ModuleId;
  status: KernelModuleStatus;
  latencyMs: number;
  integrityScore: number; 
  lastUpdated: string; 
  incidentsLast24h: number;
}

/** ADR-KTL-002: Vendor Opacity Contracts */

export type SovereignVerdict = "ALLOW" | "REDACT" | "BLOCK";

export interface OpacityProfile {
  vendor: string;
  scannedAt: string;
  identityHooks: {
    detected: boolean;
    artifacts: string[];
    severity: "LOW" | "MEDIUM" | "HIGH";
  };
  remoteFlags: {
    detected: boolean;
    endpoints: string[];
    mutableAtRuntime: boolean;
  };
  undocumentedRPCs: {
    detected: boolean;
    callSignatures: string[];
    replayable: boolean;
  };
  ephemeralTokens: {
    detected: boolean;
    ttlSeconds?: number;
  };
  opacityScore: number; // 0–100
}

export interface InterceptionLog {
  id: string;
  vendor: string;
  opacityProfile: OpacityProfile;
  verdict: SovereignVerdict;
  timestamp: string;
  nonRepudiationHash: string;
}
