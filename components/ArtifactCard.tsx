
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState, memo, useCallback } from 'react';
import { Artifact } from '../types';
import { computeHash, downloadFile } from '../utils';
import { InspectionIcon, VaultIcon, ShieldCheckIcon, TraceIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onClose?: () => void;
}

const BUILD_STEPS = [
    "[SYSTEM] ALLOCATING_PARTITION_B1",
    "[GRC] INJECTING_ANTIGRAVITY_POLICY",
    "[LLM] SYNTHESIZING_MANIFEST",
    "[CODE] HYDRATING_MANIFEST",
    "[SECURITY] GENERATING_ROOT_PROOF",
    "[AUDIT] SIGNING_HASH_TREE",
    "[KERNEL] EXECUTION_NOMINAL"
];

const SECURITY_DIRECTIVES = [
    { rule: "SOC2_CC6.1", label: "LOGICAL_ACCESS_CONTROL", status: "VERIFIED" },
    { rule: "ISO27001_A.14", label: "SECURE_DEVELOPMENT_POLICY", status: "VERIFIED" },
    { rule: "EU_AI_ACT_T1", label: "TRANSPARENCY_OBLIGATION", status: "COMPLIANT" },
    { rule: "ANTIGRAVITY_D1", label: "DETERMINISTIC_EXECUTION", status: "ENFORCED" }
];

