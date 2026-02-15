import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connections
const clients = new Map<WebSocket, { agentId?: string; sessionId?: string }>();

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  clients.set(ws, {});
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'register':
          // Register client for specific agent/session
          clients.set(ws, { 
            agentId: message.agentId, 
            sessionId: message.sessionId 
          });
          ws.send(JSON.stringify({ type: 'registered', success: true }));
          break;
          
        case 'trace':
          // Save trace to database
          const trace = await prisma.trace.create({
            data: {
              agentId: message.agentId,
              sessionId: message.sessionId,
              action: message.action,
              toolName: message.toolName,
              input: message.input,
              output: message.output,
              tokensUsed: message.tokensUsed,
              cost: message.cost,
              error: message.error,
              duration: message.duration,
              status: message.status || 'success',
            }
          });
          
          // Broadcast to subscribers
          broadcastToSubscribers('trace', trace, message.agentId);
          ws.send(JSON.stringify({ type: 'trace_saved', id: trace.id }));
          break;
          
        case 'metric':
          // Save metric
          await prisma.metric.create({
            data: {
              agentId: message.agentId,
              name: message.name,
              value: message.value,
            }
          });
          broadcastToSubscribers('metric', message, message.agentId);
          break;
          
        case 'decision':
          // Save decision
          const decision = await prisma.decision.create({
            data: {
              agentId: message.agentId,
              type: message.decisionType,
              reasoning: message.reasoning,
              result: message.result,
              success: message.success,
            }
          });
          broadcastToSubscribers('decision', decision, message.agentId);
          break;
          
        case 'memory_snapshot':
          // Save memory snapshot
          const memorySnapshot = await prisma.memorySnapshot.create({
            data: {
              agentId: message.agentId,
              totalMemory: message.totalMemory,
              usedMemory: message.usedMemory,
              contextWindow: message.contextWindow,
              maxContextWindow: message.maxContextWindow,
            }
          });
          broadcastToSubscribers('memory_snapshot', memorySnapshot, message.agentId);
          break;
          
        case 'heartbeat':
          // Update agent status
          await prisma.agent.update({
            where: { id: message.agentId },
            data: { status: message.status || 'running' }
          });
          broadcastToSubscribers('agent_status', { 
            agentId: message.agentId, 
            status: message.status 
          });
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

function broadcastToSubscribers(type: string, data: any, agentId?: string) {
  clients.forEach((client, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      // Broadcast if subscribed to all or specific agent
      if (!client.agentId || client.agentId === agentId) {
        ws.send(JSON.stringify({ type, data }));
      }
    }
  });
}

// REST API Routes

// Agents
app.get('/api/agents', async (req, res) => {
  const agents = await prisma.agent.findMany({
    include: {
      _count: {
        select: { traces: true, decisions: true }
      }
    }
  });
  res.json(agents);
});

app.get('/api/agents/:id', async (req, res) => {
  const agent = await prisma.agent.findUnique({
    where: { id: req.params.id },
    include: {
      traces: { take: 100, orderBy: { timestamp: 'desc' } },
      decisions: { take: 50, orderBy: { timestamp: 'desc' } },
      memorySnapshots: { take: 50, orderBy: { timestamp: 'desc' } },
    }
  });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

app.post('/api/agents', async (req, res) => {
  const agent = await prisma.agent.create({
    data: {
      name: req.body.name,
      type: req.body.type,
      status: req.body.status || 'idle',
      metadata: req.body.metadata,
    }
  });
  res.json(agent);
});

app.patch('/api/agents/:id', async (req, res) => {
  const agent = await prisma.agent.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(agent);
});

// Traces
app.get('/api/traces', async (req, res) => {
  const { agentId, sessionId, limit = '100', offset = '0' } = req.query;
  
  const traces = await prisma.trace.findMany({
    where: {
      agentId: agentId as string,
      sessionId: sessionId as string,
    },
    take: parseInt(limit as string),
    skip: parseInt(offset as string),
    orderBy: { timestamp: 'desc' },
    include: { agent: true }
  });
  
  res.json(traces);
});

app.get('/api/traces/:id', async (req, res) => {
  const trace = await prisma.trace.findUnique({
    where: { id: req.params.id },
    include: { agent: true, memorySnapshot: true }
  });
  if (!trace) return res.status(404).json({ error: 'Trace not found' });
  res.json(trace);
});

// Sessions
app.get('/api/sessions', async (req, res) => {
  const sessions = await prisma.session.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: { agent: true, _count: { select: { traces: true } } }
  });
  res.json(sessions);
});

app.post('/api/sessions', async (req, res) => {
  const session = await prisma.session.create({
    data: {
      name: req.body.name,
      agentId: req.body.agentId,
    }
  });
  res.json(session);
});

