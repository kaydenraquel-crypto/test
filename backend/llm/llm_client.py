# backend/llm/llm_client.py
import os
import json
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

# OpenAI SDK (pip install openai)
from openai import OpenAI, APIConnectionError, RateLimitError, BadRequestError

load_dotenv()

# Expect OPENAI_API_KEY in environment / .env
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not OPENAI_API_KEY:
    # We keep the import path the same so main.py can import this even if key is missing.
    # We'll raise a clear error only if/when the function is actually called.
    pass

# You can switch to another small, cost‑effective model if you like.
# gpt-4o-mini is a good balance for tool-style analysis.
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = """\
You are NovaSignal's financial research assistant.
Your job: read the provided *structured market context* (OHLC-derived indicators, signals, and recent news summaries)
and produce a concise, useful analysis for an experienced retail trader.

Important rules:
- You may discuss *possible* strategies (momentum, mean reversion, breakout, pullback, trend-following).
- Suggest risk-managed entries/exits ONLY as hypotheses, not guarantees.
- Always include risk notes and a brief checklist (what would confirm/negate the thesis).
- Strive for actionable clarity, but do not provide investment advice; this is educational analysis.

Output format (Markdown):
- A short thesis (1–2 sentences)
- Setup details:
  - Suggested strategy: (e.g., EMA crossover momentum)
  - Preferred entry zone
  - Initial stop
  - First target
- What I’m basing this on (bullet points)
- Risks / invalidate conditions (bullet points)
- Optional: alternative plan if trend flips
"""

def _ensure_client() -> OpenAI:
    if not OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Put it in your .env or environment before calling the LLM."
        )
    return OpenAI(api_key=OPENAI_API_KEY)

def analyze_asset_with_llm(
    *,
    symbol: str,
    market: str,
    summary: Optional[str],
    indicators: Dict[str, Any],
    signals: List[Dict[str, Any]],
    news: List[Dict[str, Any]],
    model: Optional[str] = None,
) -> str:
    """
    Build a compact structured prompt for the LLM and return a Markdown analysis string.
    """
    client = _ensure_client()

    # Keep payload small & relevant
    slim_payload = {
        "symbol": symbol,
        "market": market,
        "client_summary": summary or "",
        "indicators_last": {
            # Only last ~10 values for each indicator to keep token usage reasonable
            k: (v[-10:] if isinstance(v, list) else v)
            for k, v in (indicators or {}).items()
        },
        "signals_recent": signals[-20:] if isinstance(signals, list) else [],
        "news_recent": [
            {k: item.get(k) for k in ("headline", "summary", "source", "score", "url")}
            for item in (news or [])[:10]
        ],
    }

    try:
        resp = client.chat.completions.create(
            model=(model or DEFAULT_MODEL),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Analyze the following JSON market context and produce the requested Markdown:\n\n"
                        + "```json\n" + json.dumps(slim_payload, ensure_ascii=False, indent=2) + "\n```"
                    ),
                },
            ],
            temperature=0.3,
        )
        content = (resp.choices[0].message.content or "").strip()
        return content if content else "No analysis was returned."
    except (APIConnectionError, RateLimitError, BadRequestError) as e:
        return f"LLM error: {type(e).__name__}: {e}"
    except Exception as e:
        return f"LLM error: {e}"
