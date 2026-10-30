import React, { useState, useEffect } from 'react';
import { ActiveTab, Employee, AttendanceRecord } from './types';
import { AttendanceService } from './services/storage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ScanView } from './components/ScanView';
import { BadgeView } from './components/BadgeView';
import { AttendanceLogView } from './components/AttendanceLogView';
import { StaffDirectoryView } from './components/StaffDirectoryView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { TestSuiteView } from './components/TestSuiteView';
import { AuthView } from './components/AuthView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('SP24CPU049');
  
  // Authentication states: First Registration is the First Page upon load
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const refreshData = () => {
    setAllEmployees(AttendanceService.getEmployees());
    setAllRecords(AttendanceService.getAttendanceRecords());
  };

  useEffect(() => {
    refreshData();
    // Do not automatically bypass registration on fresh landing
  }, []);

  const handleSwitchUser = (userId: string) => {
    AttendanceService.setCurrentUserId(userId);
    setCurrentUserId(userId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    AttendanceService.logout();
    setIsLoggedIn(false);
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (employee: Employee) => {
    refreshData();
    setCurrentUserId(employee.id);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    // User lands on the main website dashboard to see full system update and members
    setActiveTab('dashboard');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const currentUser = allEmployees.find(e => e.id === currentUserId) || allEmployees[0] || {
    id: 'SP24CPU049',
    name: 'Prem Kumar M',
    email: 'prem@example.test',
    department: 'Engineering',
    role: 'ADMIN',
    designation: 'Lead Systems Developer & Researcher'
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setShowAuthModal(false);
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        allEmployees={allEmployees}
        isLoggedIn={isLoggedIn}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* If user explicitly opens Login/Register, or is logged out */}
        {showAuthModal ? (
          <AuthView
            initialMode={authMode}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthModal(false)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                allRecords={allRecords}
                allEmployees={allEmployees}
                setActiveTab={setActiveTab}
                onOpenScanner={() => setActiveTab('scan')}
              />
            )}

            {activeTab === 'scan' && (
              <ScanView
                currentUser={currentUser}
                allEmployees={allEmployees}
                onAttendanceRecorded={refreshData}
              />
            )}

            {activeTab === 'badge' && (
              <BadgeView
                currentUser={currentUser}
                allEmployees={allEmployees}
              />
            )}

            {activeTab === 'log' && (
              <AttendanceLogView
                records={allRecords}
                allEmployees={allEmployees}
              />
            )}

            {activeTab === 'directory' && (
              <StaffDirectoryView
                allEmployees={allEmployees}
                onSelectEmployeeForBadge={(empId) => {
                  handleSwitchUser(empId);
                  setActiveTab('badge');
                }}
                onOpenAddModal={() => handleOpenAuth('register')}
                onRefreshEmployees={refreshData}
              />
            )}

            {activeTab === 'admin' && (
              <AdminConsoleView
                allEmployees={allEmployees}
                allRecords={allRecords}
                onRefresh={refreshData}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'tests' && (
              <TestSuiteView />
            )}
          </>
        )}
      </main>

      {/* Enterprise Professional Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 py-6 text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-300">
              QR-Based Smart Attendance System for Office
            </p>
            <p className="text-[11px] text-slate-500">
              Automated Attendance Tracking, Optical Verification &amp; SQLite Ledger
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-[11px] text-slate-400">
            <span>System: <strong className="text-white font-medium">Enterprise Edition</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>Security: <strong className="text-emerald-400">ISO/IEC 18004</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono text-blue-400">
              v1.0.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
