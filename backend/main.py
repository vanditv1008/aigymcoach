import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure root directory is on sys.path
root_dir = str(Path(__file__).parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import init_database
from backend.routes import auth, workouts, exercises, coaching, vision

# Initialize Database
init_database()

app = FastAPI(
    title="AI Real-Time Gym Coach API",
    description="FastAPI Backend for AI Real-Time Gym Coach",
    version="1.0.0"
)

# Configure CORS
origins_env = os.environ.get("CORS_ORIGINS", "")
if origins_env:
    origins = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(exercises.router)
app.include_router(coaching.router)
app.include_router(vision.router)

@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "AI Real-Time Gym Coach API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
