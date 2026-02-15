'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Activity, Server, Brain, MemoryStick, GitBranch, AlertTriangle, 
  Search, Bell, User, ChevronRight, Cpu, Zap, Clock, TrendingUp
} from 'lucide-react';

// Types
interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  _count?: { traces: number; decisions: number };
}

interface Trace {
  id: string;
  agentId: string;
  action: string;
  toolName: string;
  status: string;
  tokensUsed: number;
  cost: number;
  error: string | null;
  timestamp: string;
}

interface LearningCurveData {
  date: string;
  successRate: number;
  avgTokens: number;
  avgDuration: number;
  taskCount: number;
}

interface DecisionData {
  type: string;
  _count: { id: number };
  _avg: { success: boolean | null };
}

interface MemoryData {
  timestamp: string;
  usedMemory: number;
  totalMemory: number;
  contextWindow: number;
}

// Sample data generators
const generateSampleAgents = (): Agent[] => [
  { id: '1', name: 'Research Agent', type: 'research', status: 'running', _count: { traces: 245, decisions: 89 } },
  { id: '2', name: 'Code Agent', type: 'coding', status: 'running', _count: { traces: 512, decisions: 156 } },
  { id: '3', name: 'Analysis Agent', type: 'analysis', status: 'idle', _count: { traces: 128, decisions: 42 } },
  { id: '4', name: 'Deployment Agent', type: 'deployment', status: 'running', _count: { traces: 89, decisions: 23 } },
  { id: '5', name: 'Testing Agent', type: 'testing', status: 'error', _count: { traces: 67, decisions: 18 } },
];

const generateLearningCurveData = (): LearningCurveData[] => {
  const data: LearningCurveData[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      successRate: Math.min(100, 50 + (30 - i) * 1.5 + Math.random() * 10),
      avgTokens: Math.max(500, 2500 - (30 - i) * 50 + Math.random() * 200),
      avgDuration: Math.max(1000, 6000 - (30 - i) * 120 + Math.random() * 500),
      taskCount: Math.floor(5 + Math.random() * 15 + (30 - i) * 0.3),
    });
  }
  return data;
};

const generateMemoryData = (): MemoryData[] => {
  const data: MemoryData[] = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);
    data.push({
      timestamp: date.toISOString(),
      usedMemory: Math.floor(4000000000 + Math.random() * 2000000000),
      totalMemory: 8000000000,
      contextWindow: Math.floor(50000 + Math.random() * 50000),
    });
  }
  return data;
};

const decisionData = [
  { name: 'Strategic', value: 35, color: '#A371F7' },
  { name: 'Tactical', value: 65, color: '#79C0FF' },
];

const recentTraces: Trace[] = [
  { id: '1', agentId: '1', action: 'search_web', toolName: 'web_search', status: 'success', tokensUsed: 1200, cost: 0.0024, error: null, timestamp: new Date().toISOString() },
  { id: '2', agentId: '2', action: 'write_code', toolName: 'code_editor', status: 'success', tokensUsed: 2400, cost: 0.0048, error: null, timestamp: new Date().toISOString() },
  { id: '3', agentId: '1', action: 'analyze', toolName: 'analysis', status: 'error', tokensUsed: 800, cost: 0.0016, error: 'API timeout', timestamp: new Date().toISOString() },
  { id: '4', agentId: '4', action: 'deploy', toolName: 'deployment', status: 'success', tokensUsed: 1600, cost: 0.0032, error: null, timestamp: new Date().toISOString() },
  { id: '5', agentId: '2', action: 'test', toolName: 'testing', status: 'success', tokensUsed: 900, cost: 0.0018, error: null, timestamp: new Date().toISOString() },
];

