'use client';

import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Target, Search, Bell, User, Brain, TrendingUp, Zap, 
  Shield, Crosshair, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

interface Decision {
  id: string;
  agentId: string;
  agentName: string;
  type: 'strategic' | 'tactical';
  category: string;
  confidence: number;
  timestamp: string;
  success: boolean;
  reasoning: string;
  alternatives: string[];
  selectedAction: string;
}

const categories = [
  'Goal Planning', 'Resource Allocation', 'Risk Assessment', 'Task Decomposition',
  'Code Generation', 'Debugging', 'Testing Strategy', 'Performance Optimization',
  'Security Review', 'Architecture Design', 'Data Analysis', 'Deployment Planning'
];

const generateDecisions = (): Decision[] => {
  const agents = ['Research Agent', 'Code Agent', 'Analysis Agent', 'Deployment Agent'];
  const decisions: Decision[] = [];
  
  for (let i = 0; i < 80; i++) {
    const isStrategic = Math.random() < 0.3;
    const timestamp = new Date(Date.now() - i * 60000);
    
    decisions.push({
      id: 'dec-' + i,
      agentId: String(i % 4 + 1),
      agentName: agents[i % 4],
      type: isStrategic ? 'strategic' : 'tactical',
      category: categories[Math.floor(Math.random() * categories.length)],
      confidence: Math.floor(60 + Math.random() * 40),
      timestamp: timestamp.toISOString(),
      success: Math.random() > 0.2,
      reasoning: isStrategic 
        ? 'Optimized for long-term goals and resource efficiency'
        : 'Quick execution to meet immediate requirements',
      alternatives: ['Alternative 1', 'Alternative 2'],
      selectedAction: 'Primary action selected'
    });
  }
  
  return decisions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateTimelineData = (decisions: Decision[]) => {
  const hourly: { [key: string]: { time: string; strategic: number; tactical: number } } = {};
  
  decisions.forEach(d => {
    const hour = new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (!hourly[hour]) hourly[hour] = { time: hour, strategic: 0, tactical: 0 };
    if (d.type === 'strategic') hourly[hour].strategic++;
    else hourly[hour].tactical++;
  });
  
  return Object.values(hourly).reverse().slice(-20);
};

const generateAgentStats = (decisions: Decision[]) => {
  const agents: { [key: string]: { strategic: number; tactical: number; total: number } } = {};
  
  decisions.forEach(d => {
    if (!agents[d.agentName]) agents[d.agentName] = { strategic: 0, tactical: 0, total: 0 };
    if (d.type === 'strategic') agents[d.agentName].strategic++;
    else agents[d.agentName].tactical++;
    agents[d.agentName].total++;
  });
  
  return Object.entries(agents).map(([name, stats]) => ({
    name,
    strategic: stats.strategic,
    tactical: stats.tactical,
    ratio: Math.round((stats.strategic / stats.total) * 100)
  }));
};

export default function DecisionAnalyzer() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [agentStats, setAgentStats] = useState<any[]>([]);
  const [view, setView] = useState<'overview' | 'patterns' | 'agents'>('overview');
  const [filter, setFilter] = useState<'all' | 'strategic' | 'tactical'>('all');

  useEffect(() => {
    const data = generateDecisions();
    setDecisions(data);
    setTimelineData(generateTimelineData(data));
    setAgentStats(generateAgentStats(data));
  }, []);

  const filtered = filter === 'all' ? decisions : decisions.filter(d => d.type === filter);
  
  const strategic = decisions.filter(d => d.type === 'strategic').length;
  const tactical = decisions.filter(d => d.type === 'tactical').length;
  const successRate = ((decisions.filter(d => d.success).length / decisions.length) * 100).toFixed(1);
  const avgConfidence = (decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length).toFixed(0);

  const pieData = [
    { name: 'Strategic', value: strategic, color: '#A371F7' },
    { name: 'Tactical', value: tactical, color: '#79C0FF' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-strategic" />
            <span className="font-semibold text-lg">SCOPE Decision Analyzer</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-elevated rounded-lg p-1">
            {(['all', 'strategic', 'tactical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm transition-colors ${filter === f ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-elevated rounded-lg">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-48 bg-surface border-r border-border p-2">
          <nav className="space-y-1">
            {[
              { id: 'overview', icon: Brain, label: 'Overview' },
              { id: 'patterns', icon: Crosshair, label: 'Patterns' },
              { id: 'agents', icon: TrendingUp, label: 'Agents' },
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
            <p className="text-xs text-text-muted mb-2">Strategy Ratio</p>
            <p className="text-2xl font-mono font-bold text-strategic">
              {strategic > 0 ? Math.round((strategic / (strategic + tactical)) * 100) : 0}%
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Strategic Decisions</p>
              <p className="text-2xl font-mono font-bold text-strategic mt-1">{strategic}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Tactical Decisions</p>
              <p className="text-2xl font-mono font-bold text-tactical mt-1">{tactical}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Success Rate</p>
              <p className="text-2xl font-mono font-bold text-success mt-1">{successRate}%</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Avg Confidence</p>
              <p className="text-2xl font-mono font-bold text-primary mt-1">{avgConfidence}%</p>
            </div>
          </div>

          {view === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Decision Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={'cell-' + index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Decision Timeline</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorStrategic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A371F7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A371F7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTactical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#79C0FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#79C0FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                    <XAxis dataKey="time" stroke="#8B949E" fontSize={10} />
                    <YAxis stroke="#8B949E" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="strategic" stroke="#A371F7" fill="url(#colorStrategic)" name="Strategic" />
                    <Area type="monotone" dataKey="tactical" stroke="#79C0FF" fill="url(#colorTactical)" name="Tactical" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-surface border border-border rounded-lg p-4 lg:col-span-2">
                <h3 className="font-semibold mb-4">Recent Decisions</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filtered.slice(0, 10).map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                      <div className="flex items-center gap-3">
                        {d.type === 'strategic' ? (
                          <Shield className="w-5 h-5 text-strategic" />
                        ) : (
                          <Zap className="w-5 h-5 text-tactical" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{d.category}</p>
                          <p className="text-xs text-text-muted">{d.agentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded ${d.type === 'strategic' ? 'bg-strategic/20 text-strategic' : 'bg-tactical/20 text-tactical'}`}>
                          {d.type}
                        </span>
                        <span className="text-xs text-text-muted">{d.confidence}%</span>
                        {d.success ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-error" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === 'patterns' && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Decision Pattern Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-elevated rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-strategic" />
                    Strategic Patterns
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" /> Long-term planning</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" /> Resource optimization</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" /> Risk mitigation</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-success" /> Architecture decisions</li>
                  </ul>
                </div>
                <div className="bg-elevated rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-tactical" />
                    Tactical Patterns
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-tactical" /> Quick iterations</li>
                    <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-tactical" /> Immediate fixes</li>
                    <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-tactical" /> Task-specific solutions</li>
                    <li className="flex items-center gap-2"><Zap className="w-3 h-3 text-tactical" /> Performance tuning</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {view === 'agents' && (
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Agent Decision Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="name" stroke="#8B949E" fontSize={10} />
                  <YAxis stroke="#8B949E" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="strategic" fill="#A371F7" name="Strategic" />
                  <Bar dataKey="tactical" fill="#79C0FF" name="Tactical" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {agentStats.map((agent, i) => (
                  <div key={i} className="bg-elevated rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{agent.name}</span>
                      <span className="text-sm text-strategic">{agent.ratio}% strategic</span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div className="bg-strategic" style={{ width: agent.ratio + '%' }} />
                      <div className="bg-tactical" style={{ width: (100 - agent.ratio) + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
