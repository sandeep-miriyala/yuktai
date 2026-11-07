"""Tests never use a real Groq key or database: agents are tested in free mode and with a fake model."""

import os

os.environ["GROQ_API_KEY"] = ""
os.environ["DATABASE_URL"] = ""
os.environ["YUKTAI_ENV"] = "development"
os.environ["AGENT_ROWS"] = "20000"
