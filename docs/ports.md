Backend and frontend port assignments

- **backend**: `3000` (Axum server; `backend/src/main.rs` binds to this port)
- **frontend (vite)**: `5173` (set in `frontend/vite.config.ts`)

## Service Port Assignments

| Service | Port | Protocol | Purpose | Status |
|---------|------|----------|---------|--------|
| Backend API | 3000 | HTTP/HTTPS | Rust/Axum REST API | ✅ Active |
| Frontend Dev | 5173 | HTTP | Vite development server | ✅ Active |
| Frontend Prod | 5173 | HTTP | Vite preview (production build) | 🟡 As needed |
| PostgreSQL | 5432 | TCP | Production database (future) | 🔮 Planned |
| Redis | 6379 | TCP | Caching layer (future) | 🔮 Planned |
| WebSocket | 3001 | WS/WSS | Real-time updates (future) | 🔮 Planned |

## Notes

### Current Setup (SQLite)
- Backend's default `backend/config/default.toml` uses SQLite at `data/app.db`
- The backend expects the `backend/data` directory to exist
- SQLite is suitable for development and small-scale deployments

### Docker Compose
- Docker compose has been added at `docker-compose.yml`
- Current service mappings:
  - `backend` container: maps host `3000:3000` (container listens on 3000)
  - `frontend` container: maps host `5173:5173`
- The backend service volume maps `./backend/data` -> `/app/data` inside the container
- Docker compose sets `DATABASE_URL=sqlite:////app/data/app.db`

### Mac M1/M2 (Apple Silicon)
- Ensure Docker Desktop Buildx is enabled for multi-arch builds
- The `backend/Dockerfile` is a multi-stage build
- May require additional tweaks for cross-architecture images

### Docker Networking
- Frontend uses service name `backend` to communicate with backend container (not localhost)
- Environment variable `VITE_API_URL=http://backend:3000` set in docker-compose.yml

### Future Migrations

**PostgreSQL (Planned for Production)**:
- Port: 5432
- Use when targeting workbench reaches production scale
- Migration from SQLite will be straightforward (same Rust queries)
- Benefits: Better concurrency, replication, performance at scale

**Redis (Planned for Caching)**:
- Port: 6379
- Use for session caching, real-time data caching
- Reduces database load for frequently accessed data

**WebSocket Server (Planned for Real-Time)**:
- Port: 3001
- Use for real-time targeting updates, decision gates, TST alerts
- Separate from main API for performance isolation

## Usage

### Start All Services
```bash
docker compose build
docker compose up
```

### Start Individual Services
```bash
docker compose up -d backend
docker compose up -d frontend
```

### Stop All Services
```bash
docker compose down
```

### View Logs
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs -f  # Follow logs from all services
```

## Port Conflicts

If ports are already in use, modify `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "3001:3000"  # Change host port (left side)
  frontend:
    ports:
      - "5174:5173"  # Change host port (left side)
```

Then update `VITE_API_URL` in frontend environment to match new backend port.

---

## Feature API Endpoints

All features share the same **backend port 3000** with different URL paths:

| Feature | API Path | Status | Notes |
|---------|----------|--------|-------|
| Authentication | `/api/auth/*` | ✅ Active | JWT-based auth |
| Users | `/api/users/*` | ✅ Active | User management |
| ABAC | `/api/abac/*` | ✅ Active | Permissions |
| Dashboard | `/api/dashboard/*` | ✅ Active | Dashboard data |
| Operations | `/api/operations/*` | ✅ Active | Operational data |
| Assumptions | `/api/assumptions/*` | ✅ Active | Planning assumptions |
| Targeting | `/api/targeting/*` | 🟡 Partial | Basic targeting |
| **BDA Workbench** | `/api/bda/*` | 🔮 Planned | Battle Damage Assessment |

**BDA Endpoints (Planned):**
- `POST /api/bda/reports` - Create BDA report
- `GET /api/bda/reports` - List reports
- `GET /api/bda/reports/:id` - Get single report
- `PUT /api/bda/reports/:id` - Update report
- `GET /api/bda/queue` - Assessment queue
- `GET /api/bda/statistics` - BDA statistics
- `POST /api/bda/reports/:id/imagery` - Upload imagery
- `POST /api/bda/reports/:id/approve` - Approve report

See `/docs/BDA_WORKBENCH_IMPLEMENTATION_PLAN.md` for complete BDA architecture.

---

**Last Updated**: 2026-01-21  
**Related Docs**: 
- `README.md` - Project overview
- `docker-compose.yml` - Service definitions
- `docs/BDA_WORKBENCH_IMPLEMENTATION_PLAN.md` - BDA system architecture
- `docs/BDA_REQUIREMENTS_SUMMARY.md` - BDA requirements (200+)



