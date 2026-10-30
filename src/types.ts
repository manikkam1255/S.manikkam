export type Role = 'ADMIN' | 'EMPLOYEE';

export interface Employee {
  id: string; // e.g. SP24CPU049, EMP001, ADM001
  name: string;
  email: string;
  department: string;
  role: Role;
  designation?: string;
  password?: string;
  joinDate?: string;
  qrPayload?: string;
  qrToken?: string; // High-entropy cryptographic token, e.g. QRAUTH_SP24CPU049_...
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent';
export type VerificationMode = 'Self QR Scan' | 'Admin Manual' | 'Mobile Badge Scan' | 'Simulated Scan';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: AttendanceStatus;
  verificationMode: VerificationMode;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export type TestStatus = 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';

export interface TestCase {
  id: string; // TC-01, TC-02, ...
  scenario: string;
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  category: 'AUTH' | 'REGISTRATION' | 'QR_GENERATION' | 'ATTENDANCE_LOGIC' | 'ADMIN_SECURITY' | 'REPORTS';
  executionTimeMs?: number;
}

export interface DecisionRule {
  ruleId: string;
  name: string;
  condition: string;
  systemAction: string;
  securityImpact: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'scan'
  | 'badge'
  | 'log'
  | 'directory'
  | 'admin'
  | 'tests';
