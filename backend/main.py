"""FastAPI main application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from services.database import engine, Base
from routes import auth, leads, agent, discovery
from tkq import broker

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="FollowUpAI",
    description="AI-powered sales follow-up and pipeline recovery agent",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    if not broker.is_worker_process:
        await broker.startup()

@app.on_event("shutdown")
async def shutdown():
    if not broker.is_worker_process:
        await broker.shutdown()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(agent.router)
app.include_router(discovery.router)
from routes import sequence
app.include_router(sequence.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "FollowUpAI Backend",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "resend_configured": bool(settings.RESEND_API_KEY)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
