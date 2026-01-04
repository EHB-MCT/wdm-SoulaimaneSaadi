# WDM - Web Dashboard Manager

Management application with Admin and Child interfaces, allowing tracking of children events (check-in/out, punishments, loans) with real-time dashboard.

## Prerequisites

- Docker
- Docker Compose

## Step-by-Step Setup Guide

### 1. Clone repository
```bash
git clone https://github.com/your-username/wdm-SoulaimaneSaadi.git
cd wdm-SoulaimaneSaadi
```

### 2. Configure environment variables
Copy template files to configuration files:

```bash
cp backend/.env.template backend/.env
```

Configure necessary variables in `backend/.env`:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for tokens
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Admin credentials

If available, also configure:
```bash
cp admin-frontend/.env.template admin-frontend/.env
cp child-frontend/.env.template child-frontend/.env
```

### 3. Start all services
```bash
docker compose up --build
```

## Seed Data

The application automatically populates the database with initial data on first startup. This ensures the system is ready for testing immediately after deployment.

### What's Included

**👤 Admin Account**
- Email: `admin@wdm.com`
- Password: `password`
- Created automatically on first startup

**📦 Sample Items**
- Basketball (available)
- Football (available) 
- Rope (available)
- Table Tennis Paddle (available)
- Jumping Rope (available)
- Baseball Bat (not available)
- Tennis Ball (available)

**👶 Sample Children**
- **Alice Johnson** (`alice@test.com` / `child123`) - Status: PRESENT
- **Bob Smith** (`bob@test.com` / `child123`) - Status: CHECKED_OUT, has Basketball
- **Charlie Brown** (`charlie@test.com` / `child123`) - Status: PRESENT, restricted
- **Diana Wilson** (`diana@test.com` / `child123`) - Status: PRESENT, has Football
- **Ethan Davis** (`ethan@test.com` / `child123`) - Status: PUNISHED

**📅 Sample Events**
Each child gets sample events including:
- Check-in/check-out records
- Punishment start/end with durations
- Historical tracking for testing filters and statistics

### How it Works

- **Idempotent**: Seed only runs if data doesn't exist
- **Automatic**: Runs on every backend startup
- **Safe**: Won't duplicate data on restart
- **Persistent**: Data survives container restarts via Docker volumes

### Reset Database

To completely reset and reseed:

```bash
docker compose down -v
docker compose up --build
```

⚠️ **Warning**: This removes ALL existing data including any changes made through the interface.

## Access URLs

- **Admin frontend**: http://localhost:5173/
- **Child frontend**: http://localhost:5174/
- **Backend API**: http://localhost:3000/
- **Mongo Express**: http://localhost:8081/

## Testing Flow

### User/Child Flow
1. Access http://localhost:5174/
2. Login with child credentials
3. Check current status
4. View restrictions and current loans
5. Visualize event history

### Admin Flow
1. Access http://localhost:5173/
2. Login with admin credentials (`admin@wdm.com` / `password`)
3. View complete children list
4. Filter children:
   - Present only
   - Restricted only
   - Has item only
5. Sort children by:
   - Name
   - Punishments
   - Loans
6. Select a child to view details
7. Create events:
   - CHECK_IN: child present
   - CHECK_OUT: child out
   - PUNISH_START: punishment start
   - PUNISH_END: punishment end
8. View statistics in Events panel
9. Manage item loans

## File Structure Overview

```
wdm-SoulaimaneSaadi/
├── backend/
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Child.js
│   │   ├── Event.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── adminAuth.js
│   │   ├── auth.js
│   │   ├── children.js
│   │   ├── events.js
│   │   ├── items.js
│   │   └── loan.js
│   ├── backend.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.template
├── admin-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── child-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── mongo-init.js
└── README.md
```

## Stopping

```bash
docker compose down
```

## Optional: Reset database completely

⚠️ **Warning**: This command removes all MongoDB data.

```bash
docker compose down -v
```

## API Endpoints

### Authentication
- `POST /admin/login` - Administrator login
- `POST /auth/login` - User/child login

### Children Management
- `GET /children` - List all children
- `GET /children/:id` - Details of specific child
- `PUT /children/:id` - Update child

### Events Management
- `GET /events` - List events (filter `childId=` available)
- `POST /events` - Create new event
- `GET /events/child/:childId` - Events of specific child

### Items & Loans
- `GET /items` - List available items
- `POST /items` - Create item
- `POST /loan` - Create loan
- `PUT /loan/:id` - Update loan

*(Check complete list in backend/routes/)*

## Notes Docker / Troubleshooting

### Mongo Express
- URL: http://localhost:8081/
- Credentials: admin / password
- In case of authentication error, check `ME_CONFIG_MONGODB_AUTH_USERNAME` and `ME_CONFIG_MONGODB_AUTH_PASSWORD` variables in docker-compose.yml

### Used Ports
- 3000: Backend API
- 5173: Admin Frontend
- 5174: Child Frontend
- 8081: Mongo Express
- 27017: MongoDB

### Common Issues
- If frontends don't load: verify containers are properly built with `--build`
- If MongoDB refuses connections: restart with `docker compose down -v && docker compose up --build`

## Sources and References

- Docker Compose environment variables documentation
- Mongo Express Docker Hub
- Express.js framework
- Mongoose ODM
- AI Assistance - OpenCode

## Admin data

- Email: admin@test.com
- Password: admin123

- Docker Compose environment variables documentation
- Mongo Express Docker Hub
- Express.js framework
- Mongoose ODM
- AI Assistance - OpenCode


# Portfolio
https://reactnative.dev/docs/environment-setup: Setup React Native project
https://reactnative.dev/docs/set-up-your-environment?os=macos&platform=ios: Run on all platforms
liscense, readme, code of conduct, contributing guideline

[Dockerfile](https://docs.docker.com/reference/dockerfile/)

[React](https://react.dev/learn)

[useState](https://react.dev/reference/react/useState)

[useEffect](https://react.dev/reference/react/useEffect)

[Chatgpt](https://chatgpt.com/share/695a295c-706c-8005-b14d-bb4677d888ac)

[Chatgpt](https://chatgpt.com/share/695a299d-dea0-8005-bcb9-d62fe0a7038b)

