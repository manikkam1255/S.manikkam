import React, { useState } from 'react';
import { 
  QrCode, 
  LayoutDashboard, 
  ScanLine, 
  IdCard, 
  Clock, 
  ShieldCheck, 
  CheckSquare, 
  ChevronDown, 
  Users,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { ActiveTab, Employee } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: Employee;
  allEmployees: Employee[];
  isLoggedIn: boolean;
  onSwitchUser: (userId: string) => void;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allEmployees,
  isLoggedIn,
  onSwitchUser,
  onLogout,
  onOpenAuth,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0b1120]/95 backdrop-blur-md shadow-lg no-print">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding matching WA0047 */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/40 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0b1120]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  Smart Attendance
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-blue-950 text-blue-300 border border-blue-700/60 shadow-sm">
                  V1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                QR Verification &amp; Office Automation System
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <span>QR Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('badge')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'badge'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <IdCard className="w-4 h-4 text-cyan-400" />
              <span>ID Badges</span>
            </button>

            <button
              onClick={() => setActiveTab('log')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'log'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Attendance Log</span>
            </button>

            {/* Staff Directory Tab matching screenshot WA0047 */}
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'directory'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Staff Directory</span>
            </button>

            {/* Admin Console Pill */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold ring-1 ring-purple-400'
                  : 'text-slate-300 hover:text-purple-300 hover:bg-purple-950/30 border border-purple-900/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Admin Console</span>
            </button>

            {/* Test Suite Button (TC 1-17) */}
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tests'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-semibold ring-1 ring-amber-400'
                  : 'text-amber-300 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-600/50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Test Suite (TC 1-17)</span>
            </button>
          </nav>

          {/* User Profile Area & Authentication Actions */}
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-3 bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 rounded-xl px-3 py-1.5 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-white group-hover:text-blue-300">
                          {currentUser.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          currentUser.role === 'ADMIN' 
                            ? 'bg-purple-900/80 text-purple-300 border border-purple-700/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">
                        {currentUser.id}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                  </button>

                  {/* Direct Logout Button */}
                  <button
                    onClick={onLogout}
                    title="Sign Out / Switch Account"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Dropdown for role & user simulation */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Active Account
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Test login as another employee or administrator:
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {allEmployees.map(emp => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            onSwitchUser(emp.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                            emp.id === currentUser.id 
                              ? 'bg-blue-600/20 text-blue-300 font-semibold' 
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2 text-left">
                            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-white">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-white">{emp.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{emp.id} • {emp.department}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                            emp.role === 'ADMIN' ? 'bg-purple-950 text-purple-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {emp.role}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="px-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="text-rose-400 hover:underline flex items-center space-x-1"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Log Out</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenAuth('register');
                          setShowUserDropdown(false);
                        }}
                        className="text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Register New</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/25"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
                >
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="xl:hidden flex items-center space-x-1 overflow-x-auto pb-3 pt-1 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'scan' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            QR Scanner
          </button>
          <button
            onClick={() => setActiveTab('badge')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'badge' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            ID Badges
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'log' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Attendance Log
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'directory' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Staff Directory
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-300 bg-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              activeTab === 'tests' ? 'bg-amber-600 text-white' : 'text-amber-400 bg-amber-950/40'
            }`}
          >
            Test Suite (17)
          </button>
        </div>
      </div>
    </header>
  );
};
