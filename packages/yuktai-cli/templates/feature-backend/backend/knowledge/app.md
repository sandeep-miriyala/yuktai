# {{title}}

{{title}} was made with YuktAI: Next.js for the pages, Rust compiled to WebAssembly for the fast parts, and a Python API (FastAPI) in the backend folder. Replace this file with your own documents: every .md file in backend/knowledge is used by the Ask the documents box.

# Running the app

Run npm run dev to start everything together: the Rust build, the Python API on port 8000 and the site on port 3000. Press Ctrl + C once to stop all of them. Run npm run dev -- --no-api to start the site without the API.

The first npm run dev makes backend/.venv and installs the Python packages from backend/requirements.txt. It needs Python 3.10 or newer.

# Tests

npm test checks the built site. npm run test:api runs the Python tests with pytest. npm run test:e2e runs the Playwright browser tests; install the browser once with npx playwright install chromium. npm run agent:test asks the Testing Agent to run the checks and explain what failed.

# Data grid

The data grid page shows 25 lakh sample orders made in the browser, or 10 lakh on phones. Search and sort run in Rust. The Grid AI Assistant answers typed or spoken commands such as how many rows, unpaid, search Pune and sort by date.

# Agents

The Grid Agent answers questions about the orders with tools: count, total, average, top orders and orders by city. The Testing Agent runs the tests and explains failures. The YuktAI Assistant helps developers add pages and API endpoints. With a Groq key in backend/.env they use a language model; without a key they work in free mode with simple rules.

# Groq key

Put GROQ_API_KEY in backend/.env (copy backend/.env.example). The key stays on the server and is never sent to the browser. When a key is set, the question and the matching passages are sent to Groq to write the answer. Without a key nothing leaves your computer.

# Database

PostgreSQL is optional. backend/db has schema.sql, seed.sql and the basic commands. Set DATABASE_URL in backend/.env to use it. The pgvector extension stores passages for larger document collections.
