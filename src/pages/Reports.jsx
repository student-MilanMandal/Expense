import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/ExpensePailot.jpg';
import { toast } from 'react-toastify';
import {
  HiArrowDownTray,
  HiPrinter,
  HiSparkles,
  HiDocumentChartBar,
  HiClock,
  HiDocumentText,
  HiUser,
} from 'react-icons/hi2';

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('expense'); // income, expense, khata, cashbook
  const [period, setPeriod] = useState('monthly'); // daily, weekly, monthly, yearly
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/reports/generateReport', {
        type: reportType,
        period,
      });

      if (res.data.success) {
        setReportData(res.data.data);
        toast.success(`${reportType.toUpperCase()} report generated!`);
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      toast.error('No report data available to export');
      return;
    }

    const cols = reportData.columns.map((c) => c.label);
    const keys = reportData.columns.map((c) => c.key);

    const csvLines = [];
    csvLines.push(cols.join(','));

    reportData.rows.forEach((row) => {
      const values = keys.map((key) => {
        const val = row[key] !== undefined ? row[key] : '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvLines.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded successfully!');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const formatCellValue = (key, val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('opening') || key.toLowerCase().includes('closing') || key.toLowerCase().includes('paid') || key.toLowerCase().includes('balance')) {
      const num = Number(val);
      if (!isNaN(num)) {
        return `₹${num.toLocaleString('en-IN')}`;
      }
    }
    return val;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Expense & Income Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Generate and export custom PDF & CSV reports for your expenses, incomes, cash flow, and khata ledgers
          </p>
        </div>
      </div>

      {/* Control Panel / Report Parameters (Hidden when printing) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4 backdrop-blur-xl no-print">
        <div className="flex items-center space-x-2">
          <HiDocumentText className="w-5 h-5 text-indigo-500" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Report Parameters
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
              <HiDocumentChartBar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Report Type</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
            >
              <option value="expense">Expenses Report</option>
              <option value="income">Income Report</option>
              <option value="khata">Khata Customer Ledger Report</option>
              <option value="cashbook">Cash Book Flow Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1">
              <HiClock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Time Period</span>
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Generating...</span>
              ) : (
                <>
                  <HiSparkles className="w-5 h-5" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report View Container */}
      {reportData && (
        <div className="space-y-4">
          {/* Export Actions Toolbar (Hidden when printing) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md no-print">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs sm:text-sm">
              <HiDocumentText className="w-5 h-5" />
              <span>Report Ready for Download / PDF Export</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <HiArrowDownTray className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-95 hover:scale-105 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
              >
                <HiPrinter className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Official Statement Document */}
          <div className="report-print-card p-6 sm:p-10 rounded-3xl bg-white text-slate-900 border border-slate-200/80 shadow-xl space-y-6">
            {/* Official Document Header */}
            <div className="border-b-2 border-slate-900 pb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <img
                      src={logoImg}
                      alt="ExpensePilot Logo"
                      className="w-11 h-11 rounded-2xl object-cover shadow-md border border-slate-200"
                    />
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase">
                        ExpensePilot
                      </h1>
                      <p className="text-xs font-bold text-slate-600">
                        Personal & Business Ledger Expense Tracking Statement
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs space-y-1">
                  <p className="font-black text-indigo-600 uppercase tracking-wider text-sm sm:text-base">
                    {reportData.reportMetaData?.title || `${reportType} Report`}
                  </p>
                  <p className="text-slate-700 font-bold flex items-center sm:justify-end space-x-1">
                    <HiUser className="w-4 h-4 text-indigo-600" />
                    <span>Holder: <strong className="text-slate-900 font-black">{user?.name || user?.userName || 'MILAN MANDAL'}</strong> ({user?.email || 'N/A'})</span>
                  </p>
                  <p className="text-slate-600 font-semibold">
                    Period: <span className="uppercase font-black text-indigo-600">{reportData.reportMetaData?.period}</span> | Generated: {new Date(reportData.reportMetaData?.generatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Metadata Grid */}
            {reportData.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-100 border border-slate-300">
                {Object.entries(reportData.summary).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="uppercase text-[10px] sm:text-[11px] font-black text-slate-600 tracking-wider block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-sm sm:text-lg font-black text-slate-900 block">
                      {typeof val === 'number' && key.toLowerCase().includes('total') ? `₹${val.toLocaleString('en-IN')}` : val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Full Width Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                    {reportData.columns.map((col) => (
                      <th key={col.key} className="py-3.5 px-4 border border-slate-900">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-xs sm:text-sm">
                  {reportData.rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      {reportData.columns.map((col) => (
                        <td key={col.key} className="py-3.5 px-4 font-bold text-slate-900 border border-slate-300">
                          {formatCellValue(col.key, row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Document Footer */}
            <div className="pt-6 border-t border-slate-300 text-[11px] text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2 font-bold">
              <p>© {new Date().getFullYear()} ExpensePilot • Official Computer Generated Statement (No Signature Required)</p>
              <p>Confidential & Personal Expense Tracker Record</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
