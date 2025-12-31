
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheckIcon, WarningIcon, VaultIcon, TraceIcon, InspectionIcon, ActivityIcon } from './Icons';
import type { InterceptionLog } from '../telemetry/types';
import { AssetReceiptVault } from './AssetReceiptVault';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LedgerEntry {
    height: string;
    type: string;
    timestamp: number;
    hash: string;
    details: string;
    metadata?: any;
    interception?: InterceptionLog;
}

interface ForensicLedgerProps {
    logToLedger: (type: string, details: string, metadata?: any) => Promise<void>;
}

// Fix: Define a flexible interface for daily count entries to correctly handle string 'date' and number event types.
interface DailyCountEntry {
    date: string;
    [eventType: string]: number | string; // Allow string for 'date' and number for other event types
}

export const ForensicLedger: React.FC<ForensicLedgerProps> = ({ logToLedger }) => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'SYSTEM' | 'VENDORS' | 'ASSETS' | 'ANALYTICS'>('SYSTEM'); // Added 'ANALYTICS'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Hydrate search preference
        const savedSearch = localStorage.getItem('slavko-ledger-search');
        if (savedSearch) setSearchQuery(savedSearch);

        const loadLedger = () => {
             const stored = localStorage.getItem('slavko-kernel-ledger');
            if (stored) {
                setEntries(JSON.parse(stored).reverse());
            } else {
                const bootEntries: LedgerEntry[] = [
                    {
                        height: '0x0001',
                        type: 'KERNEL_BOOT',
                        timestamp: Date.now() - 5000,
                        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                        details: 'System partition initialized. B1 integrity verified.'
                    }
                ];
                setEntries(bootEntries);
            }
        };

        loadLedger();
        // Simple polling to keep ledger view fresh
        const interval = setInterval(loadLedger, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        localStorage.setItem('slavko-ledger-search', val);
    };

    const clearSearch = () => {
        setSearchQuery('');
        localStorage.removeItem('slavko-ledger-search');
    };

    const filteredEntries = useMemo(() => {
        const keywords = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);

        return entries.filter(e => {
            const matchesTab = activeTab === 'VENDORS' ? (e.type.includes('VENDOR') || !!e.interception) : (!e.type.includes('VENDOR') && !e.interception);
            
            if (!matchesTab) return false;
            
            if (keywords.length === 0) return true;

            const searchableText = [
                e.height,
                e.type,
                e.hash,
                e.details,
                e.interception?.verdict || '',
                e.interception?.vendor || '',
                JSON.stringify(e.metadata || '') // Include metadata in search
            ].join(' ').toLowerCase();

            // All keywords must be present (AND logic)
            return keywords.every(keyword => searchableText.includes(keyword));
        });
    }, [entries, activeTab, searchQuery]);

    // Data transformation for Recharts
    const processedChartData = useMemo(() => {
        // Fix: Use the new DailyCountEntry interface for `dailyCounts`.
        const dailyCounts: { [key: string]: DailyCountEntry } = {};

        entries.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
            if (!dailyCounts[date]) {
                // Fix: Initialize with the 'date' property. Other event type properties will be added as numbers.
                dailyCounts[date] = { date };
            }
            // The index signature '[eventType: string]: number | string' allows this assignment for specific event types.
            dailyCounts[date][entry.type] = (dailyCounts[date][entry.type] as number || 0) + 1;
        });

        // Sort by date
        const sortedDates = Object.keys(dailyCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        return sortedDates.map(date => dailyCounts[date]);
    }, [entries]);

    const chartLineTypes = [
        { key: 'KERNEL_BOOT', color: 'var(--color-accent)' },
        { key: 'ARTIFACT_DEPLOY', color: 'var(--color-success)' },
        { key: 'VENDOR_INTERCEPTION', color: 'var(--color-danger)' },
        { key: 'BRAND_ASSET_SYNTHESIS', color: '#ffb84d' }, // Orange/Warning
        { key: 'BRAND_ASSET_APPLIED', color: '#00ff9d' }, // Green/Success
        { key: 'BRAND_ASSET_REVOKED', color: '#ff4d4d' }, // Red/Danger
        { key: 'FEEDBACK_BUG', color: '#e74c3c' }, // Bug specific red
        { key: 'FEEDBACK_FEATURE', color: '#3498db' }, // Feature specific blue
    ];

    return (
        <div className="forensic-ledger">
            <header className="ledger-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                <div className="ledger-title-group">
                    <ShieldCheckIcon />
                    <h2>B3 // IMMUTABLE_VAULT</h2>
                </div>
                <div className="ledger-tabs" style={{ display: 'flex', gap: 12 }}>
                    <button 
                        onClick={() => setActiveTab('SYSTEM')} 
                        style={{ background: 'transparent', border: 'none', color: activeTab === 'SYSTEM' ? 'var(--color-accent)' : 'var(--color-text-dim)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                    >
                        SYSTEM_OPS
                    </button>
                    <button 
                        onClick={() => setActiveTab('VENDORS')} 
                        style={{ background: 'transparent', border: 'none', color: activeTab === 'VENDORS' ? 'var(--color-danger)' : 'var(--color-text-dim)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                    >
                        OPACITY_INTERCEPTIONS
                    </button>
                    <button 
                        onClick={() => setActiveTab('ASSETS')} 
                        style={{ background: 'transparent', border: 'none', color: activeTab === 'ASSETS' ? 'var(--color-success)' : 'var(--color-text-dim)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <VaultIcon size="1em" variant={activeTab === 'ASSETS' ? 'verified' : 'idle'} /> ASSET_RECEIPTS
                    </button>
                    <button 
                        onClick={() => setActiveTab('ANALYTICS')} 
                        style={{ background: 'transparent', border: 'none', color: activeTab === 'ANALYTICS' ? 'var(--color-accent)' : 'var(--color-text-dim)', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <ActivityIcon size="1em" variant={activeTab === 'ANALYTICS' ? 'active' : 'idle'} /> ANALYTICS
                    </button>
                </div>

                {activeTab !== 'ASSETS' && activeTab !== 'ANALYTICS' && (
                    <div className="ledger-search" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                         <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <div style={{ position: 'absolute', left: 10, opacity: 0.5, pointerEvents: 'none', display: 'flex' }}>
                                 <InspectionIcon size="0.8em" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="SEARCH_LEDGER..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    padding: '6px 12px 6px 32px',
                                    fontSize: '0.6rem',
                                    fontFamily: 'var(--font-mono)',
                                    width: '200px',
                                    outline: 'none',
                                    borderRadius: '2px'
                                }}
                            />
                        </div>
                        {searchQuery && (
                            <button 
                                onClick={clearSearch}
                                title="CLEAR_FILTER"
                                style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid var(--color-border)', 
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.6rem',
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    borderRadius: '2px'
                                }}
                            >
                                CLR
                            </button>
                        )}
                    </div>
                )}

                <div className="ledger-telemetry" style={{ marginLeft: (activeTab === 'ASSETS' || activeTab === 'ANALYTICS' || !searchQuery) ? 'auto' : '12px' }}>
                    BLOCK_HEIGHT: <span className="highlight">0x{entries.length.toString(16).padStart(4, '0')}</span>
                </div>
            </header>

            {activeTab === 'ASSETS' ? (
                <div style={{ marginTop: 24 }}>
                    <AssetReceiptVault logToLedger={logToLedger} />
                </div>
            ) : activeTab === 'ANALYTICS' ? (
                <div className="ledger-analytics" style={{ padding: '24px', background: '#0a0a0c', border: '1px solid var(--color-border)', borderRadius: '4px', marginTop: '24px', height: '500px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '16px', letterSpacing: '1px' }}>
                        LEDGER_EVENT_FREQUENCY_OVER_TIME
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={processedChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="var(--color-text-dim)" fontSize="0.65rem" />
                            <YAxis stroke="var(--color-text-dim)" fontSize="0.65rem" />
                            <Tooltip 
                                contentStyle={{ background: '#0a0a0c', border: '1px solid var(--color-border)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}
                                itemStyle={{ color: 'white' }}
                            />
                            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', paddingTop: '10px' }} />
                            {chartLineTypes.map((line) => (
                                <Line 
                                    key={line.key} 
                                    type="monotone" 
                                    dataKey={line.key} 
                                    stroke={line.color} 
                                    activeDot={{ r: 8 }} 
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="ledger-stream">
                    {filteredEntries.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                            {searchQuery ? '[NO_ENTRIES_MATCH_QUERY]' : '[NO_ENTRIES_RECORDED_IN_CURRENT_WINDOW]'}
                        </div>
                    )}
                    {filteredEntries.map((entry) => (
                        <div 
                            key={entry.height} 
                            className={`ledger-block ${expandedId === entry.height ? 'expanded' : ''} ${entry.type.includes('VENDOR') || entry.interception ? 'block-danger' : ''}`}
                            onClick={() => setExpandedId(expandedId === entry.height ? null : entry.height)}
                        >
                            <div className="block-meta">
                                <span className="block-height">{entry.height}</span>
                                <span className="block-type flex items-center gap-2">
                                    {(entry.type.includes('VENDOR') || entry.interception) && <WarningIcon size="1em" variant="alert" />}
                                    {entry.type}
                                </span>
                                <span className="block-time">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="block-signature">
                                <span className="label">SHA256:</span>
                                <span className="hash-value">{entry.hash.substring(0, 32)}...</span>
                            </div>

                            {expandedId === entry.height && (
                                <div className="block-details animate-fade">
                                    <div className="details-content">
                                        <div className="detail-row">
                                            <span className="label">TIMESTAMP:</span>
                                            <span>{new Date(entry.timestamp).toISOString()}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">MANIFEST:</span>
                                            <p>{entry.details}</p>
                                        </div>
                                        
                                        {entry.interception && (
                                            <div className="interception-payload mt-4 p-4 bg-black border border-red-500/20">
                                                <div className="text-[0.6rem] text-red-500 font-bold mb-2 uppercase tracking-widest">SOVEREIGN_AUDIT_DATA</div>
                                                <div className="grid grid-cols-2 gap-4 text-[0.6rem]">
                                                    <div>VERDICT: <span className="text-white font-bold">{entry.interception.verdict}</span></div>
                                                    <div>OPACITY_SCORE: <span className="text-white font-bold">{entry.interception.opacityProfile.opacityScore}</span></div>
                                                    <div className="col-span-2 opacity-60">NON_REPUDIATION_HASH: {entry.interception.nonRepudiationHash}</div>
                                                </div>
                                            </div>
                                        )}

                                        {entry.metadata && !entry.interception && (
                                            <div className="detail-row">
                                                <span className="label">METADATA:</span>
                                                <pre className="text-[0.55rem] bg-black/40 p-2">{JSON.stringify(entry.metadata, null, 2)}</pre>
                                            </div>
                                        )}
                                        <div className="seal-status">
                                            <ShieldCheckIcon /> SEALED_BY_KERNEL_B3
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};