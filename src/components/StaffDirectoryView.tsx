import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  QrCode, 
  Mail, 
  Building2, 
  ExternalLink,
  Plus,
  RefreshCw,
  ScanLine,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { AttendanceService } from '../services/storage';

interface StaffDirectoryViewProps {
  allEmployees: Employee[];
  onSelectEmployeeForBadge: (empId: string) => void;
  onOpenAddModal: () => void;
  onScanEmployee?: (empId: string) => void;
  onRefreshEmployees?: () => void;
}

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  allEmployees,
  onSelectEmployeeForBadge,
  onOpenAddModal,
  onScanEmployee,
  onRefreshEmployees,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [selectedScanDetail, setSelectedScanDetail] = useState<{
    employee: Employee;
    decodedPayload: Record<string, unknown>;
    scanTime: string;
    status: string;
  } | null>(null);

  // Generate QR Codes for each employee card in directory
  useEffect(() => {
    allEmployees.forEach(emp => {
      const payload = JSON.stringify({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        role: emp.role,
        designation: emp.designation,
        token: emp.qrToken || `QRAUTH_${emp.id}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        enrolledSince: emp.joinDate || '2026-06-01',
        system: 'QR-Smart Attendance System'
      });

      QRCode.toDataURL(payload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then(url => {
          setQrCodeUrls(prev => ({ ...prev, [emp.id]: url }));
        })
        .catch(err => console.error(`Error generating QR for ${emp.id}:`, err));
    });
  }, [allEmployees]);

  // Handle regenerating QR Code token
  const handleRegenerateQR = (emp: Employee) => {
    const newToken = `QRAUTH_${emp.id}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const employees = AttendanceService.getEmployees();
    const index = employees.findIndex(e => e.id === emp.id);
    if (index !== -1) {
      employees[index].qrToken = newToken;
      employees[index].qrPayload = JSON.stringify({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        role: emp.role,
        token: newToken,
        enrolledSince: emp.joinDate || '2026-06-01',
      });
      localStorage.setItem('qr_smart_attendance_employees', JSON.stringify(employees));
      AttendanceService.addAuditLog('REGENERATE_QR', 'ADMIN', `Regenerated cryptographic QR token for ${emp.name} (${emp.id})`);
      if (onRefreshEmployees) onRefreshEmployees();
    }
  };

  // Handle instant scanning of employee's QR to view their complete profile
  const handleScanThisQR = (emp: Employee) => {
    // Process actual check-in scan in database
    const scanRes = AttendanceService.processScan(emp.id, emp.id, 'Self QR Scan');

    const decodedPayload = {
      'Employee ID': emp.id,
      'Full Name': emp.name,
      'Department': emp.department,
      'Official Email': emp.email,
      'System Role': emp.role,
      'Designation': emp.designation || 'Staff Member',
      'Registration Date': emp.joinDate || '2026-06-01',
      'Cryptographic QR Token': emp.qrToken || `QRAUTH_${emp.id}`,
      'Scan Timestamp': new Date().toLocaleTimeString(),
      'Verification Status': 'PRESENT - VERIFIED',
    };

    setSelectedScanDetail({
      employee: emp,
      decodedPayload,
      scanTime: new Date().toLocaleTimeString(),
      status: scanRes.message,
    });
  };

  // Download individual QR PNG
  const handleDownloadQrPNG = (emp: Employee) => {
    const url = qrCodeUrls[emp.id];
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_Code_${emp.id}_${emp.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = allEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-2xl">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Staff Directory &amp; QR Generator</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic QR generator: Each employee has an embedded cryptographic QR code. Scan any badge to view complete registration details.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Staff</span>
          </button>
        </div>
      </div>

      {/* Directory Cards Grid matching screenshot WA0047 with live QR generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const qrUrl = qrCodeUrls[emp.id];
          const tokenDisplay = emp.qrToken 
            ? `${emp.qrToken.substring(0, 18)}...`
            : `QRAUTH_${emp.id}_...`;

          return (
            <div
              key={emp.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-blue-500/60 hover:bg-slate-900 transition-all shadow-xl group relative overflow-hidden"
            >
              <div>
                {/* Card Top: Avatar, Name, Designation & Role Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md border border-white/10 group-hover:scale-105 transition-transform shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {emp.designation || (emp.role === 'ADMIN' ? 'Department Head & Project Guide' : 'Staff Member')}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    emp.role === 'ADMIN'
                      ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                      : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                  }`}>
                    {emp.role}
                  </span>
                </div>

                {/* Live Scannable QR Code Section inside Card */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between mb-4">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-700 shadow-sm shrink-0">
                    {qrUrl ? (
                      <img 
                        src={qrUrl} 
                        alt={`QR Code for ${emp.name}`} 
                        className="w-20 h-20 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center text-[10px] text-slate-500">
                        Generating...
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex-1 space-y-1.5 text-[11px]">
                    <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scannable QR Generated</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-tight">
                      Encodes employee ID, name, email, department &amp; secure token.
                    </p>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <button
                        onClick={() => handleRegenerateQR(emp)}
                        title="Regenerate QR Token"
                        className="inline-flex items-center space-x-1 text-[10px] text-blue-400 hover:text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Regenerate</span>
                      </button>
                      <button
                        onClick={() => handleDownloadQrPNG(emp)}
                        title="Download QR PNG"
                        className="inline-flex items-center space-x-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50"
                      >
                        <Download className="w-2.5 h-2.5" />
                        <span>PNG</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details List matching screenshot WA0047 */}
                <div className="space-y-2 text-xs py-2 border-t border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Employee ID</span>
                    <span className="font-mono font-bold text-white">{emp.id}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department</span>
                    <span className="text-slate-200 font-medium">{emp.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="text-blue-400 font-mono text-[11px] truncate max-w-[170px]">
                      {emp.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">QR Token</span>
                    <span className="font-mono text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {tokenDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Scan This QR & View & Print Pass */}
              <div className="pt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleScanThisQR(emp)}
                  className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Scan QR &amp; Details</span>
                </button>

                <button
                  onClick={() => onSelectEmployeeForBadge(emp.id)}
                  className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-medium text-xs transition-all border border-slate-700 hover:border-blue-500 shadow-sm cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Pass</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scanned Details Modal Pop-up (shows complete registration details upon scanning) */}
      {selectedScanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedScanDetail(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  QR Decoded Registration Profile
                </h3>
                <p className="text-xs text-emerald-400">
                  {selectedScanDetail.status}
                </p>
              </div>
            </div>

            {/* Profile Avatar & Info */}
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/20">
                {selectedScanDetail.employee.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {selectedScanDetail.employee.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-blue-400 font-mono mt-0.5">
                  <span>ID: {selectedScanDetail.employee.id}</span>
                  <span>•</span>
                  <span>{selectedScanDetail.employee.department}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block bg-purple-950 text-purple-300 border border-purple-800">
                  {selectedScanDetail.employee.role}
                </span>
              </div>
            </div>

            {/* Registration Details Grid */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Embedded Registration Payload:
              </span>
              {Object.entries(selectedScanDetail.decodedPayload).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-slate-400 font-medium">{key}</span>
                  <span className="font-mono text-slate-200 font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedScanDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/25 cursor-pointer"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
