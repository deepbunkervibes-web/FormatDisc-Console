
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cva, type VariantProps } from "class-variance-authority";

export const systemCard = cva(
  "system-card flex flex-col border border-border-subtle bg-panel text-text-primary transition-all duration-300",
  {
    variants: {
      status: {
        OK: "ring-1 ring-success/40 border-success/20",
        DEGRADED: "ring-1 ring-warning/40 border-warning/20",
        ERROR: "ring-1 ring-danger/60 border-danger/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        UNKNOWN: "ring-0",
      },
      density: {
        comfortable: "p-5",
        compact: "p-4",
      },
      emphasis: {
        default: "",
        primary: "shadow-lg shadow-accent-glow",
      },
    },
    defaultVariants: {
      status: "UNKNOWN",
      density: "comfortable",
      emphasis: "default",
    },
  }
);

export type SystemCardVariants = VariantProps<typeof systemCard>;
