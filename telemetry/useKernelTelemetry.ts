
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import type { ModuleTelemetry, ModuleId, KernelModuleStatus } from "./types";

interface UseKernelTelemetryOptions {
  moduleId: ModuleId;
  pollIntervalMs?: number;
}

export function useKernelTelemetry({
  moduleId,
  pollIntervalMs = 15000,
}: UseKernelTelemetryOptions) {
  const [data, setData] = useState<ModuleTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /**
     * Institutional Mock Generator.
     * Enforces ADR-KTL-001 constraints:
     * 1. integrityScore < 100.0
     * 2. Strict enum status
     */
    const getMockTelemetry = (id: ModuleId): ModuleTelemetry => ({
        id,
        status: "OK" as KernelModuleStatus,
        latencyMs: 10 + Math.random() * 8,
        // Capped at 99.9 to ensure institutional honesty as per ADR
        integrityScore: 97 + Math.random() * 2.9,
        lastUpdated: new Date().toISOString(),
        incidentsLast24h: 0
    });

    async function fetchSnapshot() {
      try {
        const json = getMockTelemetry(moduleId);
        if (!cancelled) {
          setData(json);
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Telemetry fetch failed");
          setLoading(false);
        }
      }
    }

    fetchSnapshot();

    const wsSimulation = setInterval(() => {
        if (!cancelled && Math.random() > 0.85) {
            setData(prev => prev ? {
                ...prev,
                latencyMs: 8 + Math.random() * 12,
                integrityScore: 96 + Math.random() * 3.9,
                lastUpdated: new Date().toISOString()
            } : null);
        }
    }, 3000);

    const pollTimer = window.setInterval(fetchSnapshot, pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(wsSimulation);
      window.clearInterval(pollTimer);
    };
  }, [moduleId, pollIntervalMs]);

  return { data, loading, error };
}
