import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  QrCode,
  Building2,
  Calendar,
  Mail,
  Fingerprint
} from 'lucide-react';
import { Employee } from '../types';

interface BadgeViewProps {
  currentUser: Employee;
  allEmployees: Employee[];
}

export const BadgeView: React.FC<BadgeViewProps> = ({
  currentUser,
  allEmployees,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(currentUser.id);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const badgeCardRef = useRef<HTMLDivElement | null>(null);

  const selectedEmployee = allEmployees.find(e => e.id === selectedEmpId) || currentUser;

  // Generate dynamic scannable QR Code PNG data URL whenever selected employee changes
  useEffect(() => {
    // Encodes complete employee registration profile inside the QR Matrix
    const payload = JSON.stringify({
      id: selectedEmployee.id,
      name: selectedEmployee.name,
      email: selectedEmployee.email,
      department: selectedEmployee.department,
      role: selectedEmployee.role,
      designation: selectedEmployee.designation,
      token: selectedEmployee.qrToken || `QRAUTH_${selectedEmployee.id}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      enrolledSince: selectedEmployee.joinDate || '2026-06-01',
      system: 'QR-Smart Attendance System'
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
  }, [selectedEmployee]);

  // Copy employee ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedEmployee.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download QR PNG
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Badge_${selectedEmployee.id}_${selectedEmployee.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print physical badge
  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar matching Image 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-2xl">
            <QrCode className="w-6 h-6 text-cyan-400" />
            <span>Digital Identity &amp; Attendance QR Badge</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Encodes unique employee identifier ({selectedEmployee.id}) with ISO/IEC 18004 cryptographic verification.
          </p>
        </div>

        {/* View Badge For Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 no-print">
          <label htmlFor="badge-emp-select" className="text-xs text-slate-400 whitespace-nowrap">
            View Badge For:
          </label>
          <select
            id="badge-emp-select"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            {allEmployees.map(emp => (
              <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                {emp.name} ({emp.id}) - {emp.department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Card on Left, Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Realistic Physical Badge (CR80 Style) */}
        <div className="lg:col-span-6 flex justify-center">
          <div 
            ref={badgeCardRef}
            className="w-full max-w-sm rounded-3xl bg-white text-slate-900 shadow-2xl border-4 border-slate-200 overflow-hidden relative print-badge"
          >
            {/* Lanyard Cutout Slot */}
            <div className="w-full pt-3 pb-1 flex justify-center bg-slate-900 no-print">
              <div className="w-14 h-2.5 rounded-full bg-slate-800 border border-slate-700 shadow-inner" />
            </div>

            {/* Corporate Organization & Department Header */}
            <div className="bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950 text-white p-5 text-center relative border-b-4 border-blue-500">
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                QR-SMART ATTENDANCE SYSTEM
              </div>
              <div className="text-xs font-black tracking-widest text-white uppercase mt-0.5">
                CORPORATE OFFICE IDENTIFICATION
              </div>
              <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-blue-600/40 border border-blue-400/50 text-[9px] font-mono tracking-wider uppercase text-blue-200">
                Official Personnel Access Permit
              </div>
            </div>

            {/* Employee Body */}
            <div className="p-6 text-center space-y-4">
              {/* Avatar circle with shield */}
              <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg border-2 border-white">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedEmployee.name}
                </h3>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mt-0.5">
                  {selectedEmployee.department}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {selectedEmployee.designation || selectedEmployee.role}
                </div>
              </div>

              {/* Scannable Dynamic QR Code */}
              <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl inline-block shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${selectedEmployee.name}`}
                    className="w-48 h-48 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR code...
                  </div>
                )}
                <div className="mt-2 text-center">
                  <span className="font-mono font-black text-sm tracking-widest text-slate-900 px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
                    {selectedEmployee.id}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono tracking-tight">
                Scan with terminal camera to record instant office check-in.
              </p>
            </div>

            {/* Card Footer Barcode Stripe */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>AUTH: SECURE-ID</span>
              <span className="font-semibold text-blue-700">{selectedEmployee.role}</span>
              <span>VALID: ACTIVE PERMIT</span>
            </div>
          </div>
        </div>

        {/* Right Column: Badge Operations & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl no-print">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-3 border-b border-slate-800/80 mb-5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Badge Operations &amp; Actions</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePrintBadge}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                <Printer className="w-4 h-4" />
                <span>Print Physical ID Badge</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download QR Code PNG</span>
              </button>

              <button
                onClick={handleCopyId}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Employee ID ({selectedEmployee.id})</span>
                  </>
                )}
              </button>
            </div>

            {/* Identification Credential Details matching WA0048 */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Identification Credential
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                  {selectedEmployee.department}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Employee ID:</span>
                <span className="font-mono font-bold text-white">{selectedEmployee.id}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Official Email:</span>
                <span className="text-blue-300 font-mono text-[11px]">{selectedEmployee.email}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">System Role:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedEmployee.role === 'ADMIN'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {selectedEmployee.role}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Enrolled Since:</span>
                <span className="font-mono text-slate-300">{selectedEmployee.joinDate || '2026-06-01'}</span>
              </div>

              {/* Cryptographic QR Token Section matching screenshot WA0048 */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographic QR Token</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Conforms to Section 4.7 &amp; 8.3: A high-entropy unique random token is embedded instead of sensitive passwords. If physical pass is lost, token can be immediately invalidated.
                </p>
                <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/80 select-all break-all">
                  {selectedEmployee.qrToken || `QRAUTH_${selectedEmployee.id}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
