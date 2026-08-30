# Custom Agent Directives & Security Instructions

## 1. Google Maps Platform Directive
- **Secure Key Retrieval & Storage**: Never hardcode Google Maps API keys in client or server files. Retrieve keys via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` on the frontend or `process.env.GOOGLE_MAPS_API_KEY` on the backend.
- **Prototyping vs Production**: Support zero-cost prototyping using the Google Maps Demo Key workflow (`https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio`). In production, restrict keys by HTTP referrer (Web) and designate allowed APIs (Maps JavaScript API, Places API New, Geocoding API).
- **React Implementation Standard**: Always use `@vis.gl/react-google-maps` for modern React integration. Pass `internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}` and configure `mapId="DEMO_MAP_ID"` when using `AdvancedMarkerElement`.
- **Zero Sourced Data Hallucination**: All geographic coordinates, place names, and addresses must strictly originate from Google Maps Platform APIs or direct user input.
- **CORS & Proxying**: Direct REST API calls to Google Maps services must be executed through server-side proxy routes to avoid browser CORS restrictions and keep API secrets secure.

## 2. Admin Roles & RBAC Directive
- **Zero Client Trust**: Never trust client-provided claims (such as `request.auth.token.role` or `body.isAdmin: true`). Validate administrative status strictly on the server or against verified Firestore collections (`exists(/databases/$(database)/documents/admins/$(request.auth.uid))`).
- **Bootstrapped Admin Integration**: Support verified runtime admin checks for configured administrator identities (`saraswatanurag04@gmail.com`).
- **Owner-Bound User Isolation**: Regular users may only read and write their own documents (`request.auth.uid == userId`). Admin endpoints (`/api/admin/*`) require server-side token verification and admin role assertion before granting elevated capabilities.
- **Audit Logging**: All administrative operations, system diagnostics, and elevated views must generate tamper-resistant audit logs tracking operator UID, timestamp, action type, and target resource.

## 3. External Notifications API Directive
- **Webhook & Credential Security**: Webhook endpoints (Slack incoming webhooks, Discord webhooks, email webhook relays) must be validated for URI format (`https://hooks.slack.com/...`, `https://discord.com/api/webhooks/...`) with strict SSRF prevention against private IP ranges (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.1`, `localhost`).
- **Payload Schema Enforcement**: Notification payloads must conform to structured schemas with pre-defined trigger filters (e.g., `celebratory`, `challenging`, `action_plan`, or tagged milestones). Content must be truncated and sanitized before dispatch.
- **Resilient Delivery & Error Escalation**: Catch all network failures, rate limits (HTTP 429), and delivery rejections. Surface actionable feedback to the user interface without crashing or blocking journal saves.
