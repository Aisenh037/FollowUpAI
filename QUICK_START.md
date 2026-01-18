# ⚡ FollowUpAI - Quick Start (No Docker!)

## 🚀 Run in 2 Minutes

### 1️⃣ Terminal 1 - Backend
```powershell
cd c:\Users\ASUS\Desktop\sales-agent\backend
.venv\Scripts\activate
python -m uvicorn main:app --reload
```

### 2️⃣ Terminal 2 - Frontend
```powershell
cd c:\Users\ASUS\Desktop\sales-agent\frontend
npm run dev
```

---

## 🌐 Access Points

- **App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Backend**: http://localhost:8000

---

## 🎯 Demo Flow

1. **Register** at http://localhost:3000/register
2. **Login** with your credentials
3. **Add Leads** → Click "+ Add Lead"
4. **Run Agent** → Go to Agent page → Click "🚀 Run Agent Now"
5. **Check Results** → View activity log and email outputs

---

## 📧 Sample Lead Data

```
Name: Sarah Johnson
Email: sarah@techstartup.io
Company: TechStart Inc
Last Message: "Thanks for the demo, I'll discuss with my team"
Last Contact Date: [Pick a date 15 days ago]
```

---

## ✅ What's Working

- ✅ SQLite database (no Docker needed)
- ✅ Groq API (AI email generation)
- ✅ Resend API (email sending)
- ✅ JWT Authentication
- ✅ Full dashboard UI

---

## 🔥 For Investor Demo

1. Open http://localhost:3000
2. Show dashboard stats
3. Add a demo lead
4. Run the AI agent
5. Show the activity log and generated email

**This is your MVP. Ship it!** 🚀
