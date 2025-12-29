/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useReducer, useEffect, useMemo, useCallback } from 'react';
import { WarningIcon, SignalIcon, ShieldCheckIcon } from './Icons';
import { generateId } from '../utils';
import type { OpacityProfile, SovereignVerdict } from '../telemetry/types';

interface B3DeconstructorPanelProps {
    blob: string;
    onComplete: (verdict: { profile: OpacityProfile; verdict: SovereignVerdict; id: string }) => void;
}

type ScanPhase = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'AWAITING_DECREE' | 'NEUTRALIZING';

interface ScanState {
    phase: ScanPhase;
    progress: number;
    logs: Array<{ timestamp: number; message: string }>;
    startTime: number;
}

type Action = 
    | { type: 'INIT_SCAN'; timestamp: number }
    | { type: 'TICK_PROGRESS'; value: number }
    | { type: 'ADD_LOG'; message: string; relativeTime: number }
    | { type: 'PHASE_CHANGE'; phase: ScanPhase };

const INITIAL_STATE: ScanState = {
    phase: 'IDLE',
    progress: 0,
    logs: [],
    startTime: 0
};

function reducer(state: ScanState, action: Action): ScanState {
    switch (action.type) {
        case 'INIT_SCAN':
            return { ...state, phase: 'SCANNING', startTime: action.timestamp, logs: [], progress: 0 };
        case 'TICK_PROGRESS':
            return { ...state, progress: action.value };
        case 'ADD_LOG':
            return { 
                ...state, 
                logs: [...state.logs, { timestamp: action.relativeTime, message: action.message }] 
            };
        case 'PHASE_CHANGE':
            return { ...state, phase: action.phase };
        default:
            return state;
    }
}

// Deterministic Timeline Definition for Audit Reproducibility
const TIMELINE = [
    { time: 100, type: 'LOG', payload: "INITIALIZING_FINGERPRINT_SCAN" },
    { time: 200, type: 'PROGRESS', payload: 10 },
    { time: 400, type: 'LOG', payload: "ANALYZING_DOM_STRUCTURE" },
    { time: 600, type: 'PROGRESS', payload: 25 },
    { time: 800, type: 'LOG', payload: "EXTRACTING_SCRIPTS" },
    { time: 1000, type: 'PROGRESS', payload: 40 },
    { time: 1200, type: 'LOG', payload: "IDENTIFYING_REMOTE_HOOKS" },
    { time: 1500, type: 'PROGRESS', payload: 65 },
    { time: 1600, type: 'LOG', payload: "CALCULATING_OPACITY_VECTORS" },
    { time: 1800, type: 'PROGRESS', payload: 85 },
    { time: 1900, type: 'LOG', payload: "SCORING_REPUTATIONAL_DEBT" },
    { time: 2100, type: 'PROGRESS', payload: 95 },
    { time: 2200, type: 'LOG', payload: "VERDICT_GENERATED" },
    { time: 2400, type: 'PROGRESS', payload: 100 },
];

