# FuelWise Backend

FastAPI and PostgreSQL backend for FuelWise.

## Local setup

1. Copy `.env.example` to `.env` and replace `JWT_SECRET_KEY`.
2. Start PostgreSQL:
   `docker compose up -d postgres`
3. Create and activate a Python virtual environment.
4. Install development and test dependencies:
   `pip install -r requirements-dev.txt`
5. Apply database migrations:
   `alembic upgrade head`
6. Start the API:
   `uvicorn app.main:app --reload`

API documentation is available at `http://127.0.0.1:8000/docs`.
The FuelWise frontend is available at `http://127.0.0.1:8000/`.

## Authentication endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## Vehicle endpoints

- `GET /api/v1/vehicles`
- `POST /api/v1/vehicles`
- `GET /api/v1/vehicles/{id}`
- `PATCH /api/v1/vehicles/{id}`
- `PATCH /api/v1/vehicles/{id}/default`
- `DELETE /api/v1/vehicles/{id}`

Authentication uses short-lived access tokens and rotating refresh tokens in HttpOnly cookies.

## Production security configuration

- Keep real credentials in the hosting provider's secret store; never commit `.env` files.
- Use `.env.production.example` as the list of required production variables.
- Generate a unique `JWT_SECRET_KEY` with at least 48 random characters.
- Set `COOKIE_SECURE=true` and serve the application only over HTTPS.
- Set `ALLOWED_ORIGINS` to explicit HTTPS origins. Wildcards and HTTP origins are rejected in production.
- Use a unique production database password and keep SMTP credentials outside source control.

FuelWise refuses to start in `production` when these minimum requirements are not met. Local development continues to use non-secure cookies so `http://127.0.0.1:8000` remains usable.

Authentication and verification endpoints also use IP- and account-based request limits. A limited response returns HTTP `429` with a `Retry-After` header. Identifiers are HMAC-hashed before being stored in the in-memory counters. Keep `RATE_LIMIT_TRUST_PROXY_HEADERS=false` unless FuelWise is deployed behind a trusted proxy that overwrites `X-Forwarded-For`.

The current limiter is suitable for one application process. Before running multiple API instances, move the counters to a shared store such as Redis so every instance enforces the same limits.

Every response includes a request ID and browser security headers. The Content Security Policy allows only FuelWise plus the specific CDN, map, geocoding and routing services used by the frontend. Production responses also enable HSTS, and API documentation is disabled in production.

Application logs are structured JSON and contain request method, path, status, duration, request ID and an anonymized client key. Request bodies, passwords, cookies, tokens, verification codes and raw IP addresses are not logged. Unexpected errors return a generic message and request ID instead of exposing a stack trace to the user.

## PostgreSQL backups

Create a compressed custom-format backup and keep the latest 14 days:

```powershell
.\scripts\Backup-Database.ps1
```

Every backup has a JSON sidecar containing its UTC creation time, size and SHA-256 checksum. Backup contents are checked with `pg_restore --list`, and backup files are excluded from Git.

Verify a backup by restoring it into an isolated temporary database, querying its tables and deleting only that temporary database afterward:

```powershell
.\scripts\Test-DatabaseRestore.ps1 -BackupFile .\backups\fuelwise-YYYYMMDD-HHMMSS.dump
```

`Restore-Database.ps1` refuses to overwrite the main `fuelwise` database unless `-AllowFuelWiseOverwrite` is explicitly supplied. Before a real restore, enable maintenance mode, take a fresh backup and stop application writes.

For production, schedule `Backup-Database.ps1` daily and copy encrypted backups to storage outside the application server. A backup kept only on the same machine is not sufficient disaster recovery.

## HTTPS production deployment

The production stack consists of three isolated services:

- `caddy`: the only public service; redirects HTTP to HTTPS and manages TLS certificates automatically.
- `app`: runs migrations before starting FuelWise and is reachable only inside the Docker network.
- `postgres`: has no public port and stores data in a persistent Docker volume.

Deployment checklist:

1. Rent a Linux server and point `fuelwise.com.tr` plus `www.fuelwise.com.tr` DNS records to it.
2. Allow inbound TCP ports 80 and 443 and UDP port 443. Do not expose PostgreSQL port 5432.
3. Copy `.env.production.example` to a server-only `.env.production` and replace every placeholder with unique values.
4. Ensure `DOMAIN` and `ALLOWED_ORIGINS` describe the same HTTPS site.
5. Start the stack from `backend`:

```bash
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

6. Verify `https://your-domain/health`, registration, login, email delivery, vehicles and Trip Planner.
7. Schedule database backups and copy encrypted copies off the server.

Caddy obtains and renews the HTTPS certificate automatically after DNS points to the server. The application container uses a read-only filesystem and the database is accessible only on the private Docker network. Keep one app replica until the in-memory request limiter is moved to Redis.

## Tests

Run `pytest` from the `backend` directory.
