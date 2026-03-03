import React, { useState } from 'react';
import { AIResponse, Discrepancy } from '../types';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { Download, AlertTriangle, IndianRupee, FileCheck, PackageX, PackageSearch } from 'lucide-react';

interface DashboardProps {
    result: AIResponse;
    onExportDiscrepancies: () => void;
    onExportPayout: () => void;
    onExportAnalytics: () => void;
    onExportJSON: () => void;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#0ea5e9', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({
    result,
    onExportAnalytics,
    onExportDiscrepancies,
    onExportJSON,
    onExportPayout
}) => {
    const { summary, discrepancies } = result;
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Prepare logic for charts
    const discrepancyCounts = discrepancies.reduce((acc, curr) => {
        acc[curr.error_type] = (acc[curr.error_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(discrepancyCounts).map(key => ({
        name: key,
        value: discrepancyCounts[key]
    }));

    const barData = Object.keys(discrepancyCounts).map(key => {
        const errs = discrepancies.filter(d => d.error_type === key);
        const sumOvercharge = errs.reduce((a, b) => a + b.overcharge_amount, 0);
        return {
            name: key.split(' ')[0], // short name
            Volume: errs.length,
            Value: sumOvercharge
        };
    });

    const totalPages = Math.ceil(discrepancies.length / rowsPerPage);
    const currentTableData = discrepancies.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in duration-700">

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Audit Results</h1>
                    <p className="text-slate-500">Overview of discrepancies and verified payouts.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={onExportDiscrepancies} className="flex flex-col items-center p-3 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"><Download size={16} className="mb-1" /> Discrepancies</button>
                    <button onClick={onExportPayout} className="flex flex-col items-center p-3 text-xs font-semibold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"><Download size={16} className="mb-1" /> Clean Payout</button>
                    <button onClick={onExportAnalytics} className="flex flex-col items-center p-3 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"><Download size={16} className="mb-1" /> Analytics</button>
                    <button onClick={onExportJSON} className="flex flex-col items-center p-3 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"><Download size={16} className="mb-1" /> Raw JSON</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                    { title: 'Analyzed', val: summary.total_shipments_analyzed, icon: <PackageSearch className="text-blue-500" />, bg: 'bg-blue-50/50' },
                    { title: 'Total Billed', val: formatCurrency(summary.total_billed), icon: <IndianRupee className="text-slate-500" />, bg: 'bg-slate-50/50' },
                    { title: 'Overcharges found', val: formatCurrency(summary.total_overcharge), icon: <AlertTriangle className="text-red-500" />, bg: 'bg-red-50/50' },
                    { title: 'Error Count', val: summary.error_count, icon: <PackageX className="text-orange-500" />, bg: 'bg-orange-50/50' },
                    { title: 'Verified Payout', val: formatCurrency(summary.verified_payout), icon: <FileCheck className="text-green-500" />, bg: 'bg-green-50/50' },
                ].map((card, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border border-slate-100 shadow-sm ${card.bg}`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-semibold text-slate-600">{card.title}</p>
                            {card.icon}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">{card.val}</h3>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Error Distribution (Volume)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Overcharge Value by Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar yAxisId="left" dataKey="Value" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Discrepancies Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Discrepancy Records ({discrepancies.length})</h3>
                    <select
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={rowsPerPage}
                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">AWB</th>
                                <th className="px-6 py-4">Error Type</th>
                                <th className="px-6 py-4 text-right">Billed</th>
                                <th className="px-6 py-4 text-right">Expected</th>
                                <th className="px-6 py-4 text-right">Overcharge</th>
                                <th className="px-6 py-4 w-1/3">Explanation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentTableData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{row.awb}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-xs bg-red-100 text-red-800">
                                            {row.error_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-500">{formatCurrency(row.billed_amount)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-green-600">{formatCurrency(row.expected_amount)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-red-600 font-semibold">{formatCurrency(row.overcharge_amount)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-600 leading-relaxed">{row.explanation}</td>
                                </tr>
                            ))}
                            {currentTableData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No discrepancies found. All records match cleanly.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <span className="text-sm text-slate-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors bg-white text-slate-700"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors bg-white text-slate-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
