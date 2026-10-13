import React from 'react';
import {
    FileText,
    FileCheck,
    Handshake,
    Package,
    Truck,
    Clock,
    Plane,
    PackageCheck,
    CheckCircle2,
    Receipt,
    CheckSquare,
    TrendingUp
} from 'lucide-react';

// --- Reusable Components ---

const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="text-blue-600 dark:text-blue-400">
            {icon}
        </div>
        <h2 className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">{title}</h2>
        {subtitle && <span className="ml-auto text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{subtitle}</span>}
    </div>
);

const MetricCard = ({ icon, title, value, trend, trendValue, colorClass, trendUp = true }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200">
        <span className={`text-[10px] font-bold mb-1 text-center tracking-wide uppercase ${colorClass}`}>{title}</span>
        <div className={`text-2xl mb-1 ${colorClass}`}>{icon}</div>
        <div className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">{value}</div>
        <div className={`text-[9px] font-semibold flex items-center gap-1 mt-1.5 ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            <span className={`px-1 py-0.5 rounded ${trendUp ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}`}>
                {trendUp ? '↑' : '↓'} {trendValue}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">vs last mo</span>
        </div>
    </div>
);

const KpiCard = ({ icon, value, label, colorClass }) => (
    <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/30">
        <div className={`text-xl mb-1.5 ${colorClass}`}>{icon}</div>
        <div className={`text-base font-black font-mono tracking-tight ${colorClass}`}>{value}</div>
        <div className="text-[9px] text-center text-slate-500 dark:text-slate-400 mt-1 font-semibold uppercase tracking-wider">{label}</div>
    </div>
);

const BenefitCard = ({ icon, title, desc }) => (
    <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/30">
        <div className="text-blue-500 dark:text-blue-400 mt-0.5 bg-blue-50 dark:bg-blue-900/20 p-1 rounded">{icon}</div>
        <div>
            <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 tracking-wide">{title}</h4>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{desc}</p>
        </div>
    </div>
);

// --- Main Dashboard Component ---

const FmsDashboard = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-2 md:p-4 font-sans transition-colors duration-300 antialiased">
            <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

                <div className="p-3 md:p-5 space-y-4">

                    {/* --- KEY BUSINESS METRICS --- */}
                    <div>
                        <SectionHeader
                            icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>}
                            title="Key Business Metrics (Illustrative)"
                        />

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                            <MetricCard
                                icon={<FileText className="w-6 h-6" />}
                                title="Total Inquiries" value="125" trend="12%" trendUp={true} colorClass="text-blue-600 dark:text-blue-400"
                            />
                            <MetricCard
                                icon={<FileCheck className="w-6 h-6" />}
                                title="Active Quotations" value="86" trend="8%" trendUp={true} colorClass="text-emerald-600 dark:text-emerald-400"
                            />
                            <MetricCard
                                icon={<Handshake className="w-6 h-6" />}
                                title="Confirmed Bookings" value="54" trend="15%" trendUp={true} colorClass="text-orange-500 dark:text-orange-400"
                            />
                            <MetricCard
                                icon={<Package className="w-6 h-6" />}
                                title="Active Jobs" value="42" trend="10%" trendUp={true} colorClass="text-purple-600 dark:text-purple-400"
                            />
                            <MetricCard
                                icon={<Truck className="w-6 h-6" />}
                                title="In Transit" value="18" trend="20%" trendUp={true} colorClass="text-sky-500 dark:text-sky-400"
                            />
                            <MetricCard
                                icon={<Clock className="w-6 h-6" />}
                                title="Customs Pending" value="7" trend="30%" trendUp={false} colorClass="text-amber-600 dark:text-amber-500"
                            />

                            <MetricCard
                                icon={<Plane className="w-6 h-6" />}
                                title="Arrivals" value="11" trend="22%" trendUp={true} colorClass="text-pink-500 dark:text-pink-400"
                            />
                            <MetricCard
                                icon={<PackageCheck className="w-6 h-6" />}
                                title="Pending Deliveries" value="23" trend="8%" trendUp={false} colorClass="text-emerald-600 dark:text-emerald-400"
                            />
                            <MetricCard
                                icon={<CheckCircle2 className="w-6 h-6" />}
                                title="Completed Deliveries" value="108" trend="18%" trendUp={true} colorClass="text-blue-600 dark:text-blue-400"
                            />
                            <MetricCard
                                icon={<Receipt className="w-6 h-6" />}
                                title="Pending Billing" value="12" trend="25%" trendUp={false} colorClass="text-purple-600 dark:text-purple-400"
                            />
                            <MetricCard
                                icon={<CheckSquare className="w-6 h-6" />}
                                title="Closed Jobs" value="136" trend="28%" trendUp={true} colorClass="text-blue-700 dark:text-blue-500"
                            />
                            <MetricCard
                                icon={<TrendingUp className="w-6 h-6" />}
                                title="Total Profit" value="₹ XX.XX L" trend="27%" trendUp={true} colorClass="text-blue-600 dark:text-blue-400"
                            />
                        </div>
                    </div>

                    {/* --- MIDDLE ROW: CHARTS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                        {/* Shipment Status Overview (Donut) */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <SectionHeader icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path></svg>} title="Shipment Status Overview" />
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-2">
                                <div className="relative w-28 h-28 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" style={{ background: 'conic-gradient(#3b82f6 0% 13%, #f97316 13% 19%, #eab308 19% 26%, #22c55e 26% 68%, #9ca3af 68% 100%)' }}>
                                    <div className="absolute inset-0 m-auto w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Jobs</span>
                                        <span className="text-base font-black text-slate-800 dark:text-slate-100 font-mono">320</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 text-[10px] w-full max-w-[150px]">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Active Jobs</span><span className="font-bold text-slate-800 dark:text-slate-100 font-mono">42</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">In Transit</span><span className="font-bold text-slate-800 dark:text-slate-100 font-mono">18</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Pending Delivery</span><span className="font-bold text-slate-800 dark:text-slate-100 font-mono">23</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Closed Jobs</span><span className="font-bold text-slate-800 dark:text-slate-100 font-mono">136</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Others</span><span className="font-bold text-slate-800 dark:text-slate-100 font-mono">101</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue vs Cost (Bar Chart) */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <SectionHeader icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>} title="Revenue vs Cost (Illustrative)" />
                            <div className="flex items-end justify-around h-28 mt-3 gap-4 px-2">
                                <div className="flex flex-col items-center gap-1.5 w-full h-full justify-end">
                                    <div className="w-10 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t h-[85%] shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 w-full h-1/3"></div>
                                    </div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Revenue</span>
                                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 font-mono">₹ 85.00 L</span>
                                </div>
                                <div className="flex flex-col items-center gap-1.5 w-full h-full justify-end">
                                    <div className="w-10 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t h-[62%] shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 w-full h-1/3"></div>
                                    </div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Cost</span>
                                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 font-mono">₹ 62.00 L</span>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-center pt-1">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 py-1.5 text-center border border-emerald-100 dark:border-emerald-800/30">
                                    <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">Profit</div>
                                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-300 font-mono">₹ 23.00 L</div>
                                    <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded inline-block">(27%)</div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Job Trend (Line Chart) */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <SectionHeader icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>} title="Monthly Job Trend" />
                            <div className="flex gap-3 text-[9px] justify-end mb-2 mt-1">
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> <span className="text-slate-500 dark:text-slate-400 font-medium">Inquiries</span></div>
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> <span className="text-slate-500 dark:text-slate-400 font-medium">Bookings</span></div>
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> <span className="text-slate-500 dark:text-slate-400 font-medium">Completed Jobs</span></div>
                            </div>
                            <div className="relative h-28 w-full mt-1">
                                <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                                    <line x1="0" y1="30" x2="400" y2="30" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700" strokeDasharray="4" />
                                    <line x1="0" y1="70" x2="400" y2="70" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700" strokeDasharray="4" />
                                    <line x1="0" y1="110" x2="400" y2="110" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700" strokeDasharray="4" />

                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => (
                                        <text key={m} x={i * 75 + 15} y="145" fontSize="10" fill="currentColor" className="text-slate-400 dark:text-slate-500 font-medium">{m}</text>
                                    ))}
                                    {[0, 20, 40, 60, 80, 100].map((v, i) => (
                                        <text key={v} x="0" y={120 - i * 22.5} fontSize="9" fill="currentColor" className="text-slate-300 dark:text-slate-600 font-mono">{v}</text>
                                    ))}

                                    <polyline points="15,90 90,80 165,60 240,70 315,60 390,50" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="15,100 90,95 165,80 240,85 315,80 390,75" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="15,125 90,120 165,110 240,115 315,105 390,100" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="absolute top-0 right-0 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[8px] p-1 rounded border border-blue-100 dark:border-blue-800/50 max-w-[70px] shadow-sm font-medium leading-tight">
                                    Steady growth in bookings
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- BOTTOM MIDDLE ROW: TABLES & PIE --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                        {/* Top Shipment Routes (Table) */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <SectionHeader icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>} title="Top Shipment Routes" />
                            <div className="mt-2 text-[10px]">
                                <div className="grid grid-cols-5 font-bold text-slate-500 dark:text-slate-400 pb-1.5 mb-1 border-b border-slate-100 dark:border-slate-700 uppercase tracking-wider">
                                    <span>#</span><span>Origin</span><span>Destination</span><span className="text-right">Jobs</span><span className="text-right">%</span>
                                </div>
                                {[
                                    { id: 1, org: 'Chennai', dest: 'Dubai', jobs: 35, pct: '18%' },
                                    { id: 2, org: 'Mumbai', dest: 'Singapore', jobs: 28, pct: '15%' },
                                    { id: 3, org: 'Delhi', dest: 'London', jobs: 24, pct: '12%' },
                                    { id: 4, org: 'Bengaluru', dest: 'New York', jobs: 18, pct: '9%' },
                                    { id: 5, org: 'Chennai', dest: 'Singapore', jobs: 16, pct: '8%' },
                                ].map((row) => (
                                    <div key={row.id} className="grid grid-cols-5 py-2 text-slate-600 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800/80 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded px-1">
                                        <span className="font-bold text-slate-400">{row.id}</span>
                                        <span className="font-medium">{row.org}</span>
                                        <span className="col-span-1 font-medium">{row.dest}</span>
                                        <span className="text-right font-black text-slate-800 dark:text-slate-200 font-mono">{row.jobs}</span>
                                        <span className="text-right font-semibold text-blue-600 dark:text-blue-400">{row.pct}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Job Status by Stage (Horizontal Bar) */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                            <SectionHeader icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>} title="Job Status by Stage" />
                            <div className="mt-3 flex flex-col gap-2 text-[10px]">
                                {[
                                    { label: 'Inquiry', val: 125, color: 'bg-blue-500' },
                                    { label: 'Quotation', val: 86, color: 'bg-green-500' },
                                    { label: 'Booking', val: 54, color: 'bg-orange-500' },
                                    { label: 'Documentation', val: 48, color: 'bg-purple-500' },
                                    { label: 'Customs', val: 35, color: 'bg-pink-500' },
                                    { label: 'Transport', val: 42, color: 'bg-cyan-400' },
                                    { label: 'In Transit', val: 18, color: 'bg-blue-400' },
                                    { label: 'Arrival', val: 11, color: 'bg-yellow-400' },
                                    { label: 'Delivery', val: 23, color: 'bg-rose-400' },
                                    { label: 'Billing', val: 12, color: 'bg-purple-400' },
                                    { label: 'Closure', val: 136, color: 'bg-green-600' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <span className="w-20 text-slate-500 dark:text-slate-400 text-right truncate font-medium">{item.label}</span>
                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.val / 136) * 100}%` }}></div>
                                        </div>
                                        <span className="w-7 text-right font-black text-slate-700 dark:text-slate-200 font-mono">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Profitability by Shipment Type (Pie Chart) */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex flex-col">
                            <SectionHeader icon={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path></svg>} title="Profitability by Shipment Type" />
                            <div className="flex flex-col md:flex-row items-center justify-center gap-5 mt-3 flex-1">
                                <div className="relative w-24 h-24 rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)]" style={{ background: 'conic-gradient(#3b82f6 0% 35%, #22c55e 35% 80%, #f97316 80% 95%, #9ca3af 95% 100%)' }}>
                                    <div className="absolute top-1 right-1.5 text-[9px] text-white font-black drop-shadow-md">35%</div>
                                    <div className="absolute bottom-1.5 left-1.5 text-[9px] text-white font-black drop-shadow-md">45%</div>
                                    <div className="absolute top-1/2 left-1.5 text-[9px] text-white font-black drop-shadow-md">15%</div>
                                </div>
                                <div className="flex flex-col gap-2 text-[10px] w-full max-w-[140px]">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Air Freight</span><span className="font-black text-slate-800 dark:text-slate-100 font-mono">35%</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Sea Freight</span><span className="font-black text-slate-800 dark:text-slate-100 font-mono">45%</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Road Freight</span><span className="font-black text-slate-800 dark:text-slate-100 font-mono">15%</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div><span className="text-slate-500 dark:text-slate-400 flex-1 font-medium">Others</span><span className="font-black text-slate-800 dark:text-slate-100 font-mono">5%</span></div>
                                </div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg text-center text-[9px] text-blue-800 dark:text-blue-300 mt-3 font-semibold border border-blue-100 dark:border-blue-800/30 uppercase tracking-wide">
                                Air and Sea freight contribute 80% of total business revenue.
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default FmsDashboard;