# CSBuddy

CSBuddy is a chat-based computer-science learning assistant. Ask natural-language questions like “What is recursion?” and get a streamed explanation, diagram, related terms, and runnable code examples.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** FastAPI + Python 3.12
- **AI/ML:**
  - `sentence-transformers/all-MiniLM-L6-v2` for semantic term matching
  - TF-IDF + LinearSVM for intent and term classification
- **Visualizations:** Mermaid.js diagrams, D3.js + NetworkX concept graph
- **Code playground:** Monaco Editor + Pyodide (client-side Python)
- **Voice input:** Web Speech API

## Project structure

```
csbuddy/
├── backend/
│   ├── app/                 # FastAPI app
│   ├── data/terms.json      # Term database
│   ├── artifacts/           # Generated embeddings & classifier
│   ├── scripts/             # Build embeddings, train classifier, validate terms
│   ├── tests/               # Pytest suite
│   └── .env.example
├── frontend/
│   ├── src/                 # React source
│   ├── dist/                # Production build
│   ├── vercel.json
│   └── .env.example
└── README.md
```

## Local development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/build_embeddings.py
python scripts/train_intent_model.py
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to the backend.

### Tests

```bash
cd backend
pytest tests -v
```

## Deployment

### Backend on Render

1. Create a new Web Service on [Render](https://render.com).
2. Connect this repository and set the root directory to `backend`.
3. Use the provided `render.yaml` (Blueprint) or configure manually:
   - **Build command:** `pip install -r requirements.txt && python scripts/build_embeddings.py && python scripts/train_intent_model.py`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables:
   - `CORS_ORIGINS=https://your-frontend.vercel.app`
   - `ADMIN_TOKEN` (secure random string, optional)

### Frontend on Vercel

1. Import this repository on [Vercel](https://vercel.com).
2. Set the framework preset to **Vite** and the root directory to `frontend`.
3. Add the environment variable:
   - `VITE_API_BASE_URL=https://your-render-service.onrender.com`
4. Deploy.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `ADMIN_TOKEN` | Token for the embeddings rebuild endpoint | unset |
| `DEBUG` | Skip model warmup on startup | `False` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL of the backend API | empty (uses Vite proxy) |

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/health` | Health check with model status |
| POST | `/api/admin/embeddings/rebuild` | Rebuild embeddings (requires `ADMIN_TOKEN`) |
| GET | `/api/terms` | List/search terms |
| GET | `/api/terms/{id}` | Get a single term |
| GET | `/api/terms/related/{id}` | Get related terms |
| POST | `/api/ask` | Streaming answer (SSE) |
| GET | `/api/graph` | Concept graph data |
| POST | `/api/intent` | Predict intent and term |

## License

MIT
