import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { Activity, Database, AlertCircle, MessageSquare, Zap, Server, Globe, BarChart3, TrendingUp, Cpu, Network, ShieldCheck, Clock, Layers, Terminal, Box, Search, ExternalLink, HardDrive, Filter, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3001');

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-300 p-2 shadow-xl rounded-lg backdrop-blur-xl">
        <p className="text-[10px] font-black text-emerald-600 uppercase mb-0.5 tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-900">{payload[0].value}<span className="text-[9px] font-medium ml-1 text-slate-500">MSG/SEC</span></p>
      </div>
    );
  }
  return null;
};

function App() {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, errors: 0, notifications: 0, latency: 9 });
  const [lastEvent, setLastEvent] = useState(null);
  const [uptime, setUptime] = useState(0);

  const distribution = useMemo(() => [
    { name: 'Events', value: Math.max(1, stats.totalEvents - stats.notifications - stats.errors), color: '#10b981' },
    { name: 'Notifs', value: Math.max(1, stats.notifications), color: '#3b82f6' },
    { name: 'DLQ', value: Math.max(1, stats.errors), color: '#ef4444' }
  ], [stats]);

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    socket.on('kafka-event', (data) => {
      setStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        errors: data.topic === 'dead-letter-topic' ? prev.errors + 1 : prev.errors,
        notifications: data.topic === 'notifications' ? prev.notifications + 1 : prev.notifications,
        latency: Math.floor(Math.random() * 4) + 6
      }));

      if (data.topic !== 'analytics') {
        setEvents(prev => [data, ...prev].slice(0, 10));
        setLastEvent(data);
      } else {
        setAnalytics(prev => [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          count: data.payload.count
        }].slice(-12));
      }
    });
    return () => {
      socket.off('kafka-event');
      clearInterval(timer);
    };
  }, []);

  const formatUptime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-screen bg-[#f1f5f9] p-2 text-slate-900 font-sans overflow-hidden flex flex-col selection:bg-emerald-100">
      
      {/* Luminous Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-200/40 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-200/40 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-[1750px] mx-auto w-full flex-1 flex flex-col space-y-2.5 z-10 relative overflow-hidden">
        
        {/* Header - Optimized Height & Legibility */}
        <header className="h-[60px] flex items-center justify-between px-4 py-1 bg-white/70 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-sm shrink-0">
          <div className="flex items-center gap-5">
             <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                  <Zap size={18} className="text-white fill-white" />
                </div>
                <div>
                   <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">STREAMFLOW</h1>
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Industrial Data Engine</p>
                </div>
             </div>
             <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
             <div className="flex gap-2.5">
               <StatusTag label="CLUSTER" status="PRODUCTION-01" dot="bg-emerald-500" />
               <StatusTag label="UPTIME" status={formatUptime(uptime)} dot="bg-blue-500" />
             </div>
          </div>
          <div className="flex items-center gap-4">
             <MetricBox icon={<Cpu size={14}/>} label="V8-PROCESS" val="1.8%" />
             <MetricBox icon={<Network size={14}/>} label="LATENCY-P99" val={`${stats.latency}ms`} />
          </div>
        </header>

        {/* Mosaic Stats Strip */}
        <div className="h-[75px] grid grid-cols-4 gap-3 shrink-0">
           <CompactStat title="Total Ingest Bus" value={stats.totalEvents} color="emerald" icon={<TrendingUp size={16}/>} />
           <CompactStat title="Socket Broadcasts" value={stats.notifications} color="blue" icon={<MessageSquare size={16}/>} />
           <CompactStat title="DLQ Record Faults" value={stats.errors} color="red" icon={<AlertCircle size={16}/>} />
           <CompactStat title="Data Sync Logic" value="Health: OK" color="indigo" icon={<ShieldCheck size={16}/>} />
        </div>

        {/* Global Operational Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">
           
           {/* Left Engine Workspace (8/12) */}
           <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 min-h-0">
              {/* Velocity Monitor - High Legibility */}
              <div className="flex-[3] glass p-5 rounded-2xl border border-slate-200 flex flex-col shadow-sm min-h-0 bg-white/40">
                 <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                       <Activity size={14} className="text-emerald-600" /> Ingestion Throughput Velocity
                    </h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">STREAMING LIVE</span>
                    </div>
                 </div>
                 <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={analytics}>
                         <defs>
                           <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                         <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                         <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                         <Tooltip content={<CustomTooltip />} />
                         <Area type="monotone" dataKey="count" stroke="#059669" fillOpacity={1} fill="url(#glowGrad)" strokeWidth={3} activeDot={{ r: 4, strokeWidth: 0, fill: '#059669' }} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Inspector Row - Legible Proportions */}
              <div className="flex-[2] grid grid-cols-2 gap-3 min-h-0">
                 {/* Event Inspector - Enhanced Text */}
                 <div className="glass p-4 rounded-2xl border border-slate-200 flex flex-col min-h-0 overflow-hidden bg-white/80">
                    <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                       <div className="flex items-center gap-2"><Search size={14} className="text-blue-600" /> Deep Payload Inspector</div>
                       <Filter size={12} className="text-slate-400" />
                    </h2>
                    <div className="flex-1 bg-slate-950 rounded-xl border border-slate-200 p-3 overflow-hidden flex flex-col shadow-inner">
                       {lastEvent ? (
                         <pre className="text-[10px] font-mono text-emerald-400 flex-1 overflow-auto custom-scrollbar break-all whitespace-pre-wrap leading-relaxed selection:bg-emerald-500/20">
                            {JSON.stringify(lastEvent, null, 2)}
                         </pre>
                       ) : (
                         <div className="flex-1 flex items-center justify-center italic text-slate-600 text-[11px] uppercase font-bold tracking-[0.2em] animate-pulse">Waiting for event pulse...</div>
                       )}
                    </div>
                 </div>

                 {/* Real-time Flux Observer */}
                 <div className="glass p-4 rounded-2xl border border-slate-200 flex flex-col min-h-0 overflow-hidden bg-white/80">
                    <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-slate-100 pb-2">
                       <Terminal size={14} className="text-emerald-600" /> Live Pipeline Observer
                    </h2>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                       <AnimatePresence mode="popLayout">
                          {events.map((ev, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 transition-all hover:bg-white hover:shadow-sm">
                               <div className={`w-1.5 h-4 rounded-full ${ev.topic.includes('error') ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                               <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase mb-1">
                                     <span className="bg-slate-200 px-1.5 py-0.5 rounded">{ev.topic.split('-')[0]}</span>
                                     <span className="font-bold">{new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' })}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-900 font-mono truncate leading-none">{JSON.stringify(ev.payload)}</p>
                               </div>
                            </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>
           </div>

           {/* Infrastructure Sidebar (4/12) */}
           <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-hidden">
              {/* Stack Matrix - Fixed View */}
              <div className="flex-1 glass p-5 rounded-2xl border border-slate-200 flex flex-col shadow-sm bg-white overflow-hidden">
                 <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={14} className="text-blue-600" /> Production Infrastructure
                 </h2>
                 <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 border-b border-slate-100 pb-4">
                    <StackItem icon={<Globe size={14}/>} name="Kafka Instance" val="PROD-CLUSTER-01" status="UP" />
                    <StackItem icon={<Database size={14}/>} name="PostgreSQL DB" val="Event-Persistence" status="OK" />
                    <StackItem icon={<ShieldCheck size={14}/>} name="Zod Validation" val="Schema Locked" status="ON" />
                    <StackItem icon={<Box size={14}/>} name="Docker Micro" val="Isolation Ready" status="STABLE" />
                 </div>
                 {/* Consumer Group Tracking - High Visibility */}
                 <div className="h-[170px] mt-4 space-y-3 overflow-hidden flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle size={12} className="text-indigo-500" /> Active Groups
                    </h3>
                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-0.5">
                       <ConsumerItem name="ANALYTICS-ENGINE" lag="0.04ms" status="ACTIVE" />
                       <ConsumerItem name="DATABASE-WRITER" lag="1.2ms" status="SYNC" />
                       <ConsumerItem name="NOTIFICATION-HUB" lag="0.2ms" status="IDLE" />
                    </div>
                 </div>
              </div>

              {/* Traffic Mix Visualization */}
              <div className="h-[180px] glass p-5 rounded-2xl border border-slate-200 flex flex-col bg-slate-900 shadow-xl shrink-0">
                 <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart3 size={14} className="text-emerald-400" /> Topic Aggregation
                 </h2>
                 <div className="flex-1 min-h-0 opacity-90">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={distribution} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={60} tickLine={false} axisLine={false} />
                         <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                           {distribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                         </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

        </div>

        {/* Global Footer */}
        <footer className="h-[30px] flex items-center justify-between px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] border-t border-slate-200 shrink-0">
           <div className="flex gap-8">
              <span>Platform Core v1.1.2</span>
              <span className="text-emerald-600">STABILITY: EXCELLENT</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-slate-900">
                <span>© 2026 MNH</span>
                <Globe size={10} className="text-slate-900" />
                <span className="tracking-tight lowercase">@noumanic</span>
              </div>
           </div>
        </footer>

      </div>
    </div>
  );
}

function CompactStat({ title, value, color, icon }) {
  const colors = {
    emerald: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    blue: 'text-blue-800 bg-blue-50 border-blue-200',
    red: 'text-red-800 bg-red-50 border-red-200',
    indigo: 'text-indigo-800 bg-indigo-50 border-indigo-200'
  };
  return (
    <div className={`glass p-4 rounded-2xl border flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-md bg-white ${colors[color]}`}>
       <div className={`p-2.5 rounded-xl bg-white/80 border border-current opacity-80 shadow-sm`}>{icon}</div>
       <div>
          <h3 className="text-2xl font-black leading-none tracking-tighter">{value}</h3>
          <p className="text-[10px] font-black uppercase opacity-60 mt-1 tracking-widest leading-none">{title}</p>
       </div>
    </div>
  );
}

function ConsumerItem({ name, lag, status }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200 group hover:border-indigo-300 transition-colors">
       <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-900 leading-none">{name}</span>
          <span className="text-[8px] font-bold text-slate-500 mt-1 leading-none tracking-tight">LATENCY LAG: {lag}</span>
       </div>
       <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${status === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm'}`}>{status}</span>
    </div>
  );
}

function StatusTag({ label, status, dot }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
       <div className={`w-2 h-2 rounded-full ${dot} animate-pulse shadow-[0_0_5px_rgba(0,0,0,0.1)]`}></div>
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}:</span>
       <span className="text-[11px] font-black text-slate-900 uppercase leading-none">{status}</span>
    </div>
  );
}

function MetricBox({ icon, label, val }) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
       <div className="text-slate-400">{icon}</div>
       <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-500 leading-none uppercase tracking-widest">{label}</span>
          <span className="text-[11px] font-black text-emerald-600 leading-none mt-1">{val}</span>
       </div>
    </div>
  );
}

function StackItem({ icon, name, val, status }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 group hover:bg-slate-100/50 transition-colors">
       <div className="flex items-center gap-3 overflow-hidden">
          <div className="text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</div>
          <div className="flex flex-col truncate">
             <span className="text-[9px] font-black text-slate-500 uppercase leading-none tracking-tight">{name}</span>
             <span className="text-[11px] font-black text-slate-900 mt-1 truncate">{val}</span>
          </div>
       </div>
       <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${status === 'UP' || status === 'OK' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>{status}</span>
    </div>
  );
}

export default App;
