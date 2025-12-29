
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { systemCard, type SystemCardVariants } from "../ui/systemCard";
import { cn } from "../utils/cn";

interface SystemCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  title: string;
  description: string;
  statusLabel?: string;
  footer?: React.ReactNode;
  // Explicitly add variant props to fix inheritance issues from VariantProps
  status?: SystemCardVariants['status'];
  density?: SystemCardVariants['density'];
  emphasis?: SystemCardVariants['emphasis'];
}

export const SystemCard = React.forwardRef<HTMLDivElement, SystemCardProps>(
  ({ label, title, description, status, density, emphasis, statusLabel, footer, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(systemCard({ status, density, emphasis }), className)}
      role="region"
      aria-labelledby={`${label}-title`}
      aria-describedby={`${label}-desc`}
      {...props}
    >
      <div className="mb-3">
        <span className="card-label text-[0.6rem] font-mono opacity-50 block mb-1 uppercase tracking-widest">{label}</span>
        <h3 id={`${label}-title`} className="card-title font-bold text-lg leading-tight">
          {title}
        </h3>
      </div>

      <div className="flex-1">
        <p id={`${label}-desc`} className="card-desc text-sm text-text-secondary mb-3">
          {description}
        </p>
        {statusLabel && (
          <div
            className="mt-2 font-mono text-[0.6rem] opacity-60 tracking-wider"
            aria-live="polite"
          >
            {statusLabel}
          </div>
        )}
      </div>

      {footer && <div className="mt-auto pt-4 border-t border-white/5">{footer}</div>}
    </div>
  )
);

SystemCard.displayName = "SystemCard";
