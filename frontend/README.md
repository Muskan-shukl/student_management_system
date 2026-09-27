# Vidyara — frontend

Vue 3 + TypeScript + Vite. Module-wise layout:

```
src/
├── styles/tokens.css     ← every colour, font, spacing, radius, shadow & motion value
├── styles/base.css       ← reset, typography, shared animations
├── core/                 ← shared: http client, types, router, auth store, composables, utils
├── ui/                   ← reusable components (AppButton, AppInput, AppTable, AppModal, …)
├── layouts/              ← AppShell (sidebar app) and AuthLayout (login / signup)
└── modules/<name>/       ← api.ts · schemas.ts (Zod) · routes.ts · views/ · components/
```

```bash
cp .env.example .env      # set VITE_API_URL to your backend
npm install
npm run dev               # http://localhost:5173
npm run build             # type-check + production build → dist/
```
