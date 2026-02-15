'use client';

import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  DollarSign, Search, Bell, User, TrendingUp, TrendingDown,
  CreditCard, Wallet, AlertTriangle, PiggyBank, Activity
} from 'lucide-react';

interface CostEntry {
  id: string;
  agentId: string;
  agentName: string;
  service: string;
  tokens: number;
  cost: number;
  timestamp: string;
  type: 'input' | 'output' | 'api_call';
}

interface Budget {
  total: number;
  used: number;
  remaining: number;
}

const generateCostData = (): CostEntry[] => {
  const agents = ['Research Agent', 'Code Agent', 'Analysis Agent', 'Deployment Agent'];
  const services = ['OpenAI', 'Anthropic', 'Azure OpenAI', 'Local Model'];
  const types: ('input' | 'output' | 'api_call')[] = ['input', 'output', 'api_call'];
  const data: CostEntry[] = [];
  
  for (let i = 0; i < 60; i++) {
    const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const tokens = Math.floor(1000 + Math.random() * 10000);
    const costPer1k = service === 'OpenAI' ? 0.03 : service === 'Anthropic' ? 0.015 : 0.02;
    const cost = (tokens / 1000) * costPer1k * (type === 'output' ? 1.5 : 1);
    
    data.push({
      id: 'cost-' + i,
      agentId: String(agents.indexOf(agent) + 1),
      agentName: agent,
      service,
      tokens,
      cost: Math.round(cost * 100) / 100,
      timestamp: timestamp.toISOString(),
      type
    });
  }
  
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateDailyCosts = (data: CostEntry[]) => {
  const daily: { [key: string]: { date: string; cost: number; tokens: number } } = {};
  
  data.forEach(d => {
    const date = new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!daily[date]) daily[date] = { date, cost: 0, tokens: 0 };
    daily[date].cost += d.cost;
    daily[date].tokens += d.tokens;
  });
  
  return Object.values(daily).slice(-14);
};

const generateServiceBreakdown = (data: CostEntry[]) => {
  const services: { [key: string]: number } = {};
  data.forEach(d => {
    if (!services[d.service]) services[d.service] = 0;
    services[d.service] += d.cost;
  });
  
  return Object.entries(services).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
};

const generateAgentCosts = (data: CostEntry[]) => {
  const agents: { [key: string]: { cost: number; tokens: number } } = {};
  data.forEach(d => {
    if (!agents[d.agentName]) agents[d.agentName] = { cost: 0, tokens: 0 };
    agents[d.agentName].cost += d.cost;
    agents[d.agentName].tokens += d.tokens;
  });
  
  return Object.entries(agents).map(([name, stats]) => ({ 
    name, 
    cost: Math.round(stats.cost * 100) / 100,
    tokens: stats.tokens 
  }));
};

export default function CostTracker() {
  const [costData, setCostData] = useState<CostEntry[]>([]);
  const [dailyCosts, setDailyCosts] = useState<any[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([]);
  const [agentCosts, setAgentCosts] = useState<any[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  
  const budget: Budget = { total: 1000, used: 423.50, remaining: 576.50 };

  useEffect(() => {
    const data = generateCostData();
    setCostData(data);
    setDailyCosts(generateDailyCosts(data));
    setServiceBreakdown(generateServiceBreakdown(data));
    setAgentCosts(generateAgentCosts(data));
  }, []);

  const totalCost = costData.reduce((s, d) => s + d.cost, 0);
  const totalTokens = costData.reduce((s, d) => s + d.tokens, 0);
  const avgCostPerToken = totalTokens > 0 ? (totalCost / totalTokens * 1000).toFixed(2) : '0';
  const budgetUsed = (budget.used / budget.total) * 100;
  
  const COLORS = ['#3FB950', '#79C0FF', '#A371F7', '#D29922', '#F85149'];

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-warning" />
            <span className="font-semibold text-lg">SCOPE Cost Tracker</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-elevated rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded text-sm transition-colors ${period === p ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-elevated rounded-lg">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-56 bg-surface border-r border-border p-2">
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'services', label: 'Services', icon: CreditCard },
              { id: 'agents', label: 'By Agent', icon: Wallet },
              { id: 'budget', label: 'Budget', icon: PiggyBank },
            ].map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-elevated transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-6 p-3 bg-elevated rounded-lg">
            <p className="text-xs text-text-muted mb-2">Budget Remaining</p>
            <p className="text-2xl font-mono font-bold text-success">${budget.remaining.toFixed(2)}</p>
            <p className="text-xs text-text-muted mt-1">of ${budget.total}</p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Total Cost</p>
              <p className="text-2xl font-mono font-bold text-warning mt-1">${totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Total Tokens</p>
              <p className="text-2xl font-mono font-bold text-primary mt-1">{totalTokens.toLocaleString()}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Cost per 1K Tokens</p>
              <p className="text-2xl font-mono font-bold text-tactical mt-1">${avgCostPerToken}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4">
              <p className="text-text-secondary text-sm">Budget Used</p>
              <p className="text-2xl font-mono font-bold text-strategic mt-1">{budgetUsed.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Daily Cost Trend */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Daily Cost Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dailyCosts}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D29922" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D29922" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="date" stroke="#8B949E" fontSize={10} />
                  <YAxis stroke="#8B949E" fontSize={10} tickFormatter={(v) => '$' + v} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="cost" stroke="#D29922" fill="url(#colorCost)" name="Cost ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Service Breakdown */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Cost by Service</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {serviceBreakdown.map((entry, index) => (
                      <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agent Costs */}
          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Cost by Agent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agentCosts.map((agent, i) => (
                <div key={i} className="bg-elevated rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{agent.name}</h4>
                    <DollarSign className="w-4 h-4 text-warning" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-warning">${agent.cost.toFixed(2)}</p>
                  <p className="text-xs text-text-muted mt-1">{agent.tokens.toLocaleString()} tokens</p>
                  <div className="mt-3">
                    <div className="w-full bg-surface rounded-full h-2">
                      <div 
                        className="bg-warning h-2 rounded-full" 
                        style={{ width: (agent.cost / totalCost * 100) + '%' }} 
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {(agent.cost / totalCost * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Alert */}
          {budgetUsed > 80 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
              <div>
                <h4 className="font-medium text-warning">Budget Warning</h4>
                <p className="text-sm text-text-secondary">
                  You have used {budgetUsed.toFixed(1)}% of your monthly budget. 
                  ${budget.remaining.toFixed(2)} remaining.
                </p>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-surface border border-border rounded-lg p-4 mt-6">
            <h3 className="font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {costData.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{entry.agentName}</p>
                      <p className="text-xs text-text-muted">{entry.service} • {entry.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-warning">${entry.cost.toFixed(2)}</p>
                    <p className="text-xs text-text-muted">{entry.tokens.toLocaleString()} tokens</p>
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
