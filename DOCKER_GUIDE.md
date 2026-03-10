# 🐳 Docker Guide — alpha-ae-web

Yeh guide tumhe step-by-step bataegi ki kaise is Next.js project ko Docker mein run karna hai.

---

## 📋 Prerequisites

1. **Docker Desktop** install karo → [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. Install hone ke baad terminal mein check karo:
   ```bash
   docker --version
   docker compose version
   ```

---

## 📁 Project mein yeh files honi chahiye

| File | Kya karta hai |
|------|---------------|
| `Dockerfile` | Multi-stage build — deps install → build → production image |
| `.dockerignore` | Unnecessary files ko build context se exclude karta hai |
| `docker-compose.yml` | Single command se app run karne ke liye |
| `.env` | Environment variables (secrets) — image mein nahi jaata |

---

## 🚀 Step-by-Step Guide

### Step 1: `.env` file tayyar karo

Project root mein `.env` file banao (ya `.env` already hai toh check karo). `env.example` se reference lo:

```bash
# Copy example file
cp env.example .env
```

Phir `.env` mein apni actual values bharo (MongoDB URL, AWS keys, etc.)

> ⚠️ **IMPORTANT:** `.env` file kabhi bhi Git mein push mat karo. Yeh `.gitignore` aur `.dockerignore` dono mein already excluded hai.

---

### Step 2: Docker Image Build karo

```bash
docker build -t alpha-ae-web .
```

**Kya hoga:**
1. `node:20-alpine` base image download hoga
2. `npm ci` se dependencies install hongi
3. `next build` se standalone output banega
4. Final image mein sirf production files hongi (~200MB)

> 💡 Pehli baar build mein 3-5 minute lag sakte hain. Baad mein cache hone se faster hoga.

---

### Step 3: Container Run karo

```bash
docker run -d \
  --name alpha-web \
  -p 3000:3000 \
  --env-file .env \
  alpha-ae-web
```

Ab browser mein jaao: **http://localhost:3000** ✅

---

### Step 4: Container manage karo

```bash
# Logs dekho
docker logs alpha-web

# Live logs follow karo
docker logs -f alpha-web

# Container stop karo
docker stop alpha-web

# Container delete karo
docker rm alpha-web

# Restart karo
docker restart alpha-web
```

---

## 🐳 Docker Compose se Run karo (Recommended)

Compose se ek command mein sab ho jaata hai:

```bash
# Build + Run
docker compose up --build

# Background mein run karo
docker compose up --build -d

# Logs dekho
docker compose logs -f

# Stop karo
docker compose down
```

---

## 🔧 Dockerfile Stages Explained

```
┌─────────────────────────────────┐
│  Stage 1: base                  │
│  → node:20-alpine + libc6      │
├─────────────────────────────────┤
│  Stage 2: deps                  │
│  → npm ci (install packages)    │
├─────────────────────────────────┤
│  Stage 3: builder               │
│  → npm run build (standalone)   │
├─────────────────────────────────┤
│  Stage 4: runner                │
│  → Sirf production files        │
│  → Non-root user (security)     │
│  → Port 3000 exposed            │
└─────────────────────────────────┘
```

**Kyun Multi-Stage?**
- Final image chhoti hoti hai (~200MB vs ~1.5GB)
- Dev dependencies include nahi hoti
- Build cache se rebuild fast hoti hai

---

## 🌐 Production Deployment (VPS/Server)

### Option A: Direct Docker

```bash
# Server pe code le jaao
git clone <your-repo> && cd alpha-ae-web

# .env file banao
nano .env   # apni values bharo

# Build + Run
docker compose up --build -d
```

### Option B: Docker Hub se Deploy

```bash
# Local machine pe image build karo
docker build -t yourusername/alpha-ae-web:latest .

# Docker Hub pe push karo
docker push yourusername/alpha-ae-web:latest

# Server pe pull + run karo
docker pull yourusername/alpha-ae-web:latest
docker run -d -p 3000:3000 --env-file .env yourusername/alpha-ae-web:latest
```

---

## ❗ Common Problems & Solutions

### 1. `sharp` module error
```
Error: Could not load the "sharp" module
```
**Fix:** Dockerfile mein `libc6-compat` already add hai. Agar phir bhi aaye:
```dockerfile
RUN npm rebuild sharp
```

### 2. Build fail — memory issue
```bash
# Docker Desktop → Settings → Resources → Memory → 4GB+ set karo
```

### 3. `.env` variables kaam nahi kar rahe
- Check karo `.env` file project root mein hai
- `docker compose up` se run kar rahe ho toh `env_file: .env` check karo
- `NEXT_PUBLIC_*` variables build time pe chahiye — Dockerfile mein ARG use karo:
  ```dockerfile
  ARG NEXT_PUBLIC_BASE_ALPHA
  ENV NEXT_PUBLIC_BASE_ALPHA=$NEXT_PUBLIC_BASE_ALPHA
  ```

### 4. Port already in use
```bash
# Check karo kaunsa process use kar raha hai
docker ps
# Purana container hatao
docker rm -f alpha-web
```

### 5. MongoDB connection refused
- Agar MongoDB localhost pe hai toh Docker container se `localhost` kaam nahi karega
- Use karo: `host.docker.internal` ya MongoDB Atlas cloud URL

---

## 📝 Quick Reference Commands

```bash
# ===== BUILD =====
docker build -t alpha-ae-web .              # Build image
docker compose up --build -d                 # Build + Run (compose)

# ===== RUN =====
docker run -d -p 3000:3000 --env-file .env --name alpha-web alpha-ae-web
docker compose up -d                         # Run with compose

# ===== MONITOR =====
docker ps                                    # Running containers
docker logs -f alpha-web                     # Live logs
docker stats                                 # CPU/Memory usage

# ===== STOP/CLEAN =====
docker compose down                          # Stop compose
docker stop alpha-web                        # Stop container
docker system prune -a                       # Sab unused clean karo
```
