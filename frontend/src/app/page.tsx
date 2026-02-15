'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  GitBranch, Search, Bell, User, ChevronRight, Play, Pause, 
  AlertCircle, CheckCircle, Clock, Zap, Hash, X
} from 'lucide-react';

// Types
interface Trace {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  toolName: string;
  status: string;
  tokensUsed: number;
  cost: number;
  error: string | null;
  duration: number;
  timestamp: string;
  input?: any;
  output?: any;
}

// Sample trace data generator
const generateTraces = (): Trace[] => {
  const actions = ['search_web', 'write_code', 'read_file', 'execute_command', 'analyze_data', 'deploy', 'test', 'optimize'];
  const tools = ['web_search', 'code_editor', 'file_system', 'terminal', 'analysis', 'deployment', 'testing', 'optimizer'];
  const agents = ['Research Agent', 'Code Agent', 'Analysis Agent'];
  const traces: Trace[] = [];
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(Date.now() - i * 60000);
    const isError = Math.random() < 0.15;
    traces.push({
      id: `trace-${i}`,
      agentId: `${(i % 3) + 1}`,
      agentName: agents[i % 3],
      action: actions[i % actions.length],
      toolName: tools[i % tools.length],
      status: isError ? 'error' : 'success',
      tokensUsed: Math.floor(500 + Math.random() * 3000),
      cost: parseFloat((Math.random() * 0.01).toFixed(6)),
      error: isError ? 'API timeout or invalid input' : null,
      duration: Math.floor(100 + Math.random() * 5000),
      timestamp: timestamp.toISOString(),
      input: { command: 'test', args: [] },
      output: { result: 'completed' }
    });
  }
  return traces.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate timeline data for charts
