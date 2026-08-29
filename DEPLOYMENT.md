# Deployment & Infrastructure Guide

## 1. Cloudflare for SaaS (Custom Hostnames)

To enable custom white-label client domains (e.g. `portal.blackwoodcap.com` &rarr; `unykorn-fabric.pages.dev`):

1. **Cloudflare Dashboard** &rarr; SSL/TLS &rarr; Custom Hostnames.
2. Add Fallback Origin: `enterprise.unykorn.ai`.
3. Client configures DNS CNAME:
   ```dns
   CNAME portal.blackwoodcap.com -> fallback.unykorn.ai
   TXT _cf-custom-hostname.portal.blackwoodcap.com -> [verification_token]
   ```
4. SSL certificates are provisioned automatically at the edge in `< 90 seconds`.

---

## 2. PostgreSQL Setup & Migration

```bash
# Connect to PostgreSQL instance
psql -U postgres -d unykorn_fabric -f POSTGRES_SCHEMA.sql
```

---

## 3. Node.js Backend API Service

```bash
cd server
npm install
npm start
```

Default port: `8905`. API health endpoint: `GET /api/v1/tenant/current`.
