import { ERPLayout } from '../layout/ERPLayout';
import { Terminal, Cpu, Cloud, GitBranch, Activity, Server, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function DevOpsView() {
    const monitors = [
        { label: 'CPU Usage', value: '12%', status: 'Healthy', color: 'text-emerald-500' },
        { label: 'RAM', value: '4.2GB / 16GB', status: 'Healthy', color: 'text-emerald-500' },
        { label: 'Active Tasks', value: '148', status: 'Processing', color: 'text-blue-500' },
        { label: 'Errors (24h)', value: '0', status: 'Optimal', color: 'text-emerald-500' },
    ];

    return (
        <ERPLayout title="Infraestructura y DevOps" subtitle="Monitoreo de servidores, despliegues y contenedores">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {monitors.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-2xl"
                    >
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                        <p className="text-2xl font-bold text-white font-mono">{m.value}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${m.color.replace('text', 'bg')}`} />
                            <p className={`text-[10px] font-bold ${m.color}`}>{m.status}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-blue-400" /> Recent Deployments
                    </h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <GitBranch className="w-5 h-5 text-purple-400" />
                                <div className="flex-1">
                                    <p className="text-slate-200 text-sm font-mono">v2.4.5-production</p>
                                    <p className="text-slate-500 text-xs">Merged by github-actions • 20m ago</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">SUCCESS</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-400" /> Service Status
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'API Gateway', icon: Cloud, status: 'Online' },
                            { name: 'Microservice Auth', icon: Server, status: 'Online' },
                            { name: 'Redis Cache', icon: Cpu, status: 'Online' },
                            { name: 'Database Primary', icon: Server, status: 'Degraded', iconColor: 'text-amber-400' },
                        ].map((s) => (
                            <div key={s.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <s.icon className={`w-4 h-4 ${s.iconColor || 'text-slate-400'}`} />
                                    <span className="text-slate-300 text-sm">{s.name}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${s.status === 'Online' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Detection of increased latency in the main database cluster. Initializing automated failover protocol...
                        </p>
                    </div>
                </div>
            </div>
        </ERPLayout>
    );
}
