# Security & Privacy

The core principle of codedev.tools: **your data never leaves your browser.**

## Data handling

- All content you enter into the tools (JSON, text, files, etc.) is processed **only in
  your browser's memory**. No input is ever sent to a server, an API, or any third party.
- The application has no backend; it is served as static files.
- Because your content is never transmitted over the network, there is nothing to copy,
  log, or store.

## Analytics

- Optionally, Google Analytics 4 (GA4) collects **anonymous visit metrics only**, such as
  which page was viewed. IP anonymization is enabled.
- The **content** you enter into the tools is **never** sent as an event. The relevant code
  is auditable: [`src/lib/analytics.ts`](./src/lib/analytics.ts).
- Analytics only activates when the `VITE_GA_ID` environment variable is set.

## Content Security Policy (CSP)

The app is served with a strict CSP (see [`vercel.json`](./vercel.json)). `connect-src` is
limited to analytics endpoints only; no other network request carries user data.

## Verification

You don't have to take any of these claims on trust — the code is open:
- Open DevTools → Network and use any tool; you'll see your input is sent nowhere.
- Read the source code.

## Reporting a vulnerability

If you find a security issue, please reach out for responsible disclosure before opening
a public issue.
