# KoboMarket Frontend
React 18 + Vite + Tailwind. Run: `npm i && npm run dev` (proxies /api to localhost:3000; change in vite.config.js or set VITE_API_URL).
Assumes responses shaped `{success,data}` and camelCase kobo fields (e.g. `balanceKobo`); snake_case is also tolerated in most places.
