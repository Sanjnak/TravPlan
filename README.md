# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deployment

Follow these steps to deploy this Vite + React app to Vercel (recommended):

1. Create a copy of `.env.example` named `.env` and fill in your Firebase values.

2. Locally test a production build:

```bash
npm install
npm run build
npm run preview
```

3. Create a Git repository (if you haven't) and push to GitHub, GitLab or Bitbucket.

4. Sign in to Vercel and import the repository. Vercel will detect the Vite project.

5. In the Vercel project settings, add the environment variables (use the same names as in `.env`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

6. Set the build command to `npm run build` (Vercel usually sets this automatically) and the output directory to `dist`.

7. Deploy — Vercel will build and provide a URL. Test auth flows and Firestore operations in the deployed site.

Notes:

- Keep your `.env` out of source control. Use Vercel's dashboard to store production secrets.
- If you prefer Netlify or another host, similar steps apply; Netlify uses the same `npm run build` and `dist` output.
