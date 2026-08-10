# FuelWise

FuelWise is a full-stack fuel cost calculator and trip-planning application. It combines route distance, vehicle consumption, tank capacity, traffic conditions, and current fuel-price ranges to produce practical journey estimates.

**Live application:** [fuelwise.com.tr](https://fuelwise.com.tr)

## Highlights

- Interactive trip planning with address search, map selection, reverse geocoding, and road-distance calculation
- Minimum and maximum estimates for fuel consumption, total cost, and required fuel stops
- Traffic profiles: Flowing, Normal, Heavy, and Very Heavy
- Province-based gasoline, diesel, and LPG price data sourced from EPDK records
- Personal vehicle garage with create, edit, delete, and default-vehicle support
- Secure registration, login, logout, and session renewal
- Email verification flows for password changes, password recovery, and account deletion
- User profile with account information and recent trip history
- English, Turkish, Russian, and Simplified Chinese interface options
- Responsive multi-page design with animated modals, loaders, and media backgrounds

## Technology Stack

### Frontend

- Semantic HTML5
- CSS3
- Vanilla JavaScript
- [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles
- [Nominatim](https://nominatim.org/) for address search and reverse geocoding
- [OSRM](https://project-osrm.org/) for driving routes and distance

### Backend

- [FastAPI](https://fastapi.tiangolo.com/)
- PostgreSQL 17
- SQLAlchemy 2 and Alembic migrations
- Pydantic settings and validation
- JWT access tokens with rotating refresh tokens
- Argon2 password hashing
- SMTP email delivery

### Production

- Docker and Docker Compose
- Caddy reverse proxy with automatic HTTPS
- Cloudflare DNS
- Structured JSON logging, security headers, and request rate limiting

## Project Structure

```text
fuelwise/
|-- backend/
|   |-- alembic/                 # Database migrations
|   |-- app/
|   |   |-- api/                 # Authentication, vehicles, trips, fuel prices
|   |   |-- core/                # Configuration, security, logging, middleware
|   |   |-- models/              # SQLAlchemy models
|   |   |-- schemas/             # Request and response schemas
|   |   `-- services/            # Authentication, email, EPDK and pricing logic
|   |-- deploy/                  # Caddy configuration
|   |-- scripts/                 # Backup and restore utilities
|   |-- tests/                   # Automated backend tests
|   |-- compose.production.yml
|   `-- docker-compose.yml
|-- frontend/
|   |-- assets/
|   |-- css/
|   |-- js/
|   |-- pages/
|   `-- index.html
|-- .dockerignore
`-- .gitignore
```

## Local Development

### Prerequisites

- Python 3.12 or newer
- Docker Desktop or a local PostgreSQL installation
- Git

### 1. Clone the repository

```bash
git clone https://github.com/selimeskimumcu/FuelWise.git
cd FuelWise/backend
```

### 2. Configure the environment

Copy the example file and replace the development placeholders:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

At minimum, use a long random `JWT_SECRET_KEY`. SMTP credentials are required for email-based verification flows. Real `.env` files are ignored by Git and must never be committed.

### 3. Start PostgreSQL

```bash
docker compose up -d postgres
```

The development database is exposed on port `5433` to avoid conflicts with an existing PostgreSQL installation.

### 4. Install the backend

```bash
python -m venv .venv
```

Activate the environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies and apply migrations:

```bash
pip install -r requirements-dev.txt
alembic upgrade head
```

### 5. Run FuelWise

```bash
uvicorn app.main:app --reload
```

Open:

- Application: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

FastAPI serves both the API and the frontend, so a separate frontend server is not required.

## Main API Routes

| Area | Routes |
| --- | --- |
| Authentication | `/api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/me` |
| Account security | `/api/v1/auth/password-reset/*`, `/account/action-code/*`, `/account/change-password`, `/account/delete` |
| Vehicles | `/api/v1/vehicles`, `/api/v1/vehicles/{id}`, `/api/v1/vehicles/{id}/default` |
| Trips | `/api/v1/trips`, `/api/v1/trips/calculate` |
| Fuel prices | `/api/v1/fuel-prices` |
| Service health | `/health` |

Interactive OpenAPI documentation is enabled in development and disabled in production.

## Trip Estimate Model

FuelWise uses the selected route distance and the vehicle's average consumption as its baseline. It then produces a range that accounts for:

- Estimated urban driving
- The selected traffic condition
- General road and weather uncertainty
- Climate-control and vehicle-load effects
- Minimum and maximum fuel prices for the selected province

Results are estimates and should not be treated as guaranteed fuel usage or travel cost.

## Security

- Passwords are hashed with Argon2 and are never stored in plain text.
- Access and refresh tokens are stored in HttpOnly cookies.
- Refresh tokens rotate and can be revoked during logout.
- Production cookies require HTTPS.
- Authentication and verification endpoints are rate-limited.
- Verification codes expire and have attempt limits.
- CORS origins are explicit in production.
- CSP, HSTS, and other browser security headers are enabled.
- Logs exclude passwords, cookies, tokens, verification codes, request bodies, and raw IP addresses.
- PostgreSQL is available only on the private production network.

## Tests

From the `backend` directory, run:

```bash
pytest -q
```

The suite covers authentication, account security, password resets, vehicles, trip calculations, fuel pricing, configuration, and rate limiting.

## Production Deployment

Create a server-only environment file from `backend/.env.production.example`, replace every placeholder, and start the production stack:

```bash
cd backend
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

The production stack contains:

- `caddy`: public HTTP/HTTPS entry point and certificate management
- `app`: private FastAPI application container
- `postgres`: private PostgreSQL container with persistent storage

Caddy redirects HTTP to HTTPS and automatically obtains and renews TLS certificates. Never commit `.env.production`, database dumps, logs, private keys, or server credentials.

## Data Sources and External Services

Fuel prices are derived from publicly available EPDK records and cached by the backend. Map and routing features depend on OpenStreetMap, Nominatim, and the public OSRM service. Availability and results may therefore be affected by those external services and their usage policies.

## Contributing

1. Create a feature branch from `main`.
2. Keep secrets and generated files out of commits.
3. Add or update tests for backend changes.
4. Open a pull request with a clear description of the change.

## Contact

FuelWise Support: [fuelwise.support@gmail.com](mailto:fuelwise.support@gmail.com)

---

Built as a full-stack web development project focused on practical journey planning, secure account management, and production deployment.
