/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheckIcon, WarningIcon, VaultIcon, TraceIcon, InspectionIcon, CodeIcon } from './Icons';
import type { AssetVerificationReceipt } from '../types';

interface AssetReceiptVaultProps {
    logToLedger: (type: string, details: string, metadata?: any) => Promise<void>;
}

type ReceiptMap = Record<string, AssetVerificationReceipt>;

export const AssetReceiptVault: React.FC<AssetReceiptVaultProps> = ({ logToLedger }) => {
    const [receipts, setReceipts] = useState<AssetVerificationReceipt[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'APPLIED' | 'REVOKED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const refreshReceipts = () => {
        try {
            const ledgerRaw = localStorage.getItem('slavko-kernel-ledger');
            const ledger = ledgerRaw ? JSON.parse(ledgerRaw) : [];
            
            const receiptMap: ReceiptMap = {};

            // Event Sourcing Reconstruction
            ledger.forEach((entry: any) => {
                if (entry.type === 'BRAND_ASSET_SYNTHESIS' && entry.metadata?.id) {
                    receiptMap[entry.metadata.id] = entry.metadata;
                } else if (entry.type === 'BRAND_ASSET_APPLIED' && entry.metadata?.id) {
                    if (receiptMap[entry.metadata.id]) {
                         receiptMap[entry.metadata.id] = {
                             ...receiptMap[entry.metadata.id],
                             status: 'APPLIED',
                             applicationTimestamp: entry.metadata.applicationTimestamp
                         };
                    }
                } else if (entry.type === 'BRAND_ASSET_REVOKED' && entry.metadata?.receiptId) {
                    const id = entry.metadata.receiptId;
                    if (receiptMap[id]) {
                        receiptMap[id] = {
                            ...receiptMap[id],
                            status: 'REVOKED'
                        };
                    }
                }
            });

            setReceipts(Object.values(receiptMap).reverse());
        } catch (e) {
            console.error("Failed to hydrate receipt vault", e);
        }
    };

    useEffect(() => {
        refreshReceipts();
        const interval = setInterval(refreshReceipts, 3000); // Auto-refresh for syncing
        return () => clearInterval(interval);
    }, []);

    const handleRevoke = async (receipt: AssetVerificationReceipt) => {
        if (!window.confirm(`CONFIRM REVOCATION:\n\nRevoking Receipt ID: ${receipt.id}\n\nThis action will permanently mark the asset as invalid in the ledger. Proceed?`)) return;

        await logToLedger('BRAND_ASSET_REVOKED', `Revoked asset verification receipt: ${receipt.id}`, {
            receiptId: receipt.id,
            reason: 'OPERATOR_MANUAL_OVERRIDE',
            revokedAt: new Date().toISOString()
        });
        
        refreshReceipts();
    };

    const filteredReceipts = useMemo(() => {
        let result = receipts;
        
        if (filter !== 'ALL') {
            result = result.filter(r => r.status === filter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r => 
                r.id.toLowerCase().includes(query) ||
                r.intent.toLowerCase().includes(query) ||
                r.assetFingerprint.toLowerCase().includes(query)
            );
        }

        return result;
    }, [receipts, filter, searchQuery]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'APPLIED': return 'var(--color-success)';
            case 'REVOKED': return 'var(--color-danger)';
            default: return 'var(--color-accent)';
        }
    };

    return (
        <div className="asset-receipt-vault animate-fade-in" style={{ padding: '0 8px' }}>
             <div className="vault-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                {(['ALL', 'ISSUED', 'APPLIED', 'REVOKED'] as const).map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            background: filter === f ? `rgba(255,255,255,0.05)` : 'transparent',
                            border: `1px solid ${filter === f ? getStatusColor(f === 'ALL' ? 'ISSUED' : f) : 'rgba(255,255,255,0.1)'}`,
                            color: filter === f ? getStatusColor(f === 'ALL' ? 'ISSUED' : f) : 'var(--color-text-dim)',
                            fontSize: '0.65rem',
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            borderRadius: '2px',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--font-mono)'
                        }}
                    >
                        {f} <span style={{ opacity: 0.5, fontSize: '0.6em', marginLeft: 4 }}>[{receipts.filter(r => f === 'ALL' || r.status === f).length}]</span>
                    </button>
                ))}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', left: 10, opacity: 0.5, pointerEvents: 'none', display: 'flex' }}>
                             <InspectionIcon size="0.8em" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="SEARCH_HASH_OR_ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                padding: '6px 24px 6px 32px',
                                fontSize: '0.6rem',
                                fontFamily: 'var(--font-mono)',
                                width: '200px',
                                outline: 'none',
                                borderRadius: '2px'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="receipt-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {filteredReceipts.length === 0 && (
                     <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', border: '1px dashed var(--color-border)', borderRadius: 4, opacity: 0.5 }}>
                         <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>
                             [NO_ASSETS_MATCHING_CRITERIA]
                         </div>
                     </div>
                )}
                {filteredReceipts.map(receipt => (
                    <div key={receipt.id} className="receipt-card" style={{ 
                        background: 'linear-gradient(180deg, rgba(10,10,12,0.8) 0%, rgba(5,5,7,0.95) 100%)', 
                        border: `1px solid ${getStatusColor(receipt.status)}`,
                        padding: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: receipt.status === 'REVOKED' ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                    }}>
                        {/* Header */}
                        <div style={{ 
                            padding: '12px 16px', 
                            background: `linear-gradient(90deg, ${getStatusColor(receipt.status)}15, transparent)`,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {receipt.status === 'REVOKED' ? <WarningIcon variant="alert" size="1em" /> : <ShieldCheckIcon variant={receipt.status === 'APPLIED' ? 'verified' : 'active'} size="1em" />}
                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: getStatusColor(receipt.status), letterSpacing: '1px' }}>
                                    {receipt.status}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.55rem', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>{receipt.id}</span>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '16px', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: '0.5rem', color: 'var(--color-text-dim)', marginBottom: 2 }}>INTENT_MANIFEST</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{receipt.intent}</div>
                                </div>
                                
                                <div>
                                    <div style={{ fontSize: '0.5rem', color: 'var(--color-text-dim)', marginBottom: 2 }}>ASSET_FINGERPRINT (SHA-256)</div>
                                    <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                                        {receipt.assetFingerprint}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div>
                                        <div style={{ fontSize: '0.5rem', color: 'var(--color-text-dim)', marginBottom: 2 }}>ISSUED_AT</div>
                                        <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)' }}>{new Date(receipt.signedMetadata.timestamp).toLocaleDateString()}</div>
                                    </div>
                                    {receipt.applicationTimestamp && (
                                        <div>
                                            <div style={{ fontSize: '0.5rem', color: 'var(--color-success)', marginBottom: 2 }}>APPLIED_AT</div>
                                            <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>{new Date(receipt.applicationTimestamp).toLocaleDateString()}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === receipt.id && (
                                <div className="animate-fade-in" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '0.5rem', color: 'var(--color-text-dim)', marginBottom: 8 }}>CRYPTOGRAPHIC_PROOF_CHAIN</div>
                                    <pre style={{ 
                                        background: 'rgba(0,0,0,0.5)', 
                                        padding: 8, 
                                        fontSize: '0.5rem', 
                                        overflowX: 'auto', 
                                        color: 'var(--color-text-secondary)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {JSON.stringify(receipt.signedMetadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ 
                            padding: '12px 16px', 
                            background: 'rgba(0,0,0,0.2)', 
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            gap: 8
                        }}>
                             <button 
                                onClick={() => setExpandedId(expandedId === receipt.id ? null : receipt.id)}
                                style={{ 
                                    flex: 1,
                                    background: 'transparent', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: 'var(--color-text-dim)', 
                                    padding: '6px', 
                                    fontSize: '0.6rem', 
                                    fontWeight: 700, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6
                                }}
                            >
                                <CodeIcon size="1em" /> {expandedId === receipt.id ? 'HIDE_PROOF' : 'VIEW_PROOF'}
                            </button>

                            {receipt.status !== 'REVOKED' && (
                                <button 
                                    onClick={() => handleRevoke(receipt)}
                                    style={{ 
                                        flex: 1,
                                        background: 'rgba(255, 77, 77, 0.05)', 
                                        border: '1px solid var(--color-danger)', 
                                        color: 'var(--color-danger)', 
                                        padding: '6px', 
                                        fontSize: '0.6rem', 
                                        fontWeight: 700, 
                                        cursor: 'pointer'
                                    }}
                                >
                                    REVOKE_ASSET
                                </button>
                            )}
                        </div>

                        {receipt.status === 'REVOKED' && (
                             <div style={{ 
                                 position: 'absolute', 
                                 top: '50%', 
                                 left: '50%', 
                                 transform: 'translate(-50%, -50%) rotate(-15deg)', 
                                 border: '4px double var(--color-danger)',
                                 padding: '8px 16px',
                                 color: 'var(--color-danger)',
                                 fontSize: '1.5rem',
                                 fontWeight: 900,
                                 opacity: 0.3,
                                 pointerEvents: 'none',
                                 letterSpacing: '4px'
                             }}>
                                 REVOKED
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};