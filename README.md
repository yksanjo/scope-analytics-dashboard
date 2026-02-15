# SCOPE Analytics Dashboard

Enterprise real-time monitoring and visualization platform for agent execution traces. Track learning curves, memory utilization, strategic vs tactical decision patterns, and multi-agent system topology.

![Dashboard Preview](https://via.placeholder.com/800x400?text=SCOPE+Analytics+Dashboard)

## Features

- **Real-Time Agent Monitoring**: Live execution trace streaming via WebSocket
- **Learning Curves**: Track success rates, token efficiency, task duration over time
- **Memory Utilization**: Monitor context window consumption and detect memory leaks
- **Decision Pattern Analysis**: Strategic vs Tactical decision classification and visualization
- **Multi-Agent Topology**: Visualize agent networks and communication patterns
- **Enterprise-Ready**: PostgreSQL storage, RESTful API, WebSocket support

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL with Prisma ORM
- WebSocket (ws) for real-time updates

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Recharts for visualizations
- Tailwind CSS
- Zustand for state management

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Option 1: Local Development

1. **Clone and install dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Set up PostgreSQL**

```bash
# Create database
createdb scope_analytics

# Copy environment file
cp ../.env.example .env
# Edit .env with your database URL
```

3. **Run Prisma migrations**

```bash
cd backend
npx prisma generate
npx prisma db push
```

4. **Start the backend**

```bash
npm run dev
# Runs on http://localhost:3001
```

5. **Start the frontend** (in a new terminal)

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Option 2: Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create agent
- `PATCH /api/agents/:id` - Update agent

### Traces
- `GET /api/traces` - List traces (with filters)
- `GET /api/traces/:id` - Get trace details

### Metrics
- `GET /api/metrics` - Get metrics
- `GET /api/metrics/summary` - Get metrics summary

### Decisions
- `GET /api/decisions` - Get decisions
- `GET /api/decisions/summary` - Get decision summary

### Learning Curves
- `GET /api/learning-curves` - Get learning curve data

### Memory
- `GET /api/memory` - Get memory snapshots

### Topology
- `GET /api/topology` - Get agent topology

### Dashboard
- `GET /api/overview` - Get dashboard overview

## WebSocket Messages

Connect to `ws://localhost:3001` and send JSON messages:

```javascript
// Register for updates
{ "type": "register", "agentId": "agent-123" }

// Submit trace
{
  "type": "trace",
  "agentId": "agent-123",
  "sessionId": "session-456",
  "action": "search",
  "toolName": "web_search",
  "tokensUsed": 1200,
  "cost": 0.0024,
  "status": "success"
}

// Submit metric
{
  "type": "metric",
  "agentId": "agent-123",
  "name": "success_rate",
  "value": 0.85
}

// Submit decision
{
  "type": "decision",
  "agentId": "agent-123",
  "decisionType": "strategic",
  "reasoning": "Analyzing best approach",
  "success": true
}

// Memory snapshot
{
  "type": "memory_snapshot",
  "agentId": "agent-123",
  "totalMemory": 8000000000,
  "usedMemory": 5000000000,
  "contextWindow": 75000,
  "maxContextWindow": 100000
}

// Heartbeat
{
  "type": "heartbeat",
  "agentId": "agent-123",
  "status": "running"
}
```

## Project Structure

```
scope-analytics-dashboard/
├── backend/
│   ├── src/
│   │   └── index.ts          # Main server entry
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Main dashboard page
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── globals.css  # Global styles
│   │   └── components/      # Reusable components
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── docker-compose.yml
├── .env.example
├── SPEC.md
└── README.md
```

## Development

### Adding New Visualizations

1. Create component in `frontend/src/components/charts/`
2. Import and use in `frontend/src/app/page.tsx`

### Database Schema Changes

1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push`

## License

MIT License - feel free to use for your own projects.
