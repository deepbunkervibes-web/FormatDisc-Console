
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface IconProps {
    className?: string;
    variant?: 'idle' | 'verified' | 'alert' | 'active';
    size?: string | number;
}

const getVariantColor = (variant: IconProps['variant']) => {
    switch (variant) {
        case 'verified': return 'var(--color-success)';
        case 'alert': return 'var(--color-danger)';
        case 'active': return 'var(--color-accent)';
        default: return 'currentColor';
    }
};

const getFill = (variant: IconProps['variant']) => {
    return (variant === 'verified' || variant === 'active') ? 'rgba(0, 242, 255, 0.1)' : 'none';
};

export const ThinkingIcon = ({ className, variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width={size} height={size} className={`${className} ${variant === 'active' ? 'spin-icon' : ''}`}>
        <circle cx="12" cy="12" r="10" stroke={getVariantColor(variant)} strokeWidth="2" strokeDasharray="4 4" opacity={variant === 'idle' ? 0.3 : 1} />
        <path d="M12 7V12L15 15" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const KernelIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="1" ry="1"></rect>
        <rect x="2" y="14" width="20" height="8" rx="1" ry="1"></rect>
        <line x1="6" y1="6" x2="6.01" y2="6"></line>
        <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
);

export const CodeIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

export const SparklesIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
);

export const ShieldCheckIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/>
    </svg>
);

export const DatabaseIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
);

export const GridIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
        <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
    </svg>
);

export const MessageSquareIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
);

export const InspectionIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
);

export const VaultIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

export const TraceIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v8"/><path d="M12 14v8"/><path d="M16 6l-8 8"/><path d="M8 6l8 8"/>
    </svg>
);

export const WarningIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Opacity Warning">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

export const SignalIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="External Signal Interceptor">
        <path d="M12 2v8"/><path d="M12 14v8"/><circle cx="12" cy="12" r="10" strokeDasharray="4 4" opacity="0.2"/><path d="M16 8l-8 8"/><path d="M8 8l8 8"/>
    </svg>
);

export const BrushIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={getFill(variant)} stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 5 5"/><path d="m5.5 16.5-3-3"/>
    </svg>
);

export const UploadCloudIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><path d="M16 16l-4-4-4 4"/>
    </svg>
);

export const ActivityIcon = ({ variant, size = '1em' }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={getVariantColor(variant)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);