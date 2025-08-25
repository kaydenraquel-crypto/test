In backend main.py, register the new router:

from .routers import llm
app.include_router(llm.router)
