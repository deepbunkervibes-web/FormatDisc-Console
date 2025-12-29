/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

const CONSENT_KEY = "slavko-cookie-consent-v1";

export const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);
            if (!consent) {
                setVisible(true);
            }
        } catch (error) {
            console.error("Could not access localStorage:", error);
        }
    }, []);

    const accept = () => {
        try {
            localStorage.setItem(CONSENT_KEY, 'accepted');
            setVisible(false);
        } catch (error) {
            console.error("Could not set item in localStorage:", error);
            setVisible(false);
        }
    };
    
    const reject = () => {
        try {
            localStorage.setItem(CONSENT_KEY, 'rejected');
            setVisible(false);
        } catch (error) {
            console.error("Could not set item in localStorage:", error);
            setVisible(false);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <div className="cookie-consent-banner" role="dialog" aria-live="polite">
            <div className="cookie-consent-content">
                <p>This application uses only essential client-side storage. No tracking, profiling, or third-party analytics are enabled without consent.</p>
                <div className="cookie-consent-actions">
                    <button onClick={accept} className="mode-btn active">Accept</button>
                    <button onClick={reject} className="mode-btn">Reject</button>
                </div>
            </div>
        </div>
    );
};