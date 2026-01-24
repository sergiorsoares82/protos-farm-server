# protos-farm-server

## Development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env/.env` file with required environment variables:
   ```env
   POSTGRES_PASSWORD=your_password
   POSTGRES_USER=postgres
   POSTGRES_DB=protos-farm
   ```

### Running Locally
```bash
# Start database
docker compose up db -d

# Run development server with hot reload
npm run dev
```

The server will be available at `http://localhost:3000`

## Deployment

### Option 1: Docker Compose (Recommended for Production)

Deploy both the app and database together:

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Services:
- **App**: `http://localhost:3000`
- **Database**: `localhost:5430` (host) → `5432` (container)

### Option 2: Build and Deploy Manually

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Option 3: Deploy to Cloud Platforms

#### Vercel (Serverless - Recommended for API)

**Prerequisites:**
- Vercel account (free tier available)
- Vercel CLI: `npm i -g vercel`

**Deploy Steps:**

1. **First deployment:**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

2. **Production deployment:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables:**
   ```bash
   vercel env add POSTGRES_PASSWORD
   vercel env add POSTGRES_USER
   vercel env add POSTGRES_DB
   vercel env add DB_HOST
   vercel env add DB_PORT
   ```

   Or via Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add your database credentials

4. **For database**, use a managed PostgreSQL service:
   - **Vercel Postgres** (integrated)
   - **Supabase** (free tier)
   - **Neon** (serverless Postgres)
   - **Railway** (PostgreSQL addon)

**Note:** Vercel serverless functions have:
- 10-second execution timeout (Hobby plan)
- No persistent storage (use external database)
- Cold starts (~1-2 seconds for inactive functions)

#### Heroku
```bash
# Install Heroku CLI and login
heroku create protos-farm-server

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

#### Railway
1. Connect your GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push

#### DigitalOcean/AWS/GCP
1. Build Docker image:
   ```bash
   docker build -t protos-farm-server .
   ```
2. Push to container registry
3. Deploy using container service

## Environment Variables

Required variables:
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_DB` - Database name (default: protos-farm)
- `DB_HOST` - Database host (default: db for Docker, localhost for local)
- `DB_PORT` - Database port (default: 5432)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## Project Structure

```
.
├── src/
│   └── server.ts        # Main application entry point
├── dist/                # Compiled JavaScript (generated)
├── .env/
│   └── .env            # Environment variables (not in git)
├── docker-compose.yaml  # Docker Compose configuration
├── Dockerfile          # Docker image definition
├── package.json
└── tsconfig.json
```

## Database Access

Connect to PostgreSQL:

```bash
# Via Docker
docker exec -it protos-farm-db psql -U postgres -d protos-farm

# Via local psql
psql --host=localhost --username=postgres --port=5430 --dbname=protos-farm
```

## Troubleshooting

### Container won't start
- Check logs: `docker compose logs app`
- Verify environment variables are set
- Ensure port 3000 is not already in use

### Database connection issues
- Verify database container is running: `docker ps`
- Check database logs: `docker compose logs db`
- Verify connection string matches environment variables

