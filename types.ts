/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Artifact {
  id: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface Session {
    id: string;
    prompt: string;
    timestamp: number;
    artifacts: Artifact[];
}

export interface ComponentVariation { name: string; html: string; }
export interface LayoutOption { name: string; css: string; previewHtml: string; }

export interface SignedMetadata {
  model: string;
  signatureRoot: string;
  ledgerHeight: string;
  timestamp: string;
}

export interface AssetVerificationReceipt {
  id: string;
  assetFingerprint: string;
  intent: string;
  signedMetadata: SignedMetadata;
  status: 'ISSUED' | 'APPLIED' | 'REVOKED';
  applicationTimestamp?: string;
}