// Metrics
app.get('/api/metrics', async (req, res) => {
  const { agentId, name, from, to, interval = 'hour' } = req.query;
  
  const where: any = { agentId: agentId as string };
  if (name) where.name = name as string;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from as string);
    if (to) where.timestamp.lte = new Date(to as string);
  }
  
  const metrics = await prisma.metric.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 1000
  });
  
  res.json(metrics);
});

app.get('/api/metrics/summary', async (req, res) => {
  const { agentId } = req.query;
  
  const summary = await prisma.metric.groupBy({
    by: ['name'],
    where: { agentId: agentId as string },
    _avg: { value: true },
    _max: { value: true },
    _min: { value: true },
    _count: { value: true }
  });
  
  res.json(summary);
});

// Decisions (Strategic vs Tactical)
app.get('/api/decisions', async (req, res) => {
  const { agentId, type, from, to } = req.query;
  
  const where: any = { agentId: agentId as string };
  if (type) where.type = type as string;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from as string);
    if (to) where.timestamp.lte = new Date(to as string);
  }
  
  const decisions = await prisma.decision.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 500,
    include: { agent: true }
  });
  
  res.json(decisions);
});

app.get('/api/decisions/summary', async (req, res) => {
  const { agentId } = req.query;
  
  const summary = await prisma.decision.groupBy({
    by: ['type'],
    where: { agentId: agentId as string },
    _count: { id: true },
    _avg: { success: true }
  });
  
  res.json(summary);
});

// Memory Snapshots
app.get('/api/memory', async (req, res) => {
  const { agentId, from, to } = req.query;
  
  const where: any = { agentId: agentId as string };
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from as string);
    if (to) where.timestamp.lte = new Date(to as string);
  }
  
  const snapshots = await prisma.memorySnapshot.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 500,
    include: { agent: true }
  });
  
  res.json(snapshots);
});

// Learning Curves - Aggregate metrics over time
app.get('/api/learning-curves', async (req, res) => {
  const { agentId, metric, from, to, granularity = 'day' } = req.query;
  
  // For demo, return simulated learning curve data
  const now = new Date();
  const days = 30;
  const data = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic-looking data with improvement trend
    const baseValue = 50 + (days - i) * 1.5; // Improving over time
    const noise = Math.random() * 20 - 10;
    
    data.push({
      date: date.toISOString().split('T')[0],
      successRate: Math.min(100, Math.max(0, baseValue + noise)),
      avgTokens: Math.floor(2000 - (days - i) * 30 + Math.random() * 200),
      avgDuration: Math.floor(5000 - (days - i) * 100 + Math.random() * 500),
      taskCount: Math.floor(10 + Math.random() * 20 + (days - i) * 0.5),
    });
  }
  
  res.json(data);
});

// Agent Communications (Topology)
app.get('/api/communications', async (req, res) => {
  const { agentId } = req.query;
  
  const communications = await prisma.agentCommunication.findMany({
    where: {
      OR: [
        { fromAgentId: agentId as string },
        { toAgentId: agentId as string }
      ]
    },
    orderBy: { timestamp: 'desc' },
    take: 200,
    include: { fromAgent: true, toAgent: true }
  });
  
  res.json(communications);
});

app.get('/api/topology', async (req, res) => {
  // Get all agents and their communication patterns
  const agents = await prisma.agent.findMany({
    include: {
      _count: { select: { traces: true, communications: true, receivedComm: true } }
    }
  });
  
  const communications = await prisma.agentCommunication.findMany({
    take: 100,
    orderBy: { timestamp: 'desc' }
  });
  
  // Build topology data
  const nodes = agents.map(agent => ({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    status: agent.status,
    activity: agent._count.traces,
    connections: agent._count.communications + agent._count.receivedComm
  }));
  
  const edges = communications.map(comm => ({
    source: comm.fromAgentId,
    target: comm.toAgentId,
    weight: 1,
    type: comm.messageType
  }));
  
  res.json({ nodes, edges });
});

// Alerts
app.get('/api/alerts', async (req, res) => {
  const { resolved, severity } = req.query;
  
  const where: any = {};
  if (resolved !== undefined) where.resolved = resolved === 'true';
  if (severity) where.severity = severity;
  
  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 100
  });
  
  res.json(alerts);
});

app.post('/api/alerts/:id/resolve', async (req, res) => {
  const alert = await prisma.alert.update({
    where: { id: req.params.id },
    data: { resolved: true, resolvedAt: new Date() }
  });
  res.json(alert);
});

// Dashboard Overview
app.get('/api/overview', async (req, res) => {
  const [totalAgents, activeAgents, totalTraces, recentErrors, alerts] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { status: 'running' } }),
    prisma.trace.count({ where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.trace.count({ where: { status: 'error', timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.alert.count({ where: { resolved: false } })
  ]);
  
  res.json({
    totalAgents,
    activeAgents,
    totalTracesLast24h: totalTraces,
    recentErrors,
    unresolvedAlerts: alerts
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SCOPE Analytics Backend running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
