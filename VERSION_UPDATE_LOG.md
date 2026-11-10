# Version Update Log

> Date: August 7, 2026
> Scope: All backend + frontend frameworks and the programming language were brought to their newest versions.

## Summary

| Layer | Previous | New | Status |
| --- | --- | --- | --- |
| Language: Java | 21 (LTS) | 21 (LTS) | Kept (user choice — still the LTS in use) |
| Backend framework: Spring Boot | 4.1.0 | 4.1.0 | Already latest |
| Frontend framework: React | 19.2.8 | 19.2.8 | Already latest |
| Router: react-router-dom | 7.18.2 | 7.18.2 | Kept (user choice) |
| Build tooling: react-scripts (CRA) | 5.0.1 | **Removed** — deprecated, no newer version | Migrated to Vite |
| Build tooling: Vite | — | 8.2.1 | Added |
| TypeScript | 4.9.5 | **7.0.2** | Upgraded |
| Test runner | Jest (bundled with CRA) | **Vitest 4.1.10** | Migrated |

---

## Backend changes (`pom.xml`)

| Dependency | Previous | New |
| --- | --- | --- |
| springdoc-openapi-starter-webmvc-ui | 3.0.3 | **3.1.0** |

- Java 21, Spring Boot 4.1.0, and jjwt 0.13.0 were already the newest versions and were left unchanged.
- Verified: `mvn compile` and `mvn test` both pass.

## Frontend changes (`frontend-react/`)

### Migrated from Create React App (react-scripts 5.0.1) to Vite 8.2.1

`react-scripts` (CRA) has been deprecated by its maintainers and has no newer release, so the build tooling was migrated to Vite, the modern standard:

| Package | Previous | New |
| --- | --- | --- |
| vite | — | **8.2.1** |
| @vitejs/plugin-react | — | **6.0.5** |
| typescript | 4.9.5 | **7.0.2** |
| vitest | — | **4.1.10** |
| jsdom | — | **30.0.1** |
| @testing-library/jest-dom | 6.9.1 | **7.0.0** |
| @types/node | ^16 | **^24** |
| web-vitals | 2.1.4 | **6.1.0** |
| @types/jest | ^27.5.2 | **removed** (no longer needed — Vitest used) |
| react-scripts | 5.0.1 | **removed** |

Already at the newest version (left unchanged): react 19.2.8, react-dom 19.2.8, axios 1.19.0, @stomp/stompjs 7.3.0, sockjs-client 1.6.1, @testing-library/react 16.3.2.

### New / modified / removed files

| File | Change |
| --- | --- |
| `package.json` | Rewrote: new scripts (`start` → `vite`, `build` → `tsc --noEmit && vite build`, `test` → `vitest run`), added Vite/Vitest deps, removed react-scripts, added `"type": "module"` |
| `vite.config.ts` | **New** — Vite + React plugin + Vitest config (jsdom, globals, setup file) |
| `index.html` | **New** (moved from `public/`) — Vite entry point, `%PUBLIC_URL%` → `/`, added module script tag |
| `public/index.html` | Removed (superseded by root `index.html`) |
| `tsconfig.json` | Rewrote for Vite: `moduleResolution: bundler`, `target: ES2022`, Vite/Vitest/jest-dom types |
| `src/vite-env.d.ts` | **New** (replaces `react-app-env.d.ts`) |
| `src/react-app-env.d.ts` | Removed |
| `src/setupTests.ts` | Updated for Vitest (`@testing-library/jest-dom/vitest`) |
| `src/App.test.tsx` | Rewrote test for Vitest (renders login page when unauthenticated) |
| `src/reportWebVitals.ts` | Updated for web-vitals v6 (`onINP` replaces removed `onFID`) |
| `src/services/api.ts` | `process.env.REACT_APP_API_URL` → `import.meta.env.VITE_API_URL` |
| `src/context/NotificationContext.tsx` | `process.env.REACT_APP_WS_URL` → `import.meta.env.VITE_WS_URL` |
| `src/logo.svg` | Removed (unused default CRA asset) |
| `launch.bat` | Removed `NODE_OPTIONS=--openssl-legacy-provider` (CRA/webpack-only workaround, not needed by Vite) |

### Environment variable rename (breaking change)

CRA-style env vars were renamed for Vite. If you used these, rename them:

| Before (CRA) | After (Vite) |
| --- | --- |
| `REACT_APP_API_URL` | `VITE_API_URL` |
| `REACT_APP_WS_URL` | `VITE_WS_URL` |

Defaults are unchanged (`http://localhost:8080/api/v1` and `http://localhost:8080/ws/notifications`).

---

## Installs performed (large)

| Install | Size / scale | Notes |
| --- | --- | --- |
| Frontend full reinstall | 165 packages (~200+ MB `node_modules`) | Clean `node_modules` + `package-lock.json` rebuilt for the Vite toolchain |
| springdoc 3.1.0 + dependencies (Maven) | A few jars + transitive deps | Downloaded to `~/.m2` on first compile |

## Verification performed

- ✅ Backend `mvn compile` — passes
- ✅ Backend `mvn test` — passes
- ✅ Frontend `npm run build` (TypeScript 7 type-check + Vite production build) — passes
- ✅ Frontend `npm test` (Vitest) — 1/1 test passes
- ✅ Frontend `npm start` (Vite dev server) — serves HTTP 200 at `http://localhost:3000`

## Post-migration bug fixed

**Symptom:** After the CRA → Vite migration, the page rendered only the cream background — the app never mounted.

**Cause:** `sockjs-client` (real-time notifications) references Node's `global` at the top of its bundle. Create React App / webpack shimmed `global`, but Vite does not, so the browser threw `Uncaught ReferenceError: global is not defined` and React never mounted.

**Fix:** Added to `frontend-react/vite.config.ts`:
```ts
define: {
  global: 'globalThis',
}
```
Verified in both the dev server and the production build (`vite preview`) that the app renders the login page correctly.
