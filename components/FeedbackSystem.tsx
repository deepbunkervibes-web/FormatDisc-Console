
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { generateId, computeHash } from '../utils';

type FeedbackType = 'bug' | 'feature';
type SeverityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type SubmissionStatus = 'idle' | 'processing' | 'success' | 'error_validation' | 'error_submission';

export const FeedbackSystem: React.FC = () => {
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
    const [description, setDescription] = useState<string>('');
    const [affectedComponent, setAffectedComponent] = useState<string>('');
    const [severity, setSeverity] = useState<SeverityType | ''>('');
    const [contactInfo, setContactInfo] = useState<string>('');
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
    const [lastFingerprint, setLastFingerprint] = useState<string | null>(null);

    const handleFeedbackTypeChange = (type: FeedbackType) => {
        setFeedbackType(type);
        setLastFingerprint(null);
        if (type === 'feature') {
            setSeverity('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validation Logic
        let validationFailed = false;
        if (!description.trim() || !affectedComponent.trim()) {
            validationFailed = true;
        }
        if (feedbackType === 'bug' && !severity.trim()) {
            validationFailed = true;
        }

        if (validationFailed) {
            setSubmissionStatus('error_validation');
            setTimeout(() => setSubmissionStatus('idle'), 3000);
            return;
        }

        setSubmissionStatus('processing');

        try {
            // 2. Build Base Manifest
            const baseEvent = {
                type: feedbackType,
                description: description.trim(),
                affectedComponent: affectedComponent.trim(),
                severity: feedbackType === 'bug' ? severity : null,
                contact: contactInfo.trim() || 'ANONYMOUS_OPERATOR',
            };

            // 3. Cryptographic Sealing
            // We stringify the base content to create a stable fingerprint
            const contentToHash = JSON.stringify(baseEvent);
            const fingerprint = await computeHash(contentToHash);

            // 4. Construct Final Audit Entry
            const auditEntry = {
                id: generateId(),
                ...baseEvent,
                timestamp: Date.now(),
                iso_timestamp: new Date().toISOString(),
                kernel_version: 'v4.0.2-LTS',
                manifest_version: '1.2.0',
                sha256_fingerprint: fingerprint,
                integrity_sealed: true
            };

            // 5. Commit to Local Ledger
            const ledgerKey = 'slavko-kernel-feedback';
            const existingLedger = JSON.parse(localStorage.getItem(ledgerKey) || '[]');
            existingLedger.push(auditEntry);
            localStorage.setItem(ledgerKey, JSON.stringify(existingLedger));

            // 6. Finalize UI State
            setLastFingerprint(fingerprint);
            setSubmissionStatus('success');
            
            // Clear inputs
            setDescription('');
            setAffectedComponent('');
            setSeverity('');
            setContactInfo('');
            
            // Return to idle after delay
            setTimeout(() => {
                setSubmissionStatus('idle');
                setLastFingerprint(null);
            }, 8000);

        } catch (error) {
            console.error("Ledger Commit Failure:", error);
            setSubmissionStatus('error_submission');
            setTimeout(() => setSubmissionStatus('idle'), 3000);
        }
    };

    const isSubmitDisabled = 
        submissionStatus === 'processing' || 
        submissionStatus === 'success' || 
        !description.trim() || 
        !affectedComponent.trim() || 
        (feedbackType === 'bug' && !severity.trim());

    return (
        <div className="feedback-system-container">
            <h2 className="feedback-title">SUBMIT_OPERATIONAL_REPORT</h2>
            <p className="feedback-subtitle">
                Initiating non-repudiable logging protocol. Every submission is cryptographically bound to the kernel ledger.
            </p>

            <form onSubmit={handleSubmit} className="feedback-form">
                <fieldset className="feedback-fieldset">
                    <label htmlFor="feedback-type" className="feedback-label">REPORT_TYPE:</label>
                    <div className="feedback-type-toggle">
                        <button
                            type="button"
                            className={`type-btn ${feedbackType === 'bug' ? 'active' : ''}`}
                            onClick={() => handleFeedbackTypeChange('bug')}
                            disabled={submissionStatus === 'processing'}
                        >
                            BUG_REPORT
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${feedbackType === 'feature' ? 'active' : ''}`}
                            onClick={() => handleFeedbackTypeChange('feature')}
                            disabled={submissionStatus === 'processing'}
                        >
                            FEATURE_REQUEST
                        </button>
                    </div>
                </fieldset>

                <fieldset className="feedback-fieldset">
                    <label htmlFor="affected-component" className="feedback-label">
                        AFFECTED_COMPONENT <span className="required-indicator">*</span>
                    </label>
                    <input
                        type="text"
                        id="affected-component"
                        className="feedback-input"
                        value={affectedComponent}
                        onChange={(e) => setAffectedComponent(e.target.value)}
                        placeholder="E.G., SHELL_TERMINAL, GRC_MODULE..."
                        required
                        disabled={submissionStatus === 'processing'}
                    />
                </fieldset>

                {feedbackType === 'bug' && (
                    <fieldset className="feedback-fieldset">
                        <label htmlFor="severity" className="feedback-label">
                            SEVERITY_LEVEL <span className="required-indicator">*</span>
                        </label>
                        <select
                            id="severity"
                            className="feedback-input"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as SeverityType)}
                            required
                            disabled={submissionStatus === 'processing'}
                        >
                            <option value="" disabled>SELECT_SEVERITY</option>
                            <option value="CRITICAL">CRITICAL [SYSTEM_HALT_RISK]</option>
                            <option value="HIGH">HIGH [FUNCTIONAL_DEGRADATION]</option>
                            <option value="MEDIUM">MEDIUM [ANOMALY_DETECTED]</option>
                            <option value="LOW">LOW [OPTIMIZATION_OPPORTUNITY]</option>
                        </select>
                    </fieldset>
                )}

                <fieldset className="feedback-fieldset">
                    <label htmlFor="description" className="feedback-label">
                        MANIFEST_DESCRIPTION <span className="required-indicator">*</span>
                    </label>
                    <textarea
                        id="description"
                        className="feedback-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="PROVIDE_DETAILED_FORENSIC_EVIDENCE..."
                        rows={5}
                        required
                        disabled={submissionStatus === 'processing'}
                    />
                </fieldset>

                <fieldset className="feedback-fieldset">
                    <label htmlFor="contact" className="feedback-label">OPERATOR_SIGNATURE (OPTIONAL):</label>
                    <input
                        type="text"
                        id="contact"
                        className="feedback-input"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="OPERATOR_ID_OR_AUDIT_EMAIL..."
                        disabled={submissionStatus === 'processing'}
                    />
                </fieldset>

                <button
                    type="submit"
                    className="feedback-submit-btn"
                    disabled={isSubmitDisabled}
                >
                    {submissionStatus === 'idle' && 'COMMIT_TO_LEDGER'}
                    {submissionStatus === 'processing' && 'CALCULATING_HASH...'}
                    {submissionStatus === 'success' && 'MANIFEST_COMMITTED'}
                    {(submissionStatus === 'error_validation' || submissionStatus === 'error_submission') && 'COMMIT_FAILED'}
                </button>

                {submissionStatus === 'success' && (
                    <div className="feedback-status success" role="status">
                        <div style={{ fontWeight: 900, marginBottom: '4px' }}>[VERIFIED]: Audit Trace Committed.</div>
                        <div style={{ fontSize: '0.55rem', opacity: 0.8, letterSpacing: '0.5px' }}>
                            FINGERPRINT: {lastFingerprint?.toUpperCase()}
                        </div>
                    </div>
                )}
                
                {submissionStatus === 'error_validation' && (
                    <p className="feedback-status error" role="status">
                        [ERROR]: INPUT_VALIDATION_FAILED. Mandatory directives missing.
                    </p>
                )}
                
                {submissionStatus === 'error_submission' && (
                    <p className="feedback-status error" role="status">
                        [ERROR]: SYSTEM_INTEGRITY_ERROR. Ledger write operation aborted.
                    </p>
                )}
            </form>
        </div>
    );
};
