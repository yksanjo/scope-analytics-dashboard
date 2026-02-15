'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  MemoryStick, Search, Bell, User, Activity, Cpu, AlertTriangle, 
  TrendingUp, TrendingDown, Clock, Zap, Gauge
} from 'lucide-react';

interface MemorySnapshot {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  totalMemory: number;
  usedMemory: number;
  contextWindow: number;
  maxContextWindow: number;
}

const generateMemoryData = (): MemorySnapshot[] => {
  const agents = ['Research Agent', 'Code Agent', 'Analysis Agent', 'Deployment Agent'];
  const data: MemorySnapshot[] = [];
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(Date.now() - i * 60000);
    const agentId = i % 4;
    const baseMemory = 3000000000 + agentId * 1000000000;
    
    data.push({
      id: 'mem-' + i,
      agentId: String(agentId + 1),
      agentName: agents[agentId],
      timestamp: timestamp.toISOString(),
      totalMemory: 8000000000,
      usedMemory: Math.floor(baseMemory + Math.random() * 2000000000),
      contextWindow: Math.floor(50000 + Math.random() * 50000),
      maxContextWindow: 100000,
    });
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function MemoryMonitor() {
  const [memoryData, setMemoryData] = useState<MemorySnapshot[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [view, setView] = useState<'timeline' | 'agents' | 'heatmap'>('timeline');
  const agents = ['Research Agent', 'Code Agent', 'Analysis Agent', 'Deployment Agent'];

  useEffect(() => {
    setMemoryData(generateMemoryData());
  }, []);

  const filteredData = selectedAgent === 'all' 
    ? memoryData 
    : memoryData.filter(d => d.agentId === selectedAgent);

  const latest = filteredData[0];
  const currentUsage = latest ? ((latest.usedMemory / latest.totalMemory) * 100).toFixed(1) : '0';
  const contextPercent = latest ? ((latest.contextWindow / latest.maxContextWindow) * 100).toFixed(1) : '0';
  const avgUsage = filteredData.length > 0 
    ? (filteredData.reduce((sum, d) => sum + (d.usedMemory / d.totalMemory) * 100, 0) / filteredData.length).toFixed(1) 
    : '0';
  const peakUsage = filteredData.length > 0 
    ? Math.max(...filteredData.map(d => (d.usedMemory / d.totalMemory) * 100)).toFixed(1) 
    : '0';

  const agentStats = agents.map(agent => {
    const agentData = memoryData.filter(d => d.agentName === agent);
    const avg = agentData.length > 0 
      ? agentData.reduce((sum, d) => sum + (d.usedMemory / d.totalMemory) * 100, 0) / agentData.length 
      : 0;
    const ctx = agentData.length > 0 
      ? Math.round(agentData.reduce((sum, d) => sum + d.contextWindow, 0) / agentData.length) 
      : 0;
    return { name: agent, avgUsage: Math.round(avg), avgContext: ctx };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-6 h-6 text-tactical" />
            <span className="font-semibold text-lg">SCOPE Memory Monitor</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-elevated border border-border rounded px-3 py-1.5 text-sm"
          >
            <option value="all">All Agents</option>
            {agents.map((a, i) => <option key={a} value={i + 1}>{a}</option>)}
          </select>
          <button className="p-2 hover:bg-elevated rounded-lg">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-48 bg-surface border-r border-border p-2">
          <nav className="space-y-1">
            {[
              { id: 'timeline', icon: Activity, label: 'Timeline' },
              { id: 'agents', icon: Cpu, label: 'Agents' },
              { id: 'heatmap', icon: Gauge, label: 'Heatmap' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  view === item.id ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-elevated'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-6 p-3 bg-elevated rounded-lg">
            <p className="text-xs text-text-muted mb-2">Current Memory</p>
            <p className="text-2xl font-mono font-bold text-tactical">{currentUsage}%</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Current Usage</p>
              <p className="text-2xl font-mono font-bold text-tactical mt-1">{currentUsage}%</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Average Usage</p>
              <p className="text-2xl font-mono font-bold text-primary mt-1">{avgUsage}%</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Peak Usage</p>
              <p className="text-2xl font-mono font-bold text-warning mt-1">{peakUsage}%</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Context Window</p>
              <p className="text-2xl font-mono font-bold text-strategic mt-1">{contextPercent}%</p>
            </div>
          </div>

          {view === 'agents' && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Agent Memory Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="name" stroke="#8B949E" fontSize={10} />
                  <YAxis stroke="#8B949E" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Bar dataKey="avgUsage" fill="#79C0FF" name="Avg Usage %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {agentStats.map((agent, i) => (
                  <div key={i} className="bg-elevated rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{agent.name}</span>
                      <span className={agent.avgUsage > 70 ? 'text-warning' : 'text-success'}>{agent.avgUsage}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div className={`h-2 rounded-full ${agent.avgUsage > 70 ? 'bg-warning' : 'bg-success'}`} style={{ width: agent.avgUsage + '%' }} />
                    </div>
                    <p className="text-xs text-text-muted mt-2">Avg Context: {agent.avgContext.toLocaleString()} tokens</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'heatmap' && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Memory Usage Heatmap (24h)</h3>
              <div className="flex">
                <div className="w-32" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-xs text-text-muted text-center">{i}:00</div>
                ))}
              </div>
              {agents.map((agent, agentIdx) => (
                <div key={agent} className="flex items-center py-1">
                  <div className="w-32 text-sm text-text-secondary">{agent}</div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const usage = 30 + Math.random() * 60 + (agentIdx * 10);
                    const color = usage > 80 ? '#F85149' : usage > 60 ? '#D29922' : '#3FB950';
                    return <div key={hour} className="flex-1 h-8 mx-0.5 rounded" style={{ backgroundColor: color, opacity: 0.3 + (usage / 150) }} title={usage.toFixed(0) + '%'} />;
                  })}
                </div>
              ))}
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-success" /><span className="text-xs text-text-muted">&lt; 40%</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-warning" /><span className="text-xs text-text-muted">40-80%</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-error" /><span className="text-xs text-text-muted">&gt; 80%</span></div>
              </div>
            </div>
          )}

          {view === 'timeline' && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Memory Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filteredData.slice(0, 50).reverse()}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#79C0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#79C0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="timestamp" stroke="#8B949E" fontSize={10} tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                  <YAxis stroke="#8B949E" fontSize={10} tickFormatter={(v) => (v/1e9).toFixed(1) + 'GB'} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="usedMemory" stroke="#79C0FF" fill="url(#colorUsage)" name="Used Memory" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
