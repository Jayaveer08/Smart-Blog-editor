# Smart Blog Editor

This repository contains a full-stack editor application (React + Lexical frontend, FastAPI backend) with AI-assisted generation, auto-save, and a streaming-friendly backend.

**Deliverables**
- Public GitHub repository: this repo.
- Demo video: add a 2-minute Loom/YouTube link below after recording.
- Deployed link: add the final frontend URL below once deployed.
- System architecture diagram: see `diagrams/architecture.mmd`.

**Setup Instructions**
- Backend (Windows example):

```powershell
cd backend
python -m venv .venv
.\\.venv\\Scripts\\activate
pip install -r requirements.txt
.\\.venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --port 8000
```

- Frontend:

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

- Environment variables:
  - Backend: `GEMINI_API_KEY`, `GEMINI_MODEL`, `SECRET_KEY`, `MONGODB_URI` (if used)
  - Frontend: `VITE_API_BASE` (e.g. `http://localhost:8000/api`), `VITE_DISABLE_STREAMING` (set `true` for serverless backends)

**Auto-save logic (explanation)**
- **What triggers autosave:** the editor state is observed and debounced (1s) before sending to the backend. This avoids excessive network requests while ensuring user data is saved shortly after they stop typing.
- **Where it saves:** the autosave endpoint posts the serialized Lexical editor JSON and metadata (title, slug, timestamps) to the backend `POST /api/posts` route.
- **Conflict handling:** the frontend uses last-write-wins with a timestamp. The backend can be extended to handle versioned updates or operational transforms if multi-user editing is added later.
- **Why this design:** debouncing keeps UX responsive and minimizes writes; storing Lexical JSON preserves rich editor state (styles, nodes, links) for accurate restoration.

**Database schema rationale**
- **Choice:** a document store (MongoDB) is recommended because the editor stores rich, nested JSON (Lexical document state) which maps naturally to a document DB.
- **Schema highlights:**
  - `posts` collection fields: `title` (string), `slug` (string, indexed), `content` (Lexical JSON blob), `summary` (string), `author_id` (ref), `created_at`, `updated_at`.
  - `ai_usage` collection: stores prompt, model, tokens (if available), and timestamp for billing or analytics.
- **Why this schema:** document DBs allow storing rich `content` without mapping to relational tables; indexing `slug` and `author_id` enables fast lookups and queries for listing.

**Demo video (2-minute walkthrough)**
- Record these three sequences:
  1. Editor typing and formatting (title + a paragraph + bold/italic).
 2. Show Auto-save: edit something, wait ~1s for the autosave indicator, and show the backend console/log or a list view updating.
 3. AI generation: click "Generate Summary", accept the result and show it inserted into the editor.
- Upload to Loom or YouTube and paste the link here:

- Demo URL: (paste your Loom/YouTube link here)

**Deployed link**
- Frontend URL: (paste deployed URL here)
- Backend API URL: (paste backend URL here)

**System Architecture Diagram**
- See `diagrams/architecture.mmd` for a mermaid diagram. Render it with any mermaid renderer or view it in editors that support mermaid.

**Troubleshooting**
- If AI generation returns raw instruction text, try toggling `VITE_DISABLE_STREAMING` and check backend logs for the model response.
- If streaming errors occur on Vercel, deploy the backend to Render/Railway and set `VITE_API_BASE` accordingly.

If you want, I can record the demo steps locally or help you assemble the final Loom video script.
