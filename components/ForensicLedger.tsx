/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, WarningIcon, VaultIcon, InspectionIcon } from './Icons';
import type { InterceptionLog } from '../telemetry/types';
import { AssetReceiptVault } from './AssetReceiptVault';

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

export const ForensicLedger: React.FC<ForensicLedgerProps> = ({ logToLedger }) => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'SYSTEM' | 'VENDORS' | 'ASSETS'>('SYSTEM');
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

    const filteredEntries = entries.filter(e => {
        const matchesTab = activeTab === 'VENDORS' ? (e.type.includes('VENDOR') || !!e.interception) : (!e.type.includes('VENDOR') && !e.interception);
        
        if (!matchesTab) return false;
        
        if (!searchQuery) return true;

        const q = searchQuery.toLowerCase();
        return (
            e.height.toLowerCase().includes(q) ||
            e.type.toLowerCase().includes(q) ||
            e.hash.toLowerCase().includes(q) ||
            e.details.toLowerCase().includes(q) ||
            (e.interception && e.interception.verdict.toLowerCase().includes(q))
        );
    });

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
                </div>

                {activeTab !== 'ASSETS' && (
                    <div className="ledger-search" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
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
                    </div>
                )}

                <div className="ledger-telemetry" style={{ marginLeft: activeTab === 'ASSETS' || !searchQuery ? 'auto' : '12px' }}>
                    BLOCK_HEIGHT: <span className="highlight">0x{entries.length.toString(16).padStart(4, '0')}</span>
                </div>
            </header>

            {activeTab === 'ASSETS' ? (
                <div style={{ marginTop: 24 }}>
                    <AssetReceiptVault logToLedger={logToLedger} />
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
                                    <div className="