# Flowline Pro Deployment Guide

This guide provides step-by-step instructions for running Flowline Pro locally for development, using Docker Compose for staging/local testing, and deploying to cloud production environments.

---

## 1. Local Development Setup

### Prerequisites
Make sure your development machine has the following tools installed:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **PNPM**: `v9.x` (highly recommended, as workspace is preconfigured for pnpm)
- **PostgreSQL**: `v15+` with the `pgvector` extension enabled
- **MinIO** or **AWS S3**: For document and file storage

---

### Step 1: Clone & Install Dependencies
Navigate to your workspace directory and install project dependencies:
```bash
# Install dependencies
pnpm install
```

---

### Step 2: Environment Variables configuration
Create your local environment file `.env.local` by copying `.env.example`:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:
```env
# Application Core
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Flowline Pro

# Database Connection (with pgvector support)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowlinepro?schema=public"

# Better Auth Secret and URL
BETTER_AUTH_SECRET="your-super-secret-better-auth-key-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Convex Integration
CONVEX_DEPLOYMENT="dev:flowlinepro-dev"
NEXT_PUBLIC_CONVEX_URL="your-convex-public-url"

# OpenAI & AI Services
OPENAI_API_KEY="your-openai-api-key"

# MinIO / S3 Storage Credentials
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="flowlinepro"

# Email Provider
RESEND_API_KEY="re_yourkey"
EMAIL_FROM="noreply@flowlinepro.io"
```

---

### Step 3: Database Migration & Seeding
Prisma manages the PostgreSQL connection. Run the migrations to establish your local database schema:
```bash
# Apply migrations to database
pnpm prisma db push

# Generate client
pnpm prisma generate

# Seed initial templates and lookup types
pnpm prisma db seed
```

---

### Step 4: Run Convex Development Server
Convex powers the real-time websocket features in Flowline Pro. Start Convex in dev mode:
```bash
pnpm exec convex dev
```

---

### Step 5: Run Development Server
Now start the localized Next.js development server:
```bash
pnpm dev
```
The application will launch on [http://localhost:3000](http://localhost:3000).

---

## 2. Docker Staging Setup

We provide a production-ready `docker-compose.yml` to spin up the application along with all mandatory backing services locally.

### Backup Services Included:
- **PostgreSQL** (Port `5432`)
- **MinIO** Object Storage (Port `9000` / Console `9001`)
- **Inngest** Background Worker (Port `8288`)
- **Convex Dev Emulator**

### Running the Stack:
```bash
# Start all backing services and the app container
docker-compose up -d --build
```

### Health Check and Logs:
```bash
# Verify container statuses
docker-compose ps

# Check execution logs
docker-compose logs -f app
```

---

## 3. Production Deployment

### Option A: Vercel Deployment (Recommended)
Because Flowline Pro is built on Next.js 15+ App Router, Vercel is the natural choice for serverless scaling.

1. Import your repository into **Vercel Console**.
2. Set the framework preset to **Next.js**.
3. Configure the following critical environment variables:
   - `DATABASE_URL` (e.g. Supabase, Neon, or RDS instance with `pgvector`)
   - `BETTER_AUTH_SECRET` (generate with `openssl rand -hex 32`)
   - `BETTER_AUTH_URL` (your custom production URL, e.g. `https://crm.flowlinepro.io`)
   - `NEXT_PUBLIC_APP_URL`
   - `OPENAI_API_KEY`
   - `RESEND_API_KEY`
   - `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
4. Add the build override if necessary, or let Vercel run `npm run build` automatically.

### Option B: Self-Hosted Docker (Coolify, Portainer, VPS)
To host Flowline Pro on virtual private servers (VPS) using Docker:

1. **Build Production Image**:
   ```bash
   docker build -t flowlinepro:latest .
   ```
2. **Apply Production Database Migrations**:
   Run the migration deploy command *before* restarting your production container:
   ```bash
   pnpm prisma migrate deploy
   ```
3. **Container Orchestration**:
   Ensure `docker-compose.yml` uses permanent directory volumes for PostgreSQL data (`/var/lib/postgresql/data`) and MinIO storage data (`/data`) to prevent data loss across restarts.
