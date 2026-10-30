import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Mail, 
  Building2, 
  KeyRound, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Employee } from '../types';
import { AttendanceService } from '../services/storage';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (employee: Employee) => void;
  onCancel?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State matching WA0017
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('IT');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');

  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!loginId.trim()) {
      setFeedback({ success: false, message: 'Please enter your Employee ID' });
      return;
    }

    const res = AttendanceService.login(loginId.trim(), loginPassword);
    if (res.success && res.employee) {
      setFeedback({ success: true, message: res.message });
      setTimeout(() => {
        onAuthSuccess(res.employee!);
      }, 300);
    } else {
      setFeedback({ success: false, message: res.message });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!regId.trim() || !regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setFeedback({ success: false, message: 'Please fill in all registration fields.' });
      return;
    }

    const res = AttendanceService.addEmployee({
      id: regId.trim().toUpperCase(),
      name: regName.trim(),
      email: regEmail.trim(),
      department: regDept.trim() || 'IT',
      password: regPassword,
      role: regRole,
      designation: regRole === 'ADMIN' ? 'System Administrator' : 'Staff Member',
    });

    if (res.success && res.employee) {
      const newEmpId = regId.trim().toUpperCase();
      const newEmpName = regName.trim();
      
      // Step 2: Directly redirect to Login page as requested
      setLoginId(newEmpId);
      setLoginPassword('');
      setMode('login');
      setFeedback({ 
        success: true, 
        message: `Registration successful for ${newEmpName} (${newEmpId})! Please enter your password to login.` 
      });

      // Reset register form inputs
      setRegId('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } else {
      setFeedback({ success: false, message: res.message });
    }
  };

  const handleQuickDemoLogin = (empId: string, defaultPass: string) => {
    setLoginId(empId);
    setLoginPassword(defaultPass);
    const res = AttendanceService.login(empId, defaultPass);
    if (res.success && res.employee) {
      onAuthSuccess(res.employee);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50 text-slate-800 rounded-3xl my-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-10 transition-all">
        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <QrCode className="w-7 h-7" />
          </div>
        </div>

        {/* Step Indicator / Mode Switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>1. Registration</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFeedback(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>2. Login</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3.5 rounded-xl mb-5 text-xs font-medium flex items-center space-x-2 ${
            feedback.success 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 1. LOGIN MODE matching WA0020 */}
        {mode === 'login' ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                QR-Based Smart Attendance System
              </h2>
              <h3 className="text-base font-semibold text-slate-600 mt-1">
                Employee Login (படி 2: உள்நுழைவு)
              </h3>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Employee ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-500/25 cursor-pointer mt-2"
              >
                Login
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFeedback(null);
                  }}
                  className="text-xs text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Don&apos;t have an account? <span className="font-semibold text-blue-600 hover:underline">Register</span>
                </button>
              </div>
            </form>

            {/* Quick 1-Click Demo Accounts for Easy Testing */}
            <div className="mt-8 pt-5 border-t border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1 mb-2.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Test Accounts</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('SP24CPU049', 'password123')}
                  className="p-2 text-left rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <strong className="block text-slate-800">Prem Kumar M</strong>
                  <span className="text-[10px] text-slate-500 font-mono">SP24CPU049 (Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADM001', 'admin123')}
                  className="p-2 text-left rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <strong className="block text-slate-800">Mrs. Rekha</strong>
                  <span className="text-[10px] text-slate-500 font-mono">ADM001 (Management)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 2. REGISTRATION MODE matching WA0017 */
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Employee Registration (படி 1: பதிவு)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter details to create account &amp; automatically generate your official scannable QR badge.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  placeholder="EMP001"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="employee@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="IT"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as 'EMPLOYEE' | 'ADMIN')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="EMPLOYEE">Standard Employee</option>
                  <option value="ADMIN">Administrator (Supervisor)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-500/25 cursor-pointer mt-2"
              >
                Register Employee
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFeedback(null);
                  }}
                  className="text-xs text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Already have an account? <span className="font-semibold text-blue-600 hover:underline">Login</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {onCancel && (
          <div className="mt-5 pt-4 border-t border-slate-200 text-center">
            <button
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center space-x-2 border border-slate-300 shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Explore All Website Modules (Dashboard, Scanner, Directory)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
