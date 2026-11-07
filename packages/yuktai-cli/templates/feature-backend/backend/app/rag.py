"""RAG: answers questions from your own documents in backend/knowledge/*.md.

1. Retrieve: the question is matched against the documents (BM25 ranking, no extra packages).
2. Generate: with GROQ_API_KEY, Groq writes the answer from the best passages only, and names them.
   Without a key (free mode) you get the best passages themselves.

Only the question and the chosen passages go to Groq; nothing a visitor typed into a form.
Growing beyond a few hundred pages? Keep the passages in PostgreSQL with pgvector (see backend/db/).
"""

from __future__ import annotations

import math
import re
from functools import lru_cache

from . import settings
from .agents.base import groq_model

KNOWLEDGE = settings.BACKEND / "knowledge"
# Letters and digits, plus the vowel signs of Indian scripts (U+0900–U+0DFF) so Telugu,
# Hindi, Tamil… words stay whole. _ splits words (DATABASE_URL → database, url).
WORD = re.compile(r"[\w\u0900-\u0DFF\u200c\u200d]+", re.UNICODE)


def _words(text: str) -> list[str]:
    return [w.lower() for w in WORD.findall(text.replace("_", " ")) if len(w) > 1]


@lru_cache(maxsize=1)
def passages() -> list[dict]:
    """Every paragraph of every .md file, with its source."""
    found = []
    for path in sorted(KNOWLEDGE.glob("*.md")):
        title = path.stem
        for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8")):
            block = block.strip()
            if block.startswith("#"):
                title = block.lstrip("# ").splitlines()[0]
                block = "\n".join(block.splitlines()[1:]).strip()
            if block:
                # the heading counts too, so "database" finds the Database section
                found.append({"source": f"{path.name} · {title}", "text": block, "words": _words(f"{title} {block}")})
    return found


def search(question: str, k: int = 3) -> list[dict]:
    """BM25: the k passages that best match the question."""
    docs = passages()
    if not docs:
        return []
    terms = set(_words(question))
    avg = sum(len(d["words"]) for d in docs) / len(docs)
    df = {t: sum(1 for d in docs if t in d["words"]) for t in terms}
    scored = []
    for d in docs:
        score = 0.0
        for t in terms:
            tf = d["words"].count(t)
            if tf:
                idf = math.log(1 + (len(docs) - df[t] + 0.5) / (df[t] + 0.5))
                score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * len(d["words"]) / avg))
        if score > 0:
            scored.append((score, d))
    scored.sort(key=lambda x: -x[0])
    return [{"source": d["source"], "text": d["text"], "score": round(s, 3)} for s, d in scored[:k]]


def ask(question: str, model=None) -> dict:
    found = search(question)
    model = model or groq_model()
    if not found:
        return {"answer": "I could not find this in the documents.", "sources": [], "mode": "free" if model is None else "groq"}
    if model is None:
        return {"answer": None, "sources": found, "mode": "free"}
    context = "\n\n".join(f"[{i + 1}] ({p['source']}) {p['text']}" for i, p in enumerate(found))
    reply = model.invoke(
        "Answer the question using only the passages below. Say which passage numbers you used. "
        "If the passages do not answer it, say so.\n\n"
        f"Passages:\n{context}\n\nQuestion: {question}"
    )
    return {"answer": str(reply.content), "sources": found, "mode": "groq"}
