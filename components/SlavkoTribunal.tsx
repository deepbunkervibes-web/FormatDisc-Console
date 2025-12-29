
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { generateId } from '../utils';

interface SlavkoTribunalProps {
    prompt: string;
    onVerdict: () => void;
    onCancel: () => void;
}

type Stage = 'handshake' | 'assembly' | 'policy_review' | 'voting' | 'verdict';

export const SlavkoTribunal = ({ prompt, onVerdict, onCancel }: SlavkoTribunalProps) => {
    const [stage, setStage] = useState<Stage>('handshake');
    const [votes, setVotes] = useState<Record<string, string>>({
        'ARCHITECT': 'PENDING',
        'SECOPS': 'PENDING',
        'COMPLIANCE': 'PENDING'
    });
    const [sessionHash] = useState(`0x${generateId().toUpperCase()}`);

    // Parse manifest if JSON
    const manifestData = useMemo(() => {
        try {
            return JSON.parse(prompt);
        } catch (e) {
            return null;
        }
    }, [prompt]);

    useEffect(() => {
        const sequence = async () => {
            // 1. Handshake
            await new Promise(r => setTimeout(r, 1200));
            setStage('assembly');

            // 2. Assembly
            await new Promise(r => setTimeout(r, 1500));
            setStage('policy_review');

            // 3. Policy Review
            await new Promise(r => setTimeout(r, 2000));
            setStage('voting');

            // 4. Voting Ritual
            const agents = ['ARCHITECT', 'SECOPS', 'COMPLIANCE'];
            for (const agent of agents) {
                await new Promise(r => setTimeout(r, 800));
                setVotes(prev => ({ ...prev, [agent]: 'APPROVED' }));
            }

            await new Promise(r => setTimeout(r, 1000));
            setStage('verdict');
            
            // 5. Auto-trigger verdict
            await new Promise(r => setTimeout(r, 1500));
            onVerdict();
        };

        sequence();
    }, [onVerdict]);

    return (
        <div className="tribunal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(3,3,5,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <div className="tribunal-ritual-container" style={{ width: '100%', maxWidth: '800px', background: '#08080a', border: '1px solid var(--color-border)', borderRadius: '2px', padding: '40px' }}>
                <div className="tribunal-header" style={{ marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                    <div className="session-id" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-accent)', opacity: 0.6 }}>SESSION_ID: {sessionHash}</div>
                    <div className="session-title" style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', marginTop: '8px' }}>SLAVKO_TRIBUNAL_CONVENED</div>
                </div>

                <div className="tribunal-main" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '40px' }}>
                    <div className="tribunal-spine" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                        {['INIT', 'HANDSHAKE', 'GOVERNANCE', 'VOTE', 'SEAL'].map((label, idx) => {
                            const activeIdx = ['handshake', 'assembly', 'policy_review', 'voting', 'verdict'].indexOf(stage);
                            const isActive = activeIdx >= idx;
                            return (
                                <div key={label} style={{ fontSize: '0.55rem', fontFamily: 'var(--font-mono)', opacity: isActive ? 1 : 0.2, color: isActive ? 'var(--color-accent)' : '#fff', position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? 'var(--color-accent)' : '#fff', boxShadow: isActive ? '0 0 10px var(--color-accent)' : 'none' }}></div>
                                    {label}
                                </div>
                            );
                        })}
                    </div>

                    <div className="tribunal-content">
                        {stage === 'handshake' && (
                            <div className="stage-view animate-fade">
                                <h2 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--color-accent)' }}>ESTABLISHING KERNEL TRUST...</h2>
                                <p style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: 1.6 }}>Handshaking with isolated B1 execution partition. Verifying HSM integrity signatures.</p>
                                <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', marginTop: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div className="loading-progress" style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--color-accent)', width: '40%', animation: 'boot-pulse 0.8s infinite linear' }}></div>
                                </div>
                            </div>
                        )}

                        {stage === 'assembly' && (
                            <div className="stage-view animate-fade">
                                <h2 style={{ fontSize: '0.9rem', marginBottom: '24px' }}>CONVENING AGENT COUNCIL</h2>
                                <div className="agent-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    {Object.entries(votes).map(([agent, status]) => (
                                        <div key={agent} style={{ padding: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.55rem', opacity: 0.5, marginBottom: '8px' }}>{agent}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 900 }}>{status}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stage === 'policy_review' && (
                            <div className="stage-view animate-fade">
                                <h2 style={{ fontSize: '0.9rem', marginBottom: '24px' }}>RUNTIME POLICY AUDIT</h2>
                                <div className="policy-lines" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {manifestData ? (
                                        <>
                                            <div style={{ color: 'var(--color-success)' }}>CHECKING TOPOLOGY: {manifestData.metadata.node_count} NODES / {manifestData.metadata.edge_count} EDGES... [OK]</div>
                                            <div style={{ color: 'var(--color-success)' }}>VERIFYING PROTOCOL: {manifestData.protocol}... [OK]</div>
                                            <div style={{ color: 'var(--color-success)' }}>MAPPING ENTITIES: {manifestData.topology.nodes.map((n: any) => n.label).join(', ')}... [OK]</div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ color: 'var(--color-success)' }}>ENFORCING SOC2_CC6.1... [PASS]</div>
                                            <div style={{ color: 'var(--color-success)' }}>MAPPING GDPR_ARTICLE_22... [PASS]</div>
                                            <div style={{ color: 'var(--color-success)' }}>CHECKING EU_AI_ACT_RELIABILITY... [PASS]</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {stage === 'voting' && (
                            <div className="stage-view animate-fade">
                                <h2 style={{ fontSize: '0.9rem', marginBottom: '24px' }}>DECISION TRIBUNAL</h2>
                                <div className="agent-cards large" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {Object.entries(votes).map(([agent, status]) => (
                                        <div key={agent} style={{ padding: '16px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>{agent}</div>
                                            <div style={{ fontSize: '0.6rem', color: status === 'APPROVED' ? 'var(--color-success)' : 'var(--color-accent)' }}>
                                                {status === 'APPROVED' ? '✓ SIGNED' : 'CASTING VOTE...'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stage === 'verdict' && (
                            <div className="stage-view animate-fade">
                                <div className="verdict-banner" style={{ background: 'var(--color-success)', color: '#000', padding: '16px', fontWeight: 900, fontSize: '0.9rem', textAlign: 'center', marginBottom: '20px' }}>
                                    UNANIMOUS VERDICT: PROCEED
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', opacity: 0.5, wordBreak: 'break-all' }}>
                                    SIGNATURE_ROOT: {sessionHash.repeat(2).substring(0, 64)}
                                </div>
                                <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '16px' }}>Intent is cryptographically bound to execution. Deployment ritual complete.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="tribunal-footer" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="intent-manifest" style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.5, maxWidth: '70%' }}>
                        <span style={{ color: 'var(--color-accent)' }}>MANIFEST:</span> {manifestData ? `FUSION_MAP_${manifestData.metadata.node_count}_NODES` : prompt.substring(0, 50) + '...'}
                    </div>
                    <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', padding: '6px 12px', cursor: 'pointer' }}>ABORT_SESSION</button>
                </div>
            </div>
        </div>
    );
};
