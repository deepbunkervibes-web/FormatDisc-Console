
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { KernelIcon, SparklesIcon, ThinkingIcon } from './Icons';
import { generateId } from '../utils';

interface GovernanceProfile {
  id: string;
  name: string;
  description: string;
  standards: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'STRICT' | 'MAX';
  features: string[];
}

const PROFILES: GovernanceProfile[] = [
  {
    id: 'fintech-strict',
    name: 'FINTECH_STRICT',
    description: 'Tier-1 Banking Compliance. Full ledger immutability and manual CISO gates.',
    standards: ['SOC2 Type II', 'PCI-DSS', 'GDPR'],
    riskLevel: 'STRICT',
    features: ['Double-signed intents', 'HSM-only keys', 'Temporal Replay']
  },
  {
    id: 'healthcare-hil',
    name: 'HEALTHCARE_HIL',
    description: 'Human-in-the-loop diagnostic governance for medical AI applications.',
    standards: ['HIPAA', 'ISO 27001', 'EU AI Act'],
    riskLevel: 'MAX',
    features: ['Audit-ready trace', 'PII Masking', 'Clinical Overrides']
  },
  {
    id: 'public-sector',
    name: 'PUBLIC_SECTOR_GOV',
    description: 'Standard government-grade security for administrative automation.',
    standards: ['FedRAMP', 'NIST 800-53'],
    riskLevel: 'MEDIUM',
    features: ['Open-data compliance', 'Cross-agency ledger', 'Auto-report']
  }
];

interface SlavkoScoreProps {
  onDeploy: (manifest: string) => void;
  isLoading: boolean;
}

export const SlavkoScoreCards = ({ onDeploy, isLoading }: SlavkoScoreProps) => {
  const [activeProfile, setActiveProfile] = useState<string | null>(null);

  const handleDeploy = (profile: GovernanceProfile) => {
    setActiveProfile(profile.id);
    
    const manifest = `
score_manifest:
  version: "2.5"
  profile: "${profile.name}"
  risk_tolerance: "${profile.riskLevel}"
  governance_lock: true
  seal: "0x${generateId().toUpperCase()}"
    `.trim();

    onDeploy(manifest);
  };

  return (
    <div className="score-workspace stagger-1">
      <div className="score-header">
        <h2 className="score-title">Locked Governance Profiles</h2>
        <p className="score-subtitle">Select a regulator-approved template for instant, cryptographically-binding deployment.</p>
      </div>

      <div className="score-grid">
        {PROFILES.map((profile) => (
          <div key={profile.id} className={`score-card ${activeProfile === profile.id ? 'active' : ''}`}>
            <div className="score-card-header">
              <span className={`risk-badge risk-${profile.riskLevel.toLowerCase()}`}>{profile.riskLevel}</span>
              <div className="standards-group">
                {profile.standards.map(s => <span key={s} className="standard-tag">{s}</span>)}
              </div>
            </div>
            
            <div className="score-card-body">
              <h3 className="profile-name">{profile.name}</h3>
              <p className="profile-desc">{profile.description}</p>
              
              <div className="features-list">
                {profile.features.map(f => (
                  <div key={f} className="feature-item">
                    <div className="check-dot"></div> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="score-card-footer">
              <button 
                className="surprise-button primary deploy-action" 
                onClick={() => handleDeploy(profile)}
                disabled={isLoading}
              >
                {isLoading && activeProfile === profile.id ? (
                  <><ThinkingIcon /> SEALING...</>
                ) : (
                  <><KernelIcon /> ONE-CLICK DEPLOY</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="score-footer-note">
        <div className="system-indicator active blink"></div>
        <span>Awaiting Secure Handshake. All Score deployments are legally and technically non-repudiable.</span>
      </div>
    </div>
  );
};
