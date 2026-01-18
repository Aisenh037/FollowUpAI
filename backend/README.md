# FollowUpAI Backend  

AI-powered sales follow-up agent backend built with FastAPI.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your API keys

# Run server
python -m uvicorn main:app --reload
```

Server: http://localhost:8000  
API Docs: http://localhost:8000/docs

## Configuration

Required environment variables in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `GROQ_API_KEY` - Groq API key for LLM
- `RESEND_API_KEY` - Resend API key for emails  
- `SECRET_KEY` - JWT secret key

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.
