# MindReflect AI — User-Authenticated Multi-Turn Reflection Assistant

MindReflect AI is a secure, full-stack reflection and journaling web application powered by **Gemini 3.6 Flash** and **Google Cloud Firestore**, protected by **Firebase Authentication** with complete per-user data isolation.

---

## 🌟 Key Features

1. **User Identity & Authentication**: Secure federated login via Google Sign-In with Firebase Auth. Passwords and emails are never directly stored in application code.
2. **Multi-Turn Conversational Journaling**: Interactive reflection workspace offering 5 distinct reflection modes:
   - **Deep Reflection**: Thoughtful, empathetic mirroring and inquiry.
   - **Brainstorming**: Divergent perspective expansion and creative idea generation.
   - **Daily Summary**: Key takeaway synthesis and lesson extraction.
   - **Action Steps**: Structured, high-impact gentle milestone checklists.
   - **Gratitude**: Mindful appreciation and grounded reflection.
3. **Resilient AI Fallback Ladder**: Built on `@google/genai` with a resilient multi-tier fallback ladder (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-pro` → `gemini-2.0-pro-exp-02-05`) catching transient error states (503, 429, 404, 500).
4. **Isolated Cloud Firestore Storage**: Owner-bound security rules ensure that all entries and interactions under `/users/{userId}/entries/{entryId}` are strictly readable and writable only by their authenticated creator.
5. **Insights & Habit Tracking**: Metrics on total reflections, word counts, tone/sentiment distributions, and top reflective tags.

---

## 🛡️ Agentic Threat Model (The 5 Threat Zones)

| Threat Zone | Identified Threat | Potential Impact | Implemented Mitigation | OWASP Reference |
| :--- | :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Prompt Injection / Malicious Multi-Turn Payloads | System persona bypass, tone manipulation | Inputs treated strictly as user data in system instruction; defensive parameter limits; null-safe deserialization. | OWASP LLM01 / A03:2021 |
| **2. Planning & Reasoning** | Service Outages / Rate Limits (429/503) | Application crashes during reflection | Automated multi-model fallback ladder (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-pro`); graceful error recovery. | OWASP LLM04 |
| **3. Tool Execution** | Command Injection & SSRF | Host compromise or network pivot | Zero dynamic code evaluation (`eval`/`child_process`); parameters sanitized via strict TypeScript interfaces. | OWASP A01 / A03 |
| **4. Memory & State** | Cross-User Data Leaks (IDOR) | User B reading or writing User A's entries | Owner-bound Firestore security rules (`request.auth.uid == userId`); payload undefined-stripping via `sanitizeForFirestore`. | OWASP A01:2021 |
| **5. Inter-System Comm.** | API Key Exposure | Unauthorized Gemini quota consumption | Zero client-side API keys; server-side Secret Manager / env var injection; Firebase federated identity. | OWASP A02 / LLM06 |

---

## 🔒 Firestore Security Rules

Deploy the following security rules to guarantee complete per-user isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Google Cloud Setup & Secret Manager Bindings

### 1. Prerequisites
Enable required Google Cloud APIs:
```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

### 2. Secret Manager Configuration
Store the Gemini API key securely in Secret Manager and grant Cloud Run runtime service account access:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 📦 Deployment to Google Cloud Run

### 1. Build and Deploy
```bash
# Deploy application container to Cloud Run
gcloud run deploy mindreflect-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### 2. Required Campaign Verification Binding
Apply the mandatory resource label to register the service for automated challenge verification:

```bash
gcloud run services update mindreflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🧪 Functional Stability & Walkthrough Test Matrix

| Test ID | Category | Process / Interaction | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-01** | **Authentication** | Click "Sign In with Google", complete Google OAuth popup | User profile displays in navbar; private reflection workspace loads. |
| **TC-02** | **Multi-Turn Chat** | Choose mode ("Deep Reflection"), input thought, click "Send to Gemini" | Gemini 3.6 Flash generates formatted empathetic reflection maintaining context. |
| **TC-03** | **AI Synthesis** | Click "AI Insights" button on an active reflection session | Auto-extracts title, sentiment tone, and summary takeaway with celebratory animation. |
| **TC-04** | **Persistence** | Click "Save Entry" / trigger auto-save | Sanitized data persists to `/users/{userId}/entries/{entryId}` in Firestore with green confirmation badge. |
| **TC-05** | **History & Search** | Navigate to "Past Entries", type search keyword, filter by tone | Real-time filtered grid displays entries; detail modal supports Markdown copying and deletion. |
| **TC-06** | **Isolation & Logout** | Click "Sign Out" | Session teardown occurs immediately; unauthenticated landing view is presented. |

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```
