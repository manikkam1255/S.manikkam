import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Search, 
  Download, 
  Printer, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  User,
  ArrowUpDown
} from 'lucide-react';
import { AttendanceRecord, Employee } from '../types';
import { AttendanceService } from '../services/storage';

interface AttendanceLogViewProps {
  records: AttendanceRecord[];
  allEmployees: Employee[];
}

type TimeRangeFilter = 'All Time' | 'Today' | '7 Days' | 'Month';

export const AttendanceLogView: React.FC<AttendanceLogViewProps> = ({
  records,
  allEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeFilter>('All Time');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All Employees');

  // Extract unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    allEmployees.forEach(e => set.add(e.department));
    return ['All Departments', ...Array.from(set)];
  }, [allEmployees]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search filter
      const matchesSearch = 
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Department filter
      if (selectedDepartment !== 'All Departments' && record.department !== selectedDepartment) {
        return false;
      }

      // Employee filter
      if (selectedEmployeeId !== 'All Employees' && record.employeeId !== selectedEmployeeId) {
        return false;
      }

      // Time range filter
      if (selectedTimeRange === 'Today') {
        return record.date === '2026-10-30';
      }
      if (selectedTimeRange === '7 Days') {
        const d = new Date(record.date);
        const ref = new Date('2026-10-30');
        const diffDays = (ref.getTime() - d.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7 && diffDays >= 0;
      }
      if (selectedTimeRange === 'Month') {
        return record.date.startsWith('2026-10');
      }

      return true;
    });
  }, [records, searchTerm, selectedDepartment, selectedEmployeeId, selectedTimeRange]);

  const handleExportCSV = () => {
    AttendanceService.downloadCSV(filteredRecords);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-2xl">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Attendance History Ledger</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Administrative View: Showing office-wide attendance records across all personnel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 no-print">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintSheet}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar matching Image 3 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Time range pills */}
          <div className="md:col-span-4 flex items-center space-x-1.5 overflow-x-auto">
            {(['All Time', 'Today', '7 Days', 'Month'] as TimeRangeFilter[]).map((pill) => (
              <button
                key={pill}
                onClick={() => setSelectedTimeRange(pill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTimeRange === pill
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Department Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All Employees" className="bg-slate-900">
                All Employees
              </option>
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-slate-900">
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Ledger Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verification Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-400">
                      {r.employeeId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {r.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {r.department}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {r.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {r.time}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {r.verificationMode}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No matching attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredRecords.length} of {records.length} total entries</span>
          <span>SQLite Database: Table `attendance`</span>
        </div>
      </div>
    </div>
  );
};