// Components
const MetricCard = ({ title, value, icon: Icon, trend, color }: { title: string; value: string | number; icon: any; trend?: string; color: string }) => (
  <div className="bg-surface border border-border rounded-lg p-4 card-hover">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-sm">{title}</p>
        <p className="text-2xl font-mono font-bold mt-1" style={{ color }}>{value}</p>
        {trend && (
          <p className="text-xs mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-success">{trend}</span>
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
  </div>
);

const AgentCard = ({ agent }: { agent: Agent }) => (
  <div className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between card-hover">
    <div className="flex items-center gap-3">
      <div className={`status-dot ${agent.status === 'running' ? 'status-running' : agent.status === 'error' ? 'status-error' : 'status-idle'}`} />
      <div>
        <p className="font-medium">{agent.name}</p>
        <p className="text-text-muted text-xs">{agent.type}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-mono">{agent._count?.traces || 0} traces</p>
      <p className="text-xs text-text-muted">{agent._count?.decisions || 0} decisions</p>
    </div>
  </div>
);

const TraceItem = ({ trace }: { trace: Trace }) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${trace.status === 'success' ? 'bg-success' : 'bg-error'}`} />
      <div>
        <p className="text-sm font-medium">{trace.action}</p>
        <p className="text-xs text-text-muted">{trace.toolName}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-mono">{trace.tokensUsed} tokens</p>
      <p className="text-xs text-text-muted">${trace.cost.toFixed(4)}</p>
    </div>
  </div>
);

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-elevated border border-border rounded-lg p-3 shadow-card">
        <p className="text-text-secondary text-xs mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(entry.name.includes('Rate') ? 1 : 0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [learningData, setLearningData] = useState<LearningCurveData[]>([]);
  const [memoryData, setMemoryData] = useState<MemoryData[]>([]);
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Load sample data
    setAgents(generateSampleAgents());
    setLearningData(generateLearningCurveData());
    setMemoryData(generateMemoryData());
  }, []);

  const overview = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'running').length,
    totalTraces: agents.reduce((sum, a) => sum + (a._count?.traces || 0), 0),
    errorRate: ((agents.filter(a => a.status === 'error').length / agents.length) * 100).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">SCOPE Analytics</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search agents, traces..." 
              className="bg-elevated border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-elevated rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="flex items-center gap-2 p-2 hover:bg-elevated rounded-lg transition-colors">
            <User className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} bg-surface border-r border-border transition-all duration-200 min-h-[calc(100vh-3.5rem)]`}>
          <nav className="p-2">
            {[
              { id: 'overview', icon: Activity, label: 'Overview' },
              { id: 'agents', icon: Server, label: 'Agents' },
              { id: 'traces', icon: GitBranch, label: 'Traces' },
              { id: 'learning', icon: Brain, label: 'Learning Curves' },
              { id: 'memory', icon: MemoryStick, label: 'Memory' },
              { id: 'decisions', icon: Zap, label: 'Decisions' },
              { id: 'topology', icon: GitBranch, label: 'Topology' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  activeView === item.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center py-3 border-t border-border text-text-muted hover:text-text-primary"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Overview View */}
            {activeView === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard 
                    title="Total Agents" 
                    value={overview.totalAgents} 
                    icon={Server} 
                    trend="+2 this week"
                    color="#58A6FF" 
                  />
                  <MetricCard 
                    title="Active Agents" 
                    value={overview.activeAgents} 
                    icon={Activity} 
                    color="#3FB950" 
                  />
                  <MetricCard 
                    title="Total Traces (24h)" 
                    value={overview.totalTraces.toLocaleString()} 
                    icon={GitBranch} 
                    trend="+12%"
                    color="#79C0FF" 
                  />
                  <MetricCard 
                    title="Error Rate" 
                    value={`${overview.errorRate}%`} 
                    icon={AlertTriangle} 
                    color="#F85149" 
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Learning Curves */}
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Learning Curves
                      </h3>
                      <select className="bg-elevated border border-border rounded px-2 py-1 text-sm">
                        <option>Last 30 days</option>
                        <option>Last 7 days</option>
                        <option>Last 24 hours</option>
                      </select>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={learningData}>
                        <defs>
                          <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3FB950" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3FB950" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis dataKey="date" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#8B949E" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="successRate" stroke="#3FB950" fill="url(#colorSuccess)" name="Success Rate %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Decision Patterns */}
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-strategic" />
                        Decision Patterns
                      </h3>
                    </div>
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={decisionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {decisionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Agents & Recent Traces */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Agents List */}
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <Server className="w-5 h-5 text-primary" />
                      Agents
                    </h3>
                    <div className="space-y-2">
                      {agents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                    </div>
                  </div>

                  {/* Recent Traces */}
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <GitBranch className="w-5 h-5 text-primary" />
                      Recent Traces
                    </h3>
                    <div>
                      {recentTraces.map((trace) => (
                        <TraceItem key={trace.id} trace={trace} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Memory Overview */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MemoryStick className="w-5 h-5 text-tactical" />
                      Memory Utilization (24h)
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={memoryData}>
                      <defs>
                        <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#79C0FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#79C0FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                      <XAxis dataKey="timestamp" stroke="#8B949E" fontSize={10} tickFormatter={(v) => new Date(v).getHours() + ':00'} />
                      <YAxis stroke="#8B949E" fontSize={10} tickFormatter={(v) => `${(v/1e9).toFixed(0)}GB`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="usedMemory" stroke="#79C0FF" fill="url(#colorMemory)" name="Used Memory (GB)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Learning Curves View */}
            {activeView === 'learning' && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-semibold">Learning Curves</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Success Rate Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={learningData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis dataKey="date" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#8B949E" fontSize={10} domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="successRate" stroke="#3FB950" strokeWidth={2} dot={false} name="Success Rate %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Token Efficiency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={learningData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis dataKey="date" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#8B949E" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="avgTokens" stroke="#79C0FF" fill="#79C0FF" fillOpacity={0.2} name="Avg Tokens" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Task Duration</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={learningData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis dataKey="date" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#8B949E" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avgDuration" fill="#D29922" name="Avg Duration (ms)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Task Volume</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={learningData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis dataKey="date" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                        <YAxis stroke="#8B949E" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="taskCount" stroke="#58A6FF" fill="#58A6FF" fillOpacity={0.2} name="Task Count" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Memory View */}
            {activeView === 'memory' && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-semibold">Memory Utilization</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard title="Current Usage" value="5.2 GB" icon={MemoryStick} color="#79C0FF" />
                  <MetricCard title="Peak Usage" value="7.8 GB" icon={Cpu} color="#D29922" />
                  <MetricCard title="Avg Context" value="72K tokens" icon={Brain} color="#A371F7" />
                </div>
                <div className="bg-surface border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Memory Timeline</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={memoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                      <XAxis dataKey="timestamp" stroke="#8B949E" tickFormatter={(v) => new Date(v).toLocaleTimeString()} />
                      <YAxis stroke="#8B949E" tickFormatter={(v) => `${(v/1e9).toFixed(1)}GB`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="usedMemory" stroke="#79C0FF" fill="#79C0FF" fillOpacity={0.3} name="Used (GB)" />
                      <Area type="monotone" dataKey="totalMemory" stroke="#30363D" fill="transparent" name="Total (GB)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Decisions View */}
            {activeView === 'decisions' && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-semibold">Decision Patterns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Strategic vs Tactical</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={decisionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {decisionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Decision Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-strategic" />
                          <span>Strategic Decisions</span>
                        </div>
                        <span className="font-mono">35%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-tactical" />
                          <span>Tactical Decisions</span>
                        </div>
                        <span className="font-mono">65%</span>
                      </div>
                      <div className="mt-4 p-3 bg-elevated rounded-lg">
                        <p className="text-sm text-text-secondary">Strategic decisions are high-level planning choices that affect the overall agent strategy, while tactical decisions are immediate action selections.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other views */}
            {['agents', 'traces', 'topology'].includes(activeView) && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Server className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View</h3>
                  <p className="text-text-secondary">This view is under development</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-8 bg-surface border-t border-border flex items-center justify-between px-4 text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            System Healthy
          </span>
          <span>Last sync: just now</span>
        </div>
        <div className="flex items-center gap-4">
          <span>WebSocket: Connected</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
