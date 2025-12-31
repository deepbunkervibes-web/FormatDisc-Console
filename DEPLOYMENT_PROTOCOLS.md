# SLAVKO_KERNEL // DEPLOYMENT_PROTOCOLS_v1.0
**CLASSIFICATION:** PUBLIC // OPERATIONAL GUIDE
**TARGET:** APEX 1.0 WEB DEPLOYMENT

---

## 1. INITIALIZATION_PHASE (Localhost)

Establish a secure local perimeter before pushing to the cloud.

### 1.1 Repository Extraction
```bash
git clone <REPOSITORY_URL>
cd slavkokernel
```

### 1.2 Dependency Injection
Hydrate the `node_modules` structure. Ensure strict version adherence.
```bash
npm install
```

### 1.3 Environment Configuration (CRITICAL)
Create the local environment secrets file. This file acts as the bridge to the Gemini 3 Neural Engine.
```bash
cp .env.example .env.local
# EDIT .env.local AND INSERT YOUR GEMINI API KEY
```

### 1.4 Kernel Boot
Ignite the development server to verify B1 integrity.
```bash
npm run dev
# Access: http://localhost:3000
```

---

## 2. PRODUCTION_DEPLOYMENT_PHASE (Cloud)

Recommended Target: **Vercel** (Zero-config for Vite/React) or **Netlify**.

### 2.1 Vercel Deployment Strategy
1.  **Push to Git**: Ensure your code is committed to a secure repository (GitHub/GitLab).
2.  **Import Project**: Log in to Vercel and "Add New Project".
3.  **Select Repository**: Choose the `slavkokernel` repo.
4.  **Configure Environment Variables**:
    *   **Key**: `API_KEY`
    *   **Value**: `[YOUR_GOOGLE_GEMINI_API_KEY]`
    *   *Note: Without this, the LogoSynthesizer and Tribunal modules will operate in mock/degraded mode.*
5.  **Deploy**: Click "Deploy". The build pipeline will execute `npm run build`.

### 2.2 Integrity Verification
Upon successful deployment, execute the following smoke tests:
1.  **Shell Access**: Type `status` in the terminal. Expect `[TELEMETRY] PARTITION_B1: STABLE`.
2.  **AI Handshake**: Run `slavko deploy test_intent`. Verify the Tribunal allows the request.
3.  **Forensics**: Check the "VAULT" tab. Ensure the deployment event was logged to the immutable ledger (localStorage).

---

## 3. AUDIT_AND_COMPLIANCE (CI/CD)

For enterprise-grade pipelines, integrate these checks before the build step:

```bash
# Verify type safety and kernel logic
npm run build 

# (Optional) Future implementation of automated compliance scans
# npm run compliance:scan
```

---

## 4. TROUBLESHOOTING_MATRIX

| SYMPTOM | PROBABLE CAUSE | REMEDIATION |
| :--- | :--- | :--- |
| **Boot Hangs on "KERNEL_INIT..."** | Missing dependencies or JS error. | Check console logs. Verify `node_modules`. |
| **AI Responds "Network Error"** | Invalid API Key or Quota Limit. | Verify `API_KEY` in Vercel settings. Check Google AI Studio quota. |
| **Ledger Empty** | LocalStorage blocked. | Disable "Incognito Mode" or strict tracking protection for the domain. |
| **Styling Broken** | CSS variable mismatch. | Ensure `index.css` is imported in `index.tsx`. |

---

**END_OF_FILE**
