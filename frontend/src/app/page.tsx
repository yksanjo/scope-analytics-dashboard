'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Network, Search, Bell, User, GitBranch, Activity, 
  MessageSquare, ArrowUpRight, ArrowDownRight, Zap, Clock
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  messagesSent: number;
  messagesReceived: number;
  tasksCompleted: number;
  cpu: number;
  memory: number;
}

interface Communication {
  from: string;
  to: string;
  count: number;
  latency: number;
}

const generateAgents = (): Agent[] => [
  { id: '1', name: 'Orchestrator', role: 'Coordinator', status: 'active', messagesSent: 1250, messagesReceived: 1100, tasksCompleted: 450, cpu: 45, memory: 62 },
  { id: '2', name: 'Research Agent', role: 'Data Gathering', status: 'active', messagesSent: 890, messagesReceived: 920, tasksCompleted: 320, cpu: 38, memory: 55 },
  { id: '3', name: 'Code Agent', role: 'Code Generation', status: 'active', messagesSent: 720, messagesReceived: 680, tasksCompleted: 280, cpu: 52, memory: 71 },
  { id: '4', name: 'Analysis Agent', role: 'Data Analysis', status: 'active', messagesSent: 540, messagesReceived: 580, tasksCompleted: 195, cpu: 41, memory: 48 },
  { id: '5', name: 'Deployment Agent', role: 'Release Manager', status: 'idle', messagesSent: 320, messagesReceived: 350, tasksCompleted: 145, cpu: 22, memory: 35 },
  { id: '6', name: 'QA Agent', role: 'Testing', status: 'active', messagesSent: 410, messagesReceived: 390, tasksCompleted: 210, cpu: 35, memory: 42 },
];

const generateCommuncations = (): Communication[] => [
  { from: 'Orchestrator', to: 'Research Agent', count: 450, latency: 12 },
  { from: 'Orchestrator', to: 'Code Agent', count: 380, latency: 15 },
  { from: 'Orchestrator', to: 'Analysis Agent', count: 290, latency: 18 },
  { from: 'Orchestrator', to: 'Deployment Agent', count: 180, latency: 22 },
  { from: 'Orchestrator', to: 'QA Agent', count: 220, latency: 14 },
  { from: 'Research Agent', to: 'Analysis Agent', count: 340, latency: 25 },
  { from: 'Code Agent', to: 'QA Agent', count: 280, latency: 20 },
  { from: 'Code Agent', to: 'Deployment Agent', count: 150, latency: 30 },
  { from: 'Analysis Agent', to: 'Research Agent', count: 310, latency: 28 },
  { from: 'QA Agent', to: 'Code Agent', count: 190, latency: 18 },
];

const generateActivityData = () => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour: hour + ':00',
    messages: Math.floor(50 + Math.random() * 150),
    tasks: Math.floor(10 + Math.random() * 40),
  }));
};

