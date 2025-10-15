# JobQuest – Smart Job Finder

This is a local, mock-data React project (Vite + Tailwind) that demonstrates:
- Job search and filters (local mock JSON)
- Favorites persisted to localStorage (Redux Toolkit)
- AI Resume Scorer using a local heuristic (PDF parsing via pdf.js)
- Routing (Home / Favorites / AI Resume)
- Dark/Light theme toggle

## Folder
- `src/` — source files
- `src/data/jobs.json` — mock job listings

## Setup (VS Code / terminal)

1. Open the project in VS Code:
   - `File -> Open Folder...` and select the project folder.

2. Install dependencies (in VS Code integrated terminal):
```bash
npm install
```

3. Run the dev server:
```bash
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Notes about AI Resume Scorer
- This project ships a **local heuristic** scorer (keyword-overlap) so it works offline and without an API key.
- If you want a real OpenAI-powered scorer you should create a small server endpoint that calls OpenAI (server-side) and then call that endpoint from the frontend (to avoid exposing your API key). See OpenAI docs for server usage.

## Deploy
This project uses environment variables for any server or API you add. To deploy a purely static version (with local mock data) you can push to GitHub and deploy on Vercel.

## Troubleshooting
- If Tailwind classes don't apply, ensure `npm install` completed and restart the dev server.
- If PDF text extraction fails for some PDFs, try a different resume PDF.

Enjoy — and tell me if you want me to:
- Swap the heuristic for a server-side OpenAI scorer sample (I can provide the server code)
- Add more mock data or UI polish
