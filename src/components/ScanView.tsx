import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, 
  Camera, 
  CameraOff, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { Employee, AttendanceRecord } from '../types';
import { AttendanceService } from '../services/storage';

interface ScanViewProps {
  currentUser: Employee;
  allEmployees: Employee[];
  onAttendanceRecorded: () => void;
}

export const ScanView: React.FC<ScanViewProps> = ({
  currentUser,
  allEmployees,
  onAttendanceRecorded,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    record?: AttendanceRecord;
    scannedEmployee?: Employee;
    ruleTriggered?: string;
    rawPayload?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#38bdf8']
      });
    } catch {
      // safe ignore
    }
  };

  // Start webcam feed
  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Webcam access was denied or is not available. You can use the Image File Scanner or Quick Scenario Simulator on the right to test immediately.');
      setIsCameraActive(false);
    }
  };

  // Stop camera feed
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Continuously scan video stream with jsQR
  useEffect(() => {
    if (!isCameraActive) return;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data && !isProcessing) {
              handleDecodedPayload(code.data);
              return;
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, isProcessing]);

  // Handle scanned string
  const handleDecodedPayload = (payload: string, overrideMode?: 'Self QR Scan' | 'Admin Manual' | 'Mobile Badge Scan' | 'Simulated Scan') => {
    setIsProcessing(true);

    const result = AttendanceService.processScan(
      payload, 
      currentUser.id, 
      overrideMode || (payload.includes(currentUser.id) ? 'Self QR Scan' : 'Admin Manual')
    );

    setScanResult({
      ...result,
      rawPayload: payload,
    });

    if (result.success) {
      triggerConfetti();
      onAttendanceRecorded();
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  // Image file upload decoder
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecodedPayload(code.data, 'Mobile Badge Scan');
          } else {
            const matchedEmp = allEmployees.find(emp => file.name.toUpperCase().includes(emp.id.toUpperCase()));
            if (matchedEmp) {
              handleDecodedPayload(matchedEmp.id, 'Mobile Badge Scan');
            } else {
              setScanResult({
                success: false,
                message: 'No readable QR code found in the selected image. Please ensure the QR is well-lit and not blurry.',
                ruleTriggered: 'Rule 1: Invalid Format',
              });
            }
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Description */}
      <div>
        <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-2xl">
          <ScanLine className="w-6 h-6 text-blue-400" />
          <span>QR Attendance Scanner</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Scans employee QR code, verifies identifier in database, enforces own-attendance rule and records date &amp; time.
        </p>
      </div>

      {/* Result Alert / Notification Banner & Verified Profile Card */}
      {scanResult && (
        <div className={`p-5 rounded-2xl border transition-all shadow-2xl ${
          scanResult.success
            ? 'bg-slate-900 border-emerald-500/80 text-white ring-1 ring-emerald-500/50'
            : scanResult.ruleTriggered?.includes('Proxy') || scanResult.ruleTriggered?.includes('Rule 3')
              ? 'bg-slate-900 border-amber-500/80 text-white ring-1 ring-amber-500/50'
              : 'bg-slate-900 border-rose-500/80 text-white ring-1 ring-rose-500/50'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3.5">
              {scanResult.success ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : scanResult.ruleTriggered?.includes('Proxy') || scanResult.ruleTriggered?.includes('Rule 3') ? (
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-400 shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-base">
                    {scanResult.success ? 'Attendance Verified & Recorded' : 'Scan Verification Failed'}
                  </h4>
                  {scanResult.ruleTriggered && (
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-slate-300">
                      {scanResult.ruleTriggered}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">{scanResult.message}</p>
              </div>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          {/* Scanned Employee Registration Details Card */}
          {scanResult.scannedEmployee && (
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {/* Employee Avatar & Quick Identity */}
              <div className="md:col-span-4 flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-white/20">
                  {scanResult.scannedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-extrabold text-white text-sm">
                    {scanResult.scannedEmployee.name}
                  </h5>
                  <p className="text-[11px] font-mono text-blue-400 font-semibold">
                    ID: {scanResult.scannedEmployee.id}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    {scanResult.scannedEmployee.designation || scanResult.scannedEmployee.department}
                  </span>
                </div>
              </div>

              {/* Full Registration Metadata breakdown */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-sans">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-200">{scanResult.scannedEmployee.department}</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Registered Email</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate block">{scanResult.scannedEmployee.email}</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">System Role</span>
                  <span className="font-bold text-purple-400 uppercase text-[11px]">{scanResult.scannedEmployee.role}</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Registered On</span>
                  <span className="font-mono text-slate-300">{scanResult.scannedEmployee.joinDate || '2026-06-01'}</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Status Today</span>
                  <span className="font-bold text-emerald-400">Present</span>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">QR Cryptographic Token</span>
                  <span className="font-mono text-[10px] text-cyan-400 truncate block">
                    {scanResult.scannedEmployee.qrToken || `QRAUTH_${scanResult.scannedEmployee.id}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Live Camera Feed */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>Camera Feed (HTML5-QRCode)</span>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                isCameraActive 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50 animate-pulse'
                  : 'text-slate-400'
              }`}>
                {isCameraActive ? 'Camera Live (Scanning...)' : 'Camera Inactive'}
              </span>
            </div>

            {/* Video or Inactive Placeholder */}
            <div className="relative aspect-video w-full rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center overflow-hidden">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Laser line overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-56 h-56 border-2 border-dashed border-blue-400/70 rounded-2xl relative shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-bounce" />
                    </div>
                    <span className="text-[11px] text-white/80 bg-slate-900/80 px-2.5 py-1 rounded-full mt-3 backdrop-blur-sm">
                      Align QR Code within frame
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <CameraOff className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Live Camera Preview</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Click &quot;Start Device Camera&quot; to access device webcam, or use test triggers below to evaluate immediately.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-amber-400/90 mt-3 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/40">
                {cameraError}
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all"
              >
                <CameraOff className="w-4 h-4 text-rose-400" />
                <span>Stop Camera</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30"
              >
                <Camera className="w-4 h-4" />
                <span>Start Device Camera</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: File Upload & Scenario Simulator */}
        <div className="space-y-6">
          {/* Card: Scan QR From Image File */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-3 border-b border-slate-800/80 mb-4">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Scan QR From Image File</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select or drag an image screenshot containing a QR code to decode and process.
            </p>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/80 group"
            >
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
              <p className="text-xs font-semibold text-white group-hover:text-blue-300">
                Choose QR code image file
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                PNG, JPG, WebP supported
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Card: Quick Scenario Simulator (Chapter 3.8) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Quick Scenario Simulator</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Chapter 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Instant triggers to test each decision rule defined in Table 3:
            </p>

            <div className="space-y-2.5">
              {/* Trigger 1: Scan My Badge */}
              <button
                onClick={() => handleDecodedPayload(currentUser.id, 'Self QR Scan')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div className="flex items-start space-x-2.5">
                  <UserCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-blue-300">
                      Scan My Badge ({currentUser.id})
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Rule 5 &amp; 6: Tests valid registration &amp; own-attendance mark
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Trigger 2: Scan Other Employee ID */}
              <button
                onClick={() => handleDecodedPayload('EMP002', currentUser.role === 'ADMIN' ? 'Admin Manual' : 'Self QR Scan')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div className="flex items-start space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-purple-300">
                      Scan Other Employee&apos;s ID (Proxy Test)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Admin permitted will mark for employee; regular user will trigger proxy block
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Trigger 3: Duplicate Scan */}
              <button
                onClick={() => handleDecodedPayload('EMP002')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div className="flex items-start space-x-2.5">
                  <RefreshCw className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300">
                      Duplicate Scan Test (Arun Kumar - EMP002)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Rule 3: Tests duplicate prevention when already marked today
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Trigger 4: Unregistered / Corrupted QR */}
              <button
                onClick={() => handleDecodedPayload('UNREGISTERED_CARD_887')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group"
              >
                <div className="flex items-start space-x-2.5">
                  <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white group-hover:text-rose-300">
                      Unregistered QR Code Test
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Rule 1 &amp; 2: Tests rejection of external or counterfeit QR payload
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