export default function AgentTopology() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    setAgents(generateAgents());
    setCommunications(generateCommuncations());
    setActivityData(generateActivityData());
  }, []);

  const totalMessages = agents.reduce((s, a) => s + a.messagesSent + a.messagesReceived, 0);
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const avgLatency = communications.reduce((s, c) => s + c.latency, 0) / communications.length;

  const selected = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">SCOPE Agent Topology</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-elevated rounded-lg">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-64 bg-surface border-r border-border p-2 overflow-y-auto">
          <h3 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase">Agent Network</h3>
          <nav className="space-y-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  selectedAgent === agent.id ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-elevated'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-success' : agent.status === 'idle' ? 'bg-warning' : 'bg-error'}`} />
                <div className="text-left">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-text-muted">{agent.role}</p>
                </div>
              </button>
            ))}
          </nav>
          
          <div className="mt-6 p-3 bg-elevated rounded-lg">
            <p className="text-xs text-text-muted mb-2">Network Stats</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Active Agents</span>
                <span className="font-mono text-success">{activeAgents}/{agents.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Latency</span>
                <span className="font-mono">{avgLatency.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Total Agents</p>
              <p className="text-2xl font-mono font-bold text-primary mt-1">{agents.length}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Active Agents</p>
              <p className="text-2xl font-mono font-bold text-success mt-1">{activeAgents}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Total Messages</p>
              <p className="text-2xl font-mono font-bold text-tactical mt-1">{totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Total Tasks</p>
              <p className="text-2xl font-mono font-bold text-strategic mt-1">
                {agents.reduce((s, a) => s + a.tasksCompleted, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Agent Topology Visualization */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Agent Network Topology</h3>
              <div className="relative h-80 bg-elevated rounded-lg overflow-hidden">
                {/* Central Orchestrator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <GitBranch className="w-8 h-8 text-primary" />
                  </div>
                  <span className="mt-2 text-sm font-medium">Orchestrator</span>
                </div>
                
                {/* Satellite Agents */}
                {agents.slice(1).map((agent, idx) => {
                  const angle = (idx * 72 - 90) * (Math.PI / 180);
                  const radius = 100;
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
                  const comm = communications.find(c => c.to === agent.name);
                  const width = comm ? Math.min(comm.count / 5, 8) : 1;
                  
                  return (
                    <div
                      key={agent.id}
                      className="absolute"
                      style={{ left: x + '%', top: y + '%', transform: 'translate(-50%, -50%)' }}
                    >
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                        agent.status === 'active' ? 'bg-success/20 border-success' : 
                        agent.status === 'idle' ? 'bg-warning/20 border-warning' : 'bg-error/20 border-error'
                      }`}>
                        <Activity className={`w-6 h-6 ${
                          agent.status === 'active' ? 'text-success' : 
                          agent.status === 'idle' ? 'text-warning' : 'text-error'
                        }`} />
                      </div>
                      <span className="absolute top-14 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">{agent.name}</span>
                    </div>
                  );
                })}
                
                {/* Connection Lines SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {communications.map((comm, idx) => {
                    const fromAgent = agents.find(a => a.name === 'Orchestrator');
                    const toAgent = agents.find(a => a.name === comm.to);
                    if (!fromAgent || !toAgent) return null;
                    const toIdx = agents.indexOf(toAgent) - 1;
                    const angle = (toIdx * 72 - 90) * (Math.PI / 180);
                    const radius = 100;
                    const x2 = 50 + radius * Math.cos(angle);
                    const y2 = 50 + radius * Math.sin(angle);
                    const width = Math.min(comm.count / 80, 3);
                    
                    return (
                      <line
                        key={idx}
                        x1="50%"
                        y1="50%"
                        x2={x2 + '%'}
                        y2={y2 + '%'}
                        stroke="#30363D"
                        strokeWidth={width}
                        strokeOpacity={0.6}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Communication Volume */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Communication Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={communications.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis type="number" stroke="#8B949E" fontSize={10} />
                  <YAxis dataKey="to" type="category" stroke="#8B949E" fontSize={10} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#79C0FF" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Agent Details */}
          {selected && (
            <div className="bg-surface border border-border rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-4">{selected.name} - Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-text-muted">Status</p>
                  <p className={`font-medium ${selected.status === 'active' ? 'text-success' : selected.status === 'idle' ? 'text-warning' : 'text-error'}`}>
                    {selected.status}
                  </p>
                </div>
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-text-muted">Messages Sent</p>
                  <p className="font-mono">{selected.messagesSent.toLocaleString()}</p>
                </div>
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-text-muted">Messages Received</p>
                  <p className="font-mono">{selected.messagesReceived.toLocaleString()}</p>
                </div>
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-text-muted">Tasks Completed</p>
                  <p className="font-mono">{selected.tasksCompleted}</p>
                </div>
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-text-muted">CPU Usage</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: selected.cpu + '%' }} />
                    </div>
                    <span className="font-mono text-sm">{selected.cpu}%</span>
                  </div>
                </div>
                <div className="bg-elevated rounded-lg p-3">
                  <p className="text-xs text-text-muted">Memory Usage</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface rounded-full h-2">
                      <div className="bg-tactical h-2 rounded-full" style={{ width: selected.memory + '%' }} />
                    </div>
                    <span className="font-mono text-sm">{selected.memory}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 24h Activity */}
          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">24-Hour Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="hour" stroke="#8B949E" fontSize={10} />
                <YAxis stroke="#8B949E" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                <Bar dataKey="messages" fill="#79C0FF" name="Messages" />
                <Bar dataKey="tasks" fill="#3FB950" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
