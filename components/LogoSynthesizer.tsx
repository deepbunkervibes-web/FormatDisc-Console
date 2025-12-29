/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { BrushIcon, ThinkingIcon, ShieldCheckIcon } from './Icons';
import { requestKernelSynthesis } from '../kernel-adapter';
import type { SignedMetadata, AssetVerificationReceipt } from '../types';
import { generateId, computeHash } from '../utils';

interface LogoSynthesizerProps {
  onApply: (logoUrl: string) => void;
  logToLedger: (type: string, details: string, metadata?: any) => Promise<void>;
}

export const LogoSynthesizer: React.FC<LogoSynthesizerProps> = ({ onApply, logToLedger }) => {
  const [selectedIntent, setSelectedIntent] = useState<string>('professional_minimalist');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SignedMetadata | null>(null);
  const [receipt, setReceipt] = useState<AssetVerificationReceipt | null>(null);

  const intents = [
    'professional_minimalist',
    'enterprise_sleek',
    'ai_generation_theme',
    'vector_simplistic',
    'dark_cyber_aesthetic'
  ];

  const handleSynthesize = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setMetadata(null);
    setGeneratedImage(null);
    setReceipt(null);
    try {
      const result = await requestKernelSynthesis(selectedIntent);
      setGeneratedImage(result.imageUrl);
      setMetadata(result.signedMetadata);

      // Asset Verification Receipt Schema Formalization
      const imageData = result.imageUrl.split(',')[1];
      const assetFingerprint = await computeHash(imageData);

      const newReceipt: AssetVerificationReceipt = {
        id: `RECEIPT_${generateId().toUpperCase()}`,
        assetFingerprint,
        intent: selectedIntent,
        signedMetadata: result.signedMetadata,
        status: 'ISSUED',
      };
      setReceipt(newReceipt);

      // ForensicLedger Extension
      await logToLedger('BRAND_ASSET_SYNTHESIS', `Intent: ${selectedIntent}`, newReceipt);

    } catch (e) {
      console.error('Kernel Synthesis Failed', e);
      alert('SYNTHESIS_ERROR: Check kernel integrity and network.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = async () => {
    if (generatedImage && receipt) {
        const appliedReceipt: AssetVerificationReceipt = {
            ...receipt,
            status: 'APPLIED',
            applicationTimestamp: new Date().toISOString()
        };

        await logToLedger(
            'BRAND_ASSET_APPLIED',
            `Applied asset with fingerprint: ${receipt.assetFingerprint.substring(0,16)}...`,
            appliedReceipt
        );

        onApply(generatedImage);
    }
  };

  return (
    <div className="logo-synthesizer" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'var(--font-mono)' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--color-accent)' }}>
        BRAND_IDENTITY_SYNTHESIZER
      </h2>
      <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '8px', marginBottom: '32px' }}>
        Select a pre-approved intent manifest to synthesize a brand asset via the sovereign kernel.
      </p>

      <div style={{ margin: '24px 0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {intents.map(intent => (
          <button
            key={intent}
            onClick={() => setSelectedIntent(intent)}
            className="intent-chip"
            style={{
              padding: '8px 16px',
              borderRadius: 2,
              border: selectedIntent === intent ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
              background: selectedIntent === intent ? 'rgba(0, 242, 255, 0.05)' : 'rgba(255,255,255,0.03)',
              color: selectedIntent === intent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            {intent.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <button
        onClick={handleSynthesize}
        disabled={isGenerating}
        className="feedback-submit-btn"
        style={{ width: '100%', marginTop: '12px' }}
      >
        {isGenerating ? <><ThinkingIcon size="1.2em" variant="active" /> KERNEL_PROCESSING...</> : <><BrushIcon size="1.2em" /> REQUEST_SYNTHESIS</>}
      </button>

      <div className="preview" style={{ marginTop: 24, position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000', border: '1px solid var(--color-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="crt-overlay" />
        {generatedImage ? (
          <img src={generatedImage} alt="Synthesized Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : !isGenerating && (
          <div style={{ opacity: 0.2, textAlign: 'center' }}>
            <BrushIcon size="4em" />
            <div style={{ fontSize: '0.6rem', marginTop: 12 }}>AWAITING_SYNTHESIS</div>
          </div>
        )}
      </div>

      {metadata && receipt && (
        <div className="forensic-metadata animate-fade-up" style={{ marginTop: 20, padding: 16, background: 'rgba(0,242,255,0.03)', border: '1px solid rgba(0,242,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-success)', marginBottom: 12 }}>
            <ShieldCheckIcon size="1.2em" />
            <span style={{ fontWeight: 900, fontSize: '0.65rem' }}>ASSET_VERIFICATION_RECEIPT</span>
          </div>
          <div style={{ fontSize: '0.55rem', display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, opacity: 0.8 }}>
            <span>RECEIPT_ID:</span> <span>{receipt.id}</span>
            <span>FINGERPRINT:</span> <span style={{ wordBreak: 'break-all' }}>{receipt.assetFingerprint}</span>
            <span>MODEL:</span> <span>{metadata.model}</span>
            <span>ROOT_HASH:</span> <span style={{ wordBreak: 'break-all' }}>{metadata.signatureRoot}</span>
            <span>LEDGER_HEIGHT:</span> <span>{metadata.ledgerHeight}</span>
            <span>TIMESTAMP:</span> <span>{metadata.timestamp}</span>
          </div>
          <button 
            onClick={handleApply} 
            style={{ 
              width: '100%', 
              marginTop: '20px', 
              background: 'transparent', 
              color: 'var(--color-success)', 
              border: '1px solid var(--color-success)', 
              padding: '12px', 
              fontWeight: 900, 
              cursor: 'pointer',
              fontSize: '0.7rem'
            }}
          >
            APPLY_TO_FORMATDISC_SYSTEM
          </button>
        </div>
      )}
    </div>
  );
};