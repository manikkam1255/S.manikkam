import React, { useState, useEffect } from 'react';
import { 
  ScanLine, 
  IdCard, 
  Clock, 
  ShieldCheck, 
  CheckSquare, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Users, 
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { ActiveTab, Employee, AttendanceRecord } from '../types';

interface DashboardViewProps {
  currentUser: Employee;
  allRecords: AttendanceRecord[];
  allEmployees: Employee[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  allRecords,
  allEmployees,
  setActiveTab,
  onOpenScanner,
}) => {
  const [terminalTime, setTerminalTime] = useState({
    timeStr: '01:28:16 PM',
    dateStr: 'Friday, October 30, 2026',
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format 12-hour AM/PM
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      setTerminalTime({
        timeStr: `${formattedHours}:${minutes}:${seconds} ${ampm}`,
        dateStr: now.toLocaleDateString('en-US', options),
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = '2026-10-30';
  const hasCheckedInToday = allRecords.some(
    r => r.employeeId.toLowerCase() === currentUser.id.toLowerCase() && r.date === todayStr
  );
  const todayRecord = allRecords.find(
    r => r.employeeId.toLowerCase() === currentUser.id.toLowerCase() && r.date === todayStr
  );

  const totalUserDays = allRecords.filter(
    r => r.employeeId.toLowerCase() === currentUser.id.toLowerCase()
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-300 text-xs font-mono">
              <span>{currentUser.department}</span>
              <span>•</span>
              <span className="font-semibold text-white">{currentUser.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name}!
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              QR-Based Smart Attendance System for Office. Hold your employee QR code up to the scanner or generate your printable office ID badge below.
            </p>
          </div>

          {/* Office Terminal Time Widget */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 shadow-2xl min-w-[280px] backdrop-blur-md">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Office Terminal Time</span>
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-white">
              {terminalTime.timeStr}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{terminalTime.dateStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Today's Attendance */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today&apos;s Attendance
              </span>
              {hasCheckedInToday ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Present</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending</span>
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-white mb-1">
              {hasCheckedInToday ? (
                <span className="text-emerald-400">Marked for Today</span>
              ) : (
                <span>Not Marked Yet</span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-6">
              {hasCheckedInToday && todayRecord
                ? `Logged at ${todayRecord.time} via ${todayRecord.verificationMode}`
                : 'Use camera or quick-scan to record your entry.'}
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open QR Scanner</span>
          </button>
        </div>

        {/* Card 2: Total Days Present */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Days Present
              </span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>

            <div className="text-3xl font-black text-white mb-1">
              {totalUserDays} <span className="text-lg font-normal text-slate-400">days</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {totalUserDays} sessions logged this month
            </p>

            <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (totalUserDays / 20) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Goal: 20 days</span>
              <span>{Math.round((totalUserDays / 20) * 100)}% Complete</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('log')}
            className="mt-6 w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>View Attendance Log</span>
          </button>
        </div>

        {/* Card 3: System Role & Access */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                System Role &amp; Access
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>

            <div className="text-xl font-bold text-white mb-1">
              {currentUser.role === 'ADMIN' ? 'Admin' : 'Employee'}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({currentUser.designation || currentUser.role})
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              {currentUser.role === 'ADMIN'
                ? 'Full administrative rights to manage all employees & view entire office logs.'
                : 'Employee permissions to scan own badge and review personal attendance ledger.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin')}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/30"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Admin Console</span>
          </button>
        </div>
      </div>

      {/* Application Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Application Modules
          </h2>
          <span className="text-xs text-slate-500">6 Connected Core Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1 */}
          <div 
            onClick={() => setActiveTab('scan')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/60 hover:bg-slate-900 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-lg bg-blue-950 border border-blue-800/50 text-blue-400 group-hover:scale-105 transition-transform">
              <ScanLine className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Live QR Scanner
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                HTML5 webcam scanning, image upload decode, and automated Table 3 rule simulation.
              </p>
            </div>
          </div>

          {/* Module 2: Dedicated Student / Employee QR Code Badge Part */}
          <div 
            onClick={() => setActiveTab('badge')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/60 hover:bg-slate-900 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-800/50 text-cyan-400 group-hover:scale-105 transition-transform">
              <IdCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  My Student / Staff QR Badge
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dedicated module housing your scannable QR matrix, student/employee details, and printable CR80 badge.
              </p>
            </div>
          </div>

          {/* Module 3 */}
          <div 
            onClick={() => setActiveTab('log')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/60 hover:bg-slate-900 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-lg bg-amber-950 border border-amber-800/50 text-amber-400 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                  Attendance Ledger
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Office-wide historical logs with search, time range filters, CSV export &amp; print sheet.
              </p>
            </div>
          </div>

          {/* Module 4 */}
          <div 
            onClick={() => setActiveTab('directory')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/60 hover:bg-slate-900 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-lg bg-sky-950 border border-sky-800/50 text-sky-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors">
                  Staff Directory (All Members)
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Verified personnel profiles with unique cryptographic QR token cards and quick pass printing.
              </p>
            </div>
          </div>

          {/* Module 5 */}
          <div 
            onClick={() => setActiveTab('admin')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/60 hover:bg-slate-900 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-lg bg-purple-950 border border-purple-800/50 text-purple-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                  Admin Control Center
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Employee registration, daily turnout roster, database audit logs, and SQLite backups.
              </p>
            </div>
          </div>

          {/* Module 6 */}
          <div 
            onClick={() => setActiveTab('tests')}
            className="group cursor-pointer p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/60 hover:bg-slate-900 transition-all flex items-start space-x-4"
          >
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-400 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                  System Test Suite (17 Scenarios)
                </h3>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Automated live execution and verification of test cases (TC-01 through TC-17).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Office Personnel & Students Roster Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-base sm:text-lg">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Registered Personnel &amp; Students Roster</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Overview of all registered users on this portal ({allEmployees.length} registered accounts)
            </p>
          </div>
          <button
            onClick={() => setActiveTab('directory')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
          >
            <span>Open Full Staff Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {allEmployees.map(emp => (
            <div 
              key={emp.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white leading-tight">
                    {emp.name}
                  </h4>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{emp.id}</span>
                    <span>•</span>
                    <span>{emp.department}</span>
                  </div>
                </div>
              </div>

              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                emp.role === 'ADMIN' ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {emp.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
