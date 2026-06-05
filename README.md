# codedev.tools

> A collection of developer tools that run **entirely in your browser**: formatters,
> parsers, converters, and schema/type generators.

**Live:** https://codedev.tools • **License:** MIT

## Why?

Most online "format JSON" or "JSON → schema" tools send your data to a server.
codedev.tools never does — **no data ever leaves your browser**. Every transformation
runs locally in JavaScript. The source is open so you can verify this yourself.

- 🔒 **Zero server processing** — your input is never sent anywhere over the network.
- 🔍 **Auditable** — fully open source; inspect exactly what each tool does.
- ⚡ **Fast** — a static SPA that works instantly.

> The only privacy exception is an optional, **anonymous** visit counter (Google Analytics).
> Content you type into the tools (JSON, files, etc.) is **never** sent to analytics.
> See [SECURITY.md](./SECURITY.md).

## Tools

- **JSON Formatter** — pretty-prints JSON with readable indentation.
- **JSON → Zod** — generates a Zod schema from JSON data.

_(More tools are being added.)_

## Development

Requirements: Node.js 20.19+ (or 22.12+), [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # unit tests
pnpm build        # production build (dist/)
```

For optional analytics, copy `.env.example` to `.env` and set `VITE_GA_ID`.
If it is not set, analytics is fully disabled.

## Tech stack

Vite • React • TypeScript • Tailwind CSS v4 • shadcn/ui • react-router • cmdk

## Contributing

Adding a tool is simple: create `meta.ts`, `logic.ts`, `logic.test.ts`, and `index.tsx`
under `src/tools/<tool>/`, then register it in `src/tools/registry.ts`. Everything else
(sidebar, search, command palette) updates automatically.

## License

[MIT](./LICENSE)
