# ProofCraft Frontend

The user-facing UI for ProofCraft — CV Builder, Case Studies, Home, About, Feedback.

**Live URL:** `https://proofcraft.online`  
**Backend:** `https://proof-craft-backend.vercel.app`

---

## Stack
- React 18 + Vite
- React Router DOM
- Axios (API calls)
- DOMPurify (XSS sanitization)

---

## Local Setup

```bash
git clone https://github.com/omar-pushing/proof-craft.git
cd proof-craft
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:3001/api for local dev
npm run dev
```

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git remote add origin https://github.com/omar-pushing/proof-craft.git
git add .
git commit -m "Initial frontend"
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import `proof-craft` from GitHub
3. **Framework:** Vite
4. Add Environment Variable:
   ```
   VITE_API_URL=https://proof-craft-backend.vercel.app/api
   ```
5. Deploy → assign custom domain `proofcraft.online`

---

## Domain Setup (Vercel)

In Vercel → Project Settings → Domains:
- Add `proofcraft.online`
- Add `www.proofcraft.online` (redirects to apex)

In your domain registrar DNS:
- Add `A` record: `@` → `76.76.21.21` (Vercel IP)
- Add `CNAME` record: `www` → `cname.vercel-dns.com`

---

## Features
- User signup/login with JWT auth
- Sign-up prompt before accessing CV Builder or Case Studies
- CV Builder: 3 templates, 8 colors, 5 fonts, live preview, save to backend
- Case Study Builder: 6-step guided workflow, publish + share link
- Feedback form: submits to API, notifies admin via email
- Home page: real stats from database, CMS-powered content
- About page: story + team photo from admin CMS
- XSS protection via DOMPurify on all rendered HTML
- Security headers via vercel.json
