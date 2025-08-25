"""Test server with Alpha Vantage routes"""
from fastapi import FastAPI
from routers import alpha_vantage
import uvicorn

app = FastAPI(title="Test Server")

# Include Alpha Vantage router
app.include_router(alpha_vantage.router)

@app.get("/test")
def test():
    return {"message": "Test endpoint works"}

if __name__ == "__main__":
    print("Starting test server...")
    print("Routes:")
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f"  {route.path}")
    
    uvicorn.run(app, host="0.0.0.0", port=8002)