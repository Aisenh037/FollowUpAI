# FollowUpAI Frontend

Modern dashboard for the AI sales follow-up agent.

## Setup

```bash
# Install dependencies
npm install

# Configure environment
copy .env.example .env.local

# Run development server
npm run dev
```

Open http://localhost:3000

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