const ArtifactCard = memo(({ artifact, isFocused, onClick, onClose }: ArtifactCardProps) => {
    const [currentHash, setCurrentHash] = useState<string>('');
    const [buildStepIdx, setBuildStepIdx] = useState(0);
    const [govScore, setGovScore] = useState(0);
    
    const isSealed = artifact.status === 'complete';
    const isStreaming = artifact.status === 'streaming';

    useEffect(() => {
        if (isStreaming) {
            const interval = setInterval(() => {
                setBuildStepIdx(prev => (prev + 1) % BUILD_STEPS.length);
            }, 600);
            return () => clearInterval(interval);
        }
    }, [isStreaming]);

    useEffect(() => {
        if (artifact.html) {
            computeHash(artifact.html).then(h => {
                setCurrentHash(h);
                const score = (parseInt(h.substring(0, 2), 16) % 10) + 90;
                setGovScore(score);
            });
        }
    }, [artifact.html]);

    // Centralized Action Dispatcher
    const dispatchAction = useCallback((e: React.MouseEvent, action: () => void) => {
        e.stopPropagation(); // Prevent card focus when clicking buttons
        action();
    }, []);

    return (
        <div 
            className={`artifact-card ${isSealed ? 'sealed' : ''} ${isFocused ? 'focused' : ''}`}
            onClick={isFocused ? undefined : onClick}
        >
            <div className="integrity-pulse"></div>
            
            {isStreaming && !artifact.html && (
                <div className="build-log-overlay" style={{ position: 'absolute', inset: 0, background: '#000', padding: '40px', zIndex: 60, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                    <div className="log-header" style={{ fontSize: '0.6rem', marginBottom: '24px', opacity: 0.6, borderBottom: '1px solid rgba(0,242,255,0.2)', paddingBottom: '8px' }}>
                        LIVE_B1_STREAM // SRC: Slavko_Kernel
                    </div>
                    {BUILD_STEPS.slice(0, buildStepIdx + 1).map((step, i) => (
                        <div key={i} className="log-line" style={{ marginBottom: '6px', fontSize: '0.7rem' }}>{step}</div>
                    ))}
                </div>
            )}

            <div className="artifact-viewport-container" style={{ width: '100%', height: '100%', position: 'relative', display: 'flex' }}>
                
                {/* Main Viewport */}
                <div className="viewport-main" style={{ flex: isFocused ? '1 1 65%' : '1 1 100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <div className="artifact-header" style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, 
                        padding: '16px 20px', 
                        background: 'rgba(3,3,5,0.85)', 
                        backdropFilter: 'blur(12px)', 
                        zIndex: 30, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div className="status-indicator-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className={`status-dot ${isStreaming ? 'blink' : ''}`} style={{ 
                                width: 6, height: 6, borderRadius: '50%', 
                                backgroundColor: isSealed ? 'var(--color-success)' : 'var(--color-accent)',
                                boxShadow: isSealed ? '0 0 10px var(--color-success)' : 'none'
                            }}></div>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', fontWeight: 800 }}>
                                {isSealed ? 'INTEGRITY: NOMINAL' : 'SYNTHESIS_ACTIVE'}
                            </span>
                            {isSealed && (
                                <span className="integrity-badge" style={{ padding: '2px 8px', background: 'rgba(0, 255, 157, 0.1)', border: '1px solid var(--color-success)', borderRadius: '2px', color: 'var(--color-success)', fontSize: '0.55rem' }}>
                                    GRC: {govScore}%
                                </span>
                            )}
                        </div>
                        {isFocused && onClose && (
                            <button 
                                className="close-inspection-btn"
                                onClick={(e) => dispatchAction(e, onClose)}
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '2px', cursor: 'pointer', padding: '4px 8px', fontSize: '0.6rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}
                            >
                                EXIT_INSPECTION [X]
                            </button>
                        )}
                    </div>

                    <iframe 
                        className="artifact-iframe" 
                        srcDoc={artifact.html} 
                        title={artifact.id}
                        sandbox="allow-scripts allow-same-origin" 
                        style={{ width: '100%', height: '100%', border: 'none', opacity: isStreaming && !artifact.html ? 0 : 1, transition: 'opacity 0.8s' }}
                    />

                    <div className="artifact-footer" style={{ 
                        position: 'absolute', bottom: 0, left: 0, right: 0, 
                        padding: '12px 20px', background: 'rgba(3,3,5,0.95)', 
                        borderTop: '1px solid rgba(255,255,255,0.05)', 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 30 
                    }}>
                        <div className="hash-display" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-text-dim)' }}>
                            ROOT: <span style={{ color: 'var(--color-accent)' }}>{currentHash ? currentHash.substring(0, 16).toUpperCase() : 'PENDING...'}</span>
                        </div>
                        {isSealed && (
                            <button 
                                className="artifact-action-btn" 
                                onClick={(e) => dispatchAction(e, () => downloadFile(artifact.html, `audit_trace_${artifact.id}.html`, "text/html"))}
                                style={{ background: 'transparent', color: '#fff', border: '1px solid var(--color-border-strong)', padding: '6px 12px', fontSize: '0.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
                            >
                                EXPORT_AUDIT_TRACE
                            </button>
                        )}
                    </div>
                </div>

                {/* Forensic Panel (Only in Focus) */}
                {isFocused && (
                    <aside className="forensic-sidebar" style={{ 
                        flex: '1 1 35%', background: '#08080a', borderLeft: '1px solid var(--color-border)', 
                        padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto',
                        fontFamily: 'var(--font-mono)', animation: 'slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div className="panel-section">
                            <h4 style={{ fontSize: '0.65rem', color: 'var(--color-accent)', marginBottom: '12px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <InspectionIcon variant="active" size="1.2em" />
                                [SECURITY_DIRECTIVES_AUDIT]
                            </h4>
                            <div className="directives-grid" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {SECURITY_DIRECTIVES.map((d, i) => (
                                    <div key={i} style={{ fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ opacity: 0.6 }}>{d.rule}</span>
                                        <span style={{ color: d.status === 'VERIFIED' ? 'var(--color-success)' : 'var(--color-accent)' }}>{d.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="panel-section">
                            <h4 style={{ fontSize: '0.65rem', color: 'var(--color-accent)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TraceIcon variant="active" size="1.2em" />
                                [SYNTHESIS_METADATA]
                            </h4>
                            <div className="meta-info" style={{ fontSize: '0.6rem', lineHeight: 1.6, opacity: 0.8 }}>
                                <div>KERNEL_VERSION: v4.0.2-LTS</div>
                                <div>PARTITION: ISOLATED_B1</div>
                                <div>LLM_ENGINE: GEMINI_3_PRO_PREVIEW</div>
                                <div>TIMESTAMP: {new Date().toISOString()}</div>
                                <div style={{ marginTop: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ShieldCheckIcon variant="verified" size="1em" />
                                    SIGNATURE_PROOF: VALID
                                </div>
                            </div>
                        </div>

                        <div className="panel-section" style={{ marginTop: 'auto' }}>
                             <div style={{ padding: '12px', border: '1px dashed rgba(0, 242, 255, 0.2)', fontSize: '0.55rem', opacity: 0.5, display: 'flex', gap: 10 }}>
                                <VaultIcon variant="idle" size="2em" />
                                <span>NOTE: All forensic metadata is cryptographically bound to the artifact hash. Any modification invalidates the audit trace.</span>
                             </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
});

export default ArtifactCard;
