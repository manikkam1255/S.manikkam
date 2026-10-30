import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Users, 
  CheckCircle2, 
  Percent, 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  QrCode, 
  Check, 
  Clock, 
  Mail, 
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Employee, AttendanceRecord, Role, ActiveTab } from '../types';
import { AttendanceService } from '../services/storage';

interface AdminConsoleViewProps {
  allEmployees: Employee[];
  allRecords: AttendanceRecord[];
  onRefresh: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  allEmployees,
  allRecords,
  onRefresh,
  setActiveTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'roster' | 'add' | 'audit'>('directory');
  const [searchTerm, setSearchTerm] = useState('');

  // New Employee Form State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Computer Science');
  const [newRole, setNewRole] = useState<Role>('EMPLOYEE');
  const [newDesignation, setNewDesignation] = useState('');
  const [formFeedback, setFormFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Stats
  const todayStr = '2026-10-30';
  const todayPresentCount = allEmployees.filter(emp => 
    allRecords.some(r => r.employeeId.toLowerCase() === emp.id.toLowerCase() && r.date === todayStr)
  ).length;

  const totalStaff = allEmployees.length;
  const attendanceRate = totalStaff > 0 ? Math.round((todayPresentCount / totalStaff) * 100) : 0;
  const totalLogs = allRecords.length;

  const handleBackupDB = () => {
    AttendanceService.downloadDatabaseBackup();
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to default seed state? This restores all 5 original accounts and 15 attendance logs.')) {
      AttendanceService.resetDemoData();
      onRefresh();
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete employee record for ${name} (${id})?`)) {
      AttendanceService.deleteEmployee(id);
      onRefresh();
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!newId.trim() || !newName.trim() || !newEmail.trim()) {
      setFormFeedback({ success: false, message: 'Please fill in all required fields.' });
      return;
    }

    const res = AttendanceService.addEmployee({
      id: newId.trim().toUpperCase(),
      name: newName.trim(),
      email: newEmail.trim(),
      department: newDept,
      role: newRole,
      designation: newDesignation.trim() || (newRole === 'ADMIN' ? 'Administrator' : 'Staff Member'),
    });

    setFormFeedback(res);
    if (res.success) {
      setNewId('');
      setNewName('');
      setNewEmail('');
      setNewDesignation('');
      onRefresh();
    }
  };

  const handleManualMarkPresent = (employeeId: string) => {
    const res = AttendanceService.processScan(employeeId, 'SP24CPU049', 'Admin Manual');
    alert(res.message);
    onRefresh();
  };

  const filteredEmployees = allEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-2xl">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <span>Administrator Control Center</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Role-Based Access Control (Chapter 3.2.8): Manage employee directory, office rosters, and database audit logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackupDB}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Backup DB</span>
          </button>

          <button
            onClick={handleResetData}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards matching Image 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Staff
          </span>
          <div className="text-3xl font-black text-white mt-1">
            {totalStaff}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered accounts
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Present Today
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {todayPresentCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified check-ins
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Attendance Rate
          </span>
          <div className="text-3xl font-black text-blue-400 mt-1">
            {attendanceRate}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Today&apos;s turnout
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Logs
          </span>
          <div className="text-3xl font-black text-purple-400 mt-1">
            {totalLogs}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            All-time DB entries
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'directory'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory ({allEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'roster'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today&apos;s Daily Roster</span>
        </button>

        <button
          onClick={() => setActiveSubTab('add')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'add'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee / Admin</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'audit'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Audit Logs</span>
        </button>
      </div>

      {/* Sub Tab 1: Directory Table */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Today&apos;s Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredEmployees.map((emp) => {
                    const hasAttended = allRecords.some(
                      r => r.employeeId.toLowerCase() === emp.id.toLowerCase() && r.date === todayStr
                    );

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                          {emp.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {emp.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {emp.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {emp.department}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            emp.role === 'ADMIN'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {hasAttended ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-slate-500 font-medium">
                              <span>⊗ Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setActiveTab('badge')}
                              title="View & Print QR Badge"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            {!hasAttended && (
                              <button
                                onClick={() => handleManualMarkPresent(emp.id)}
                                title="Admin Manual Mark"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              title="Delete Record"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Today's Roster */}
      {activeSubTab === 'roster' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              Live Roster for Friday, October 30, 2026
            </h3>
            <span className="text-xs text-slate-400">
              {todayPresentCount} of {totalStaff} Employees Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allEmployees.map((emp) => {
              const rec = allRecords.find(
                r => r.employeeId.toLowerCase() === emp.id.toLowerCase() && r.date === todayStr
              );

              return (
                <div 
                  key={emp.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    rec 
                      ? 'bg-emerald-950/30 border-emerald-800/40' 
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                      rec ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.id} • {emp.department}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {rec ? (
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 block">
                          Present ({rec.time})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {rec.verificationMode}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleManualMarkPresent(emp.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-blue-400 font-medium"
                      >
                        Mark Present
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Add Employee Form */}
      {activeSubTab === 'add' && (
        <div className="max-w-2xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center space-x-2 text-white font-bold text-base mb-4">
            <Plus className="w-5 h-5 text-purple-400" />
            <span>Register New Employee into SQLite Ledger</span>
          </div>

          {formFeedback && (
            <div className={`p-3 rounded-xl mb-4 text-xs font-medium ${
              formFeedback.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {formFeedback.message}
            </div>
          )}

          <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Employee ID *</label>
                <input
                  type="text"
                  placeholder="e.g. EMP005 or SP24CPU050"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vignesh R"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. vignesh@stpeter.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="DevOps & Systems">DevOps & Systems</option>
                  <option value="Faculty & Guide">Faculty & Guide</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="EMPLOYEE">Employee (Standard Access)</option>
                  <option value="ADMIN">Admin (Supervisory Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Save Employee &amp; Generate QR Badge</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub Tab 4: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm">
            Security &amp; Transaction Audit Trail
          </h3>
          <div className="space-y-2">
            {AttendanceService.getAuditLogs().map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-purple-400 font-semibold">{log.action}</span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
                  <span>By: {log.performedBy}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
