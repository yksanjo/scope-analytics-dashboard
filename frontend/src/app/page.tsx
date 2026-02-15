'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, Search, Bell, User, Brain, Activity, 
  Target, Award, Zap, Clock, CheckCircle
} from 'lucide-react';

interface MetricPoint {
  timestamp: string;
  successRate: number;
  tokenEfficiency: number;
  avgDuration: number;
  tasksCompleted: number;
}

interface AgentMetrics {
  agentId: string;
  agentName: string;
  data: MetricPoint[];
}

const generateAgentMetrics = (): AgentMetrics[] => {
  const agents = ['Research Agent', 'Code Agent', 'Analysis Agent', 'Deployment Agent'];
  
  return agents.map((agentName, agentIdx) => {
    const data: MetricPoint[] = [];
    let successRate = 60 + Math.random() * 20;
    let tokenEfficiency = 0.5 + Math.random() * 0.3;
    let avgDuration = 3000;
    let tasksCompleted = 0;
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      successRate = Math.min(98, successRate + (Math.random() - 0.4) * 5);
      tokenEfficiency = Math.min(0.95, tokenEfficiency + (Math.random() - 0.5) * 0.05);
      avgDuration = Math.max(500, avgDuration + (Math.random() - 0.5) * 200);
      tasksCompleted += Math.floor(10 + Math.random() * 20);
      
      data.push({
        timestamp: timestamp.toISOString().split('T')[0],
        successRate: Math.round(successRate * 10) / 10,
        tokenEfficiency: Math.round(tokenEfficiency * 1000) / 1000,
        avgDuration: Math.round(avgDuration),
        tasksCompleted
      });
    }
    
    return {
      agentId: String(agentIdx + 1),
      agentName,
      data
    };
  });
};

const generateAggregatedMetrics = (agents: AgentMetrics[]) => {
  return agents[0]?.data.map((_, dayIdx) => {
    const dayData = agents.map(a => a.data[dayIdx]);
    return {
      date: agents[0].data[dayIdx].timestamp,
      successRate: dayData.reduce((s, d) => s + d.successRate, 0) / dayData.length,
      tokenEfficiency: dayData.reduce((s, d) => s + d.tokenEfficiency, 0) / dayData.length,
      avgDuration: dayData.reduce((s, d) => s + d.avgDuration, 0) / dayData.length,
    };
  }) || [];
};

export default function LearningCurves() {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [aggregated, setAggregated] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [metric, setMetric] = useState<'successRate' | 'tokenEfficiency' | 'avgDuration'>('successRate');

  useEffect(() => {
    const data = generateAgentMetrics();
    setAgentMetrics(data);
    setAggregated(generateAggregatedMetrics(data));
  }, []);

  const displayData = selectedAgent === 'all' 
    ? aggregated 
    : agentMetrics.find(a => a.agentId === selectedAgent)?.data || [];

  const currentMetric = displayData[displayData.length - 1];
  const firstMetric = displayData[0];
  
  const improvement = currentMetric && firstMetric 
    ? ((currentMetric[metric] - firstMetric[metric]) / firstMetric[metric] * 100).toFixed(1)
    : '0';

  const agentStats = agentMetrics.map(a => {
    const first = a.data[0];
    const last = a.data[a.data.length - 1];
    return {
      name: a.agentName,
      improvement: ((last.successRate - first.successRate) / first.successRate * 100).toFixed(1),
      currentRate: last.successRate,
      totalTasks: last.tasksCompleted
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-success" />
            <span className="font-semibold text-lg">SCOPE Learning Curves</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-elevated border border-border rounded px-3 py-1.5 text-sm"
          >
            <option value="all">All Agents</option>
            {agentMetrics.map(a => <option key={a.agentId} value={a.agentId}>{a.agentName}</option>)}
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
              { id: 'successRate', label: 'Success Rate', icon: Target },
              { id: 'tokenEfficiency', label: 'Token Efficiency', icon: Zap },
              { id: 'avgDuration', label: 'Avg Duration', icon: Clock },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setMetric(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  metric === item.id ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-elevated'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-6 p-3 bg-elevated rounded-lg">
            <p className="text-xs text-text-muted mb-2">30-Day Improvement</p>
            <p className={`text-2xl font-mono font-bold ${Number(improvement) > 0 ? 'text-success' : 'text-error'}`}>
              {Number(improvement) > 0 ? '+' : ''}{improvement}%
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Current Success Rate</p>
              <p className="text-2xl font-mono font-bold text-success mt-1">
                {currentMetric?.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Token Efficiency</p>
              <p className="text-2xl font-mono font-bold text-primary mt-1">
                {currentMetric?.tokenEfficiency.toFixed(3)}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Avg Duration</p>
              <p className="text-2xl font-mono font-bold text-tactical mt-1">
                {currentMetric?.avgDuration.toFixed(0)}ms
              </p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Total Tasks</p>
              <p className="text-2xl font-mono font-bold text-strategic mt-1">
                {currentMetric?.tasksCompleted?.toLocaleString() || agentMetrics.reduce((s, a) => s + a.data[a.data.length-1]?.tasksCompleted || 0, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Learning Curve: {metric === 'successRate' ? 'Success Rate' : metric === 'tokenEfficiency' ? 'Token Efficiency' : 'Average Duration'}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={displayData}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3FB950" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3FB950" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="timestamp" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#8B949E" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey={metric} stroke="#3FB950" fill="url(#colorMetric)" name={metric} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Agent Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={agentStats[0]?.data.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="timestamp" stroke="#8B949E" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                  <YAxis stroke="#8B949E" fontSize={10} domain={[50, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Legend />
                  {agentMetrics.map((agent, idx) => (
                    <Line 
                      key={agent.agentId}
                      type="monotone" 
                      data={agent.data.slice(-7)} 
                      dataKey="successRate" 
                      stroke={['#3FB950', '#79C0FF', '#A371F7', '#D29922'][idx]} 
                      name={agent.agentName}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Agent Learning Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agentStats.map((agent, i) => (
                <div key={i} className="bg-elevated rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{agent.name}</h4>
                    {Number(agent.improvement) > 0 && <Award className="w-4 h-4 text-warning" />}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">30-Day Improvement</span>
                      <span className={Number(agent.improvement) > 0 ? 'text-success' : 'text-error'}>
                        {Number(agent.improvement) > 0 ? '+' : ''}{agent.improvement}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Current Rate</span>
                      <span className="font-mono">{agent.currentRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Tasks Completed</span>
                      <span className="font-mono">{agent.totalTasks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
