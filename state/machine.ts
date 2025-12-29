
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { KernelModuleStatus } from "../telemetry/types";

export interface ModuleState {
  status: KernelModuleStatus;
}

export type MachineEvent = { type: "DEGRADE" } | { type: "RECOVER" } | { type: "CRITICAL_FAULT" };

export function moduleReducer(state: ModuleState, event: MachineEvent): ModuleState {
  switch (event.type) {
    case "DEGRADE":
      if (state.status === "ERROR") return state;
      return { status: "DEGRADED" };
    case "RECOVER":
      return { status: "OK" };
    case "CRITICAL_FAULT":
      return { status: "ERROR" };
    default:
      return state;
  }
}