export const B3DeconstructorPanel = ({ blob, onComplete }: B3DeconstructorPanelProps) => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    // ADR-KTL-002: Deterministic Profile Construction
    // Memoized to ensure referential stability for audit reproducibility
    const profile: OpacityProfile = useMemo(() => ({
        vendor: "Intercepted Vendor Payload",
        scannedAt: new Date().toISOString(),
        identityHooks: {
            detected: true,
            artifacts: ["OAuth_Client_ID", "Session_Token_Hash"],
            severity: "HIGH"
        },
        remoteFlags: {
            detected: true,
            endpoints: ["/v1/feature-flags", "/config/live"],
            mutableAtRuntime: true
        },
        undocumentedRPCs: {
            detected: true,
            callSignatures: ["INTERNAL_LOG_PUSH", "SESSION_HEARTBEAT_OPAQUE"],
            replayable: false
        },
        ephemeralTokens: {
            detected: true,
            ttlSeconds: 3600
        },
        opacityScore: 87 // Calculated risk score
    }), []);

    const verdict: SovereignVerdict = useMemo(() => {
        if (profile.opacityScore >= 80) return 'BLOCK';
        if (profile.opacityScore >= 60) return 'REDACT';
        return 'ALLOW';
    }, [profile.opacityScore]);

    useEffect(() => {
        // Start the deterministic timeline
        const start = Date.now();
        dispatch({ type: 'INIT_SCAN', timestamp: start });

        const timeouts: NodeJS.Timeout[] = [];

        TIMELINE.forEach(event => {
            const t = setTimeout(() => {
                if (event.type === 'LOG') {
                    dispatch({ type: 'ADD_LOG', message: event.payload as string, relativeTime: event.time });
                } else if (event.type === 'PROGRESS') {
                    dispatch({ type: 'TICK_PROGRESS', value: event.payload as number });
                }
            }, event.time);
            timeouts.push(t);
        });

        // Schedule Completion Phase
        const finalT = setTimeout(() => {
            dispatch({ type: 'PHASE_CHANGE', phase: 'AWAITING_DECREE' });
        }, 2500);
        timeouts.push(finalT);

        return () => timeouts.forEach(clearTimeout);
    }, []);

    const executeDecree = useCallback(() => {
        dispatch({ type: 'PHASE_CHANGE', phase: 'NEUTRALIZING' });
        
        // Simulate heavy cryptographic work
        setTimeout(() => {
            onComplete({
                profile,
                verdict,
                id: `VAULT::INT::${generateId().substring(0, 8).toUpperCase()}`
            });
        }, 1200);
    }, [onComplete, profile, verdict]);

    return (
        <div className="forensic-deconstructor bg-[#050507] border border-[#1a1b23] p-8 font-mono relative overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <SignalIcon variant="alert" size="1.4em" />
                    <h2 className="text-[0.9rem] font-black tracking-[0.2em]">B3_DECONSTRUCTOR // VENDOR_AUDIT</h2>
                </div>
                <div className="text-[0.6rem] opacity-50 font-mono">
                    PHASE: {state.phase} // PROGRESS: {state.progress}%
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10 flex-1 min-h-0">
                <div className="opacity-risk-profile overflow-y-auto">
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-[0.65rem] text-[#00f2ff]">[OPACITY_RISK_RADAR]</h3>
                        <div className="text-right">
                            <div className="text-[0.5rem] opacity-40">OPACITY_SCORE</div>
                            <div className={`text-2xl font-black ${verdict === 'BLOCK' ? 'text-red-500' : 'text-yellow-500'}`}>
                                {profile.opacityScore}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: "IDENTITY_HOOKS", val: 88, risk: "HIGH" },
                            { label: "REMOTE_FLAGS", val: 94, risk: "HIGH" },
                            { label: "UNDOCUMENTED_RPC", val: 72, risk: "MEDIUM" },
                            { label: "EPHEMERAL_POSTURE", val: 100, risk: "HIGH" }
                        ].map(m => (
                            <div key={m.label}>
                                <div className="flex justify-between text-[0.6rem] mb-2">
                                    <span>{m.label}</span>
                                    <span className={m.risk === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}>{m.val}% RISK</span>
                                </div>
                                <div className="h-1 bg-white/5 relative">
                                    <div 
                                        className={`absolute top-0 left-0 h-full transition-all duration-300 ${m.risk === 'HIGH' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                        style={{ width: `${(state.progress / 100) * m.val}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="log-column h-full min-h-0 flex flex-col">
                    <div className="bg-black border border-white/5 p-4 h-full flex flex-col gap-3">
                        <div className="text-[0.55rem] text-[#00f2ff] opacity-60 border-b border-[#00f2ff]/10 pb-2 mb-2">INTEGRITY_LOG_STREAM</div>
                        <div className="flex-1 overflow-y-auto space-y-1 font-mono">
                            {state.logs.map((log, i) => (
                                <div key={i} className="text-[0.6rem] flex gap-2">
                                    <span className="opacity-30 text-[0.5rem]">T+{(log.timestamp / 1000).toFixed(2)}s</span>
                                    <span>{log.message}</span>
                                </div>
                            ))}
                        </div>

                        {state.phase === 'AWAITING_DECREE' && (
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 shrink-0">
                                <div className={`p-3 border mb-4 ${verdict === 'BLOCK' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-yellow-500/10 border-yellow-500 text-yellow-500'}`}>
                                    <div className="text-[0.5rem] opacity-60">SOVEREIGN_VERDICT</div>
                                    <div className="text-[0.8rem] font-black">{verdict}</div>
                                </div>
                                <button 
                                    onClick={executeDecree}
                                    className="w-full bg-[#00f2ff] text-black border-none py-3 text-[0.65rem] font-black cursor-pointer hover:brightness-110 transition-all"
                                >
                                    EXECUTE_SOVEREIGN_DECREE
                                </button>
                            </div>
                        )}
                        
                        {state.phase === 'NEUTRALIZING' && (
                             <div className="mt-4 shrink-0">
                                <div className="w-full bg-red-500 text-white border-none py-3 text-[0.65rem] font-black text-center animate-pulse">
                                    NEUTRALIZING_OPAQUE_OBJECTS...
                                </div>
                             </div>
                        )}
                    </div>
                </div>
            </div>

            {state.phase === 'NEUTRALIZING' && (
                <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[1px] flex items-center justify-center z-50 pointer-events-none">
                    <div className="flex flex-col items-center">
                         <ShieldCheckIcon size="4em" variant="alert" />
                         <div className="mt-4 text-red-500 font-black text-lg tracking-widest animate-pulse">ENFORCING_BLOCKLIST</div>
                    </div>
                </div>
            )}
        </div>
    );
};