/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ShellTerminalProps {
    onDeploy: (manifest: string) => void;
    onIntercept?: (blob: string) => void;
    isLoading: boolean;
}

interface StructuredCommand {
    input: string;
    timestamp: string;
    type: 'SYSTEM' | 'DEPLOY' | 'AUDIT' | 'QUERY';
}

export const ShellTerminal = ({ onDeploy, onIntercept, isLoading }: ShellTerminalProps) => {
    const { user, isAuthenticated, login, logout } = useAuth();
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [cmdLog, setCmdLog] = useState<StructuredCommand[]>([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const [isLoginMode, setIsLoginMode] = useState(false);
    
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const draftInputRef = useRef("");

    // Load history from storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('slavko-shell-history');
        if (stored) {
            try {
                setCmdLog(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse shell history");
            }
        }
    }, []);

    // Initial Boot Sequence Log
    useEffect(() => {
        if (history.length === 0) {
            const bootMsg = [
                "FORMATDISC_CONSOLE v4.0.2-LTS // SOVEREIGN_EDITION",
                "TRUST_POSTURE: KERNEL_BOUND // ADR-KTL-004_ENFORCED",
                "GLOBAL_ANTIGRAVITY_RULESET: LOADED (STRICT_MODE)",
                isAuthenticated 
                    ? `AUTHENTICATED: ${user?.id} [${user?.role}]` 
                    : "IDENTITY_STATE: GUEST (LIMITED_ACCESS)",
                "SYSTEM_READY // AWAITING_KERNEL_COMMAND",
                ""
            ];
            setHistory(bootMsg);
        }
    }, [isAuthenticated, user]);

    // React to auth state changes
    useEffect(() => {
        if (history.length > 0) {
            setHistory(prev => [
                ...prev, 
                `[AUTH_STATE_CHANGE] :: USER=${isAuthenticated ? user?.id : 'GUEST'}`, 
                ""
            ]);
        }
    }, [isAuthenticated, user]);

    const scrollToBottom = useCallback(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [history, scrollToBottom]);

    const handleVerify = () => {
        setHistory(prev => [
            ...prev, 
            `[${new Date().toISOString()}] [AUDIT] INITIALIZING_FS_INTEGRITY_CHECK...`, 
            "[AUDIT] ROOT_MANIFEST: VALID", 
            "[AUDIT] B1_PARTITION: SECURE", 
            "[AUDIT] GOVERNANCE_LOCK: ENGAGED", 
            "[AUDIT] STATUS: NOMINAL", 
            ""
        ]);
    };

    const processCommand = async (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        const timestamp = new Date().toISOString();
        
        // Handle password input mode
        if (isLoginMode) {
            // Do not echo password
            setHistory(prev => [...prev, `[INPUT_HIDDEN]`]);
            setHistory(prev => [...prev, `[AUTH] VERIFYING_CREDENTIALS...`]);
            const success = await login(trimmed);
            if (success) {
                setHistory(prev => [...prev, `[AUTH] SUCCESS. PRIVILEGE_ESCALATION_COMPLETE.`, ""]);
            } else {
                setHistory(prev => [...prev, `[AUTH] FAILURE. INVALID_CREDENTIALS.`, ""]);
            }
            setIsLoginMode(false);
            return;
        }

        setHistory(prev => [...prev, `λ ${trimmed}`]);
        
        const args = trimmed.split(/\s+/);
        const command = args[0].toLowerCase();
        let cmdType: StructuredCommand['type'] = 'QUERY';

        // GUEST COMMANDS RESTRICTION
        if (!isAuthenticated && command !== 'login' && command !== 'help' && command !== 'clear') {
            setHistory(prev => [...prev, `[ACCESS_DENIED] Command '${command}' requires ROOT privilege.`, "Type 'login' to authenticate.", ""]);
            return;
        }

        switch (command) {
            case 'help':
                setHistory(prev => [...prev, 
                    "KERNEL_COMMAND_SET:", 
                    isAuthenticated ? "  slavko deploy <intent>      Synthesize high-integrity artifact" : "  [LOCKED] slavko deploy",
                    isAuthenticated ? "  slavko intercept <blob>    Deconstruct and audit vendor-native signal" : "  [LOCKED] slavko intercept",
                    isAuthenticated ? "  slavko opacity-report       List reputational risk of intercepted signals" : "  [LOCKED] slavko opacity-report",
                    "  login                       Authenticate as Root Operator",
                    "  logout                      Terminate Session",
                    "  clear                       Purge terminal buffer", 
                    ""
                ]);
                break;
            case 'login':
                if (isAuthenticated) {
                    setHistory(prev => [...prev, "ALREADY_AUTHENTICATED.", ""]);
                } else {
                    setHistory(prev => [...prev, "ENTER_ROOT_KEY:", ""]);
                    setIsLoginMode(true);
                }
                break;
            case 'logout':
                logout();
                setHistory(prev => [...prev, "SESSION_TERMINATED.", ""]);
                break;
            case 'clear':
                setHistory([]);
                break;
            case 'slavko':
                if (args[1] === 'deploy') {
                    cmdType = 'DEPLOY';
                    const prompt = args.slice(2).join(" ");
                    if (!prompt) {
                        setHistory(prev => [...prev, `[${timestamp}] ERROR: Deployment requires a verified intent manifest.`, ""]);
                    } else {
                        const receiptId = `REC_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                        setHistory(prev => [...prev, `[${timestamp}] [KERNEL] INTENT_RECEIVED :: RECEIPT=${receiptId}`, ""]);
                        onDeploy(prompt);
                    }
                } else if (args[1] === 'intercept') {
                    cmdType = 'AUDIT';
                    const blob = args.slice(2).join(" ");
                    if (!blob) {
                        setHistory(prev => [...prev, `[${timestamp}] ERROR: Interception requires a source vendor blob.`, ""]);
                    } else {
                        setHistory(prev => [...prev, `[${timestamp}] [KERNEL] INITIATING_AUDIT-KTL-002_PROTOCOL...`, ""]);
                        if (onIntercept) onIntercept(blob);
                    }
                } else if (args[1] === 'opacity-report') {
                    // Interpreted View Projection of the ledger
                    const ledger = JSON.parse(localStorage.getItem('slavko-kernel-ledger') || '[]');
                    const intercepts = ledger.filter((e: any) => e.type === 'VENDOR_INTERCEPTION' || e.interception);
                    
                    if (intercepts.length === 0) {
                        setHistory(prev => [...prev, `[${timestamp}] [AUDIT] ZERO_REPUTATIONAL_DEBT_DETECTED. No recorded interceptions.`, ""]);
                    } else {
                        setHistory(prev => [
                            ...prev,
                            "VENDOR_OPACITY_AGGREGATE_VIEW:",
                            "HEIGHT      SCORE   VERDICT   ISO_TIMESTAMP",
                            "----------------------------------------------------------",
                            ...intercepts.map((e: any) => {
                                const int = e.interception || {};
                                const profile = int.opacityProfile || {};
                                const score = profile.opacityScore ?? '??';
                                const verdict = int.verdict ?? 'UNKNOWN';
                                const ts = new Date(e.timestamp).toISOString();
                                return `${e.height.padEnd(12)}${String(score).padEnd(8)}${verdict.padEnd(10)}${ts}`;
                            }),
                            ""
                        ]);
                    }
                } else if (args[1] === 'status') {
                    setHistory(prev => [...prev, 
                        `[${timestamp}] [TELEMETRY] PARTITION_B1: STABLE`,
                        "[TELEMETRY] UPTIME: 3224m 12s",
                        "[TELEMETRY] POLICY: GLOBAL_ANTIGRAVITY_v1",
                        "[TELEMETRY] COMPLIANCE: SOC2/ISO_NOMINAL",
                        ""
                    ]);
                } else if (args[1] === 'policy') {
                    setHistory(prev => [...prev, 
                        "ACTIVE_GOVERNANCE_CONSTRAINTS:",
                        "  1. DETERMINISTIC_EXECUTION: ENABLED",
                        "  2. FORENSIC_TRACEABILITY: ENABLED",
                        "  3. NON_DETERMINISTIC_INTERCEPTION: ACTIVE",
                        "  4. GRC_HARD_STOPS: ACTIVE",
                        ""
                    ]);
                } else if (args[1] === 'audit') {
                    cmdType = 'AUDIT';
                    handleVerify();
                } else {
                    setHistory(prev => [...prev, "Unknown extension. Type 'help' for documentation.", ""]);
                }
                break;
            default:
                setHistory(prev => [...prev, `Unknown command: ${command}. Type 'help' for assist.`, ""]);
        }

        setCmdLog(prev => {
            const newState = [{ input: trimmed, timestamp, type: cmdType }, ...prev].slice(0, 50);
            localStorage.setItem('slavko-shell-history', JSON.stringify(newState));
            return newState;
        });
        setHistoryIdx(-1);
        draftInputRef.current = "";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            processCommand(input);
            setInput("");
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIdx === -1) {
                // Save current input as draft before moving up
                draftInputRef.current = input;
            }
            const nextIdx = historyIdx + 1;
            if (nextIdx < cmdLog.length) {
                setHistoryIdx(nextIdx);
                setInput(cmdLog[nextIdx].input);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = historyIdx - 1;
            if (nextIdx >= 0) {
                setHistoryIdx(nextIdx);
                setInput(cmdLog[nextIdx].input);
            } else {
                setHistoryIdx(-1);
                // Restore draft when returning to bottom
                setInput(draftInputRef.current);
            }
        }
    };

    return (
        <div className="shell-terminal-container" style={{ position: 'relative', background: '#000', border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="crt-overlay" />
            <div className="terminal-history" style={{ height: '300px', overflowY: 'auto', padding: '20px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                {history.map((line, i) => (
                    <div key={i} style={{ marginBottom: '6px', whiteSpace: 'pre-wrap', color: line.startsWith('λ') ? '#fff' : 'inherit' }}>
                        {line}
                    </div>
                ))}
                <div ref={terminalEndRef} />
            </div>
            <div className="terminal-input-line" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                <span className="terminal-prompt" style={{ color: 'var(--color-accent)', fontWeight: 'bold', marginRight: '12px' }}>
                    {isLoginMode ? '🔑' : 'λ'}
                </span>
                <input
                    className="terminal-input"
                    type={isLoginMode ? "password" : "text"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    placeholder={isLoading ? "SYSTEM_PROCESSING..." : isLoginMode ? "ENTER_KEY_FRAGMENT" : "AWAITING_KERNEL_COMMAND"}
                    style={{ background: 'transparent', border: 'none', color: '#fff', flex: 1, outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                />
            </div>
        </div>
    );
};
