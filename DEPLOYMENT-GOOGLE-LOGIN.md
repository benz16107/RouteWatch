# Google Login on Deployed Site — Checklist

When your **frontend** and **backend** are on different URLs (e.g. DigitalOcean: one app for frontend, one for backend), follow these steps exactly so "Sign in with Google" works.

---

## 1. Set environment variables on the **backend** (your host’s dashboard)

Add or edit these on the **backend** service (the one that runs `node backend/server.js`):

| Variable | Example | Required |
|----------|---------|----------|
| `NODE_ENV` | `production` | Yes (so cookies use Secure + SameSite=None) |
| `BACKEND_URL` | `https://your-backend.ondigitalocean.app` | Yes — exact URL of the backend (no trailing slash) |
| `FRONTEND_URL` | `https://your-frontend.ondigitalocean.app` | Yes — exact URL of the frontend (no trailing slash) |
| `GOOGLE_OAUTH_CLIENT_ID` | (from Google Console) | Yes |
| `GOOGLE_OAUTH_CLIENT_SECRET` | (from Google Console) | Yes |
| `AUTH_SECRET` | long random string | Recommended (or session uses AUTH_PASSWORD) |

**Single-app deployment (frontend and backend same URL):**  
If you serve both API and frontend from one URL (e.g. `https://yourapp.ondigitalocean.app`), you can leave `FRONTEND_URL` and `BACKEND_URL` unset. Then use that single URL in step 2 below.

---

## 2. Add the redirect URI in Google Cloud Console

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Click your **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized redirect URIs**, add this **exact** URL (replace with your real backend URL):

   ```
   https://YOUR-BACKEND-HOST/api/auth/google/callback
   ```

   Examples:
   - `https://routewatch-abc123.ondigitalocean.app/api/auth/google/callback`
   - If same app for frontend and backend: `https://yourapp.ondigitalocean.app/api/auth/google/callback`

4. Save.

---

## 3. Frontend API URL (if frontend and backend are different)

If your frontend is built and hosted separately, it must call your **backend** URL. Set at **build time**:

- **`VITE_API_URL`** = your backend URL, e.g. `https://your-backend.ondigitalocean.app`

So when you build the frontend (e.g. on DigitalOcean or locally), the build environment must have:

```
VITE_API_URL=https://your-backend.ondigitalocean.app
```

Then run `npm run build` (or your host’s build command). If you don’t set `VITE_API_URL`, the frontend uses relative `/api` (only works when frontend and backend are on the same origin).

---

## 4. Redeploy

- Push your code (the cookie `sameSite: 'none'` fix is already in the repo) and let your host redeploy the **backend**.
- If you changed `VITE_API_URL`, rebuild and redeploy the **frontend** too.

---

## Quick checklist

- [ ] Backend env: `NODE_ENV=production`, `BACKEND_URL`, `FRONTEND_URL` (if split), `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, optional `AUTH_SECRET`
- [ ] Google Console: redirect URI = `https://<your-backend-host>/api/auth/google/callback`
- [ ] Frontend build (if split): `VITE_API_URL=https://<your-backend-host>`
- [ ] Redeploy backend (and frontend if you changed env)

After this, "Sign in with Google" on the deployed site should log you in and keep you logged in.