const generateTimelineData = (traces: Trace[]) => {
  const hourlyData: { [key: string]: { time: string; success: number; error: number; tokens: number } } = {};
  
  traces.forEach(trace => {
    const hour = new Date(trace.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (!hourlyData[hour]) {
      hourlyData[hour] = { time: hour, success: 0, error: 0, tokens: 0 };
    }
    if (trace.status === 'success') hourlyData[hour].success++;
    else hourlyData[hour].error++;
    hourlyData[hour].tokens += trace.tokensUsed;
  });
  
  return Object.values(hourlyData).reverse();
};

export default function TraceViewer() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [filter, setFilter] = useState({ status: 'all', agent: 'all', search: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(0);

  useEffect(() => {
    const data = generateTraces();
    setTraces(data);
    setTimelineData(generateTimelineData(data));
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!isPlaying || autoRefresh <= 0) return;
    const interval = setInterval(() => {
      const newTrace: Trace = {
        id: `trace-${Date.now()}`,
        agentId: `${(Math.floor(Math.random() * 3)) + 1}`,
        agentName: ['Research Agent', 'Code Agent', 'Analysis Agent'][Math.floor(Math.random() * 3)],
        action: ['search_web', 'write_code', 'read_file'][Math.floor(Math.random() * 3)],
        toolName: ['web_search', 'code_editor', 'file_system'][Math.floor(Math.random() * 3)],
        status: Math.random() < 0.1 ? 'error' : 'success',
        tokensUsed: Math.floor(500 + Math.random() * 3000),
        cost: parseFloat((Math.random() * 0.01).toFixed(6)),
        error: Math.random() < 0.1 ? 'Random error' : null,
        duration: Math.floor(100 + Math.random() * 5000),
        timestamp: new Date().toISOString()
      };
      setTraces(prev => [newTrace, ...prev.slice(0, 49)]);
      setAutoRefresh(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, autoRefresh]);

  // Filter traces
  const filteredTraces = traces.filter(trace => {
    if (filter.status !== 'all' && trace.status !== filter.status) return false;
    if (filter.agent !== 'all' && trace.agentId !== filter.agent) return false;
    if (filter.search && !trace.action.toLowerCase().includes(filter.search.toLowerCase()) && 
        !trace.toolName.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const totalTokens = filteredTraces.reduce((sum, t) => sum + t.tokensUsed, 0);
  const totalCost = filteredTraces.reduce((sum, t) => sum + t.cost, 0);
  const successRate = filteredTraces.length > 0 
    ? ((filteredTraces.filter(t => t.status === 'success').length / filteredTraces.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">SCOPE Trace Viewer</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search traces..." 
              value={filter.search}
              onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
              className="bg-elevated border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsPlaying(!isPlaying); setAutoRefresh(30); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${isPlaying ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{isPlaying ? 'Live' : 'Play'}</span>
          </button>
          <button className="relative p-2 hover:bg-elevated rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>
          <button className="flex items-center gap-2 p-2 hover:bg-elevated rounded-lg transition-colors">
            <User className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Bar */}
          <div className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Total Traces:</span>
                <span className="font-mono font-bold text-primary">{filteredTraces.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Tokens:</span>
                <span className="font-mono font-bold text-tactical">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Cost:</span>
                <span className="font-mono font-bold text-warning">${totalCost.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">Success:</span>
                <span className="font-mono font-bold text-success">{successRate}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={filter.status}
                onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                className="bg-elevated border border-border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
              <select 
                value={filter.agent}
                onChange={(e) => setFilter(f => ({ ...f, agent: e.target.value }))}
                className="bg-elevated border border-border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Agents</option>
                <option value="1">Research Agent</option>
                <option value="2">Code Agent</option>
                <option value="3">Analysis Agent</option>
              </select>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Trace List */}
            <div className="w-1/2 border-r border-border overflow-y-auto">
              {filteredTraces.map((trace) => (
                <div
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  className={`p-3 border-b border-border cursor-pointer transition-colors hover:bg-elevated ${
                    selectedTrace?.id === trace.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {trace.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-error" />
                      )}
                      <span className="font-medium text-sm">{trace.action}</span>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {trace.toolName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {trace.tokensUsed}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {trace.duration}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trace Detail */}
            <div className="w-1/2 overflow-y-auto bg-elevated/30">
              {selectedTrace ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{selectedTrace.action}</h3>
                    <button 
                      onClick={() => setSelectedTrace(null)}
                      className="p-1 hover:bg-surface rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted">Status</p>
                      <p className={`font-medium ${selectedTrace.status === 'success' ? 'text-success' : 'text-error'}`}>
                        {selectedTrace.status}
                      </p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted">Agent</p>
                      <p className="font-medium">{selectedTrace.agentName}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted">Tokens Used</p>
                      <p className="font-mono">{selectedTrace.tokensUsed}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted">Cost</p>
                      <p className="font-mono">${selectedTrace.cost.toFixed(6)}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted">Duration</p>
                      <p className="font-mono">{selectedTrace.duration}ms</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <p className="text-xs text-text-muted">Timestamp</p>
                      <p className="font-mono text-xs">{selectedTrace.timestamp}</p>
                    </div>
                  </div>

                  {selectedTrace.error && (
                    <div className="bg-error/10 border border-error/30 rounded-lg p-3">
                      <p className="text-xs text-error font-medium mb-1">Error</p>
                      <p className="text-sm text-error">{selectedTrace.error}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-text-muted mb-2">Input</p>
                    <pre className="bg-surface rounded-lg p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedTrace.input || {}, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted mb-2">Output</p>
                    <pre className="bg-surface rounded-lg p-3 text-xs overflow-x-auto">
                      {JSON.stringify(selectedTrace.output || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted">
                  <div className="text-center">
                    <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a trace to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="h-40 bg-surface border-t border-border p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3FB950" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3FB950" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F85149" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F85149" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="time" stroke="#8B949E" fontSize={10} />
                <YAxis stroke="#8B949E" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '8px' }}
                  labelStyle={{ color: '#8B949E' }}
                />
                <Area type="monotone" dataKey="success" stroke="#3FB950" fill="url(#colorSuccess)" name="Success" />
                <Area type="monotone" dataKey="error" stroke="#F85149" fill="url(#colorError)" name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
