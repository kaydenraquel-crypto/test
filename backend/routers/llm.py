# backend/routers/llm.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import os

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")  # optional
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in backend/.env")

client_kwargs = {"api_key": OPENAI_API_KEY}
if OPENAI_BASE_URL:
    client_kwargs["base_url"] = OPENAI_BASE_URL

client = OpenAI(**client_kwargs)

router = APIRouter(prefix="/api/llm", tags=["llm"])

class LLMAnalyzeIn(BaseModel):
    symbol: str
    market: str
    summary: Optional[str] = None
    indicators: Dict[str, List[Optional[float]]] = Field(default_factory=dict)
    signals: List[Dict[str, Any]] = Field(default_factory=list)
    news: List[Dict[str, Any]] = Field(default_factory=list)

class LLMAnalyzeOut(BaseModel):
    analysis: str

SYSTEM_PROMPT = """You are NovaSignal's finance analyst assistant.
- You help retail traders understand market structure and risk.
- You may comment on momentum, volatility, support/resistance zones, and confluence.
- You must add clear disclaimers that this is NOT financial advice.
- Be practical, concise, and structured with bullet points.
- If data is thin or conflicting, say so and suggest what to watch for.
"""

def _trim_list(x, n=300):
    # safety: keep payloads small
    return x[:n] if isinstance(x, list) else x

@router.post("/analyze", response_model=LLMAnalyzeOut)
def analyze(body: LLMAnalyzeIn):
    # compact the payload a bit before sending
    indicators = {k: _trim_list(v, 600) for k, v in (body.indicators or {}).items()}
    signals = _trim_list(body.signals, 50)
    news = _trim_list(body.news, 20)

    user_msg = {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": (
                    f"Symbol: {body.symbol}\n"
                    f"Market: {body.market}\n"
                    f"Summary: {body.summary or '(none)'}\n"
                    "Indicators keys: " + ", ".join(indicators.keys())
                ),
            },
            {
                "type": "text",
                "text": "Latest condensed signals (JSON):\n" + str(signals[-12:]),
            },
            {
                "type": "text",
                "text": "Recent news (titles only):\n" + "\n".join([n.get("headline") or n.get("title","") for n in news]),
            },
        ],
    }

    try:
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                user_msg,
            ],
            temperature=0.3,
            max_tokens=800,
        )
        txt = resp.choices[0].message.content or "No analysis."
        return LLMAnalyzeOut(analysis=txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")
