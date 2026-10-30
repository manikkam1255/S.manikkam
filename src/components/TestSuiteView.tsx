import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Play, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { TestCase } from '../types';
import { AttendanceService } from '../services/storage';

export const TestSuiteView: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number | null>(null);

  useEffect(() => {
    setTestCases(AttendanceService.getTestCases());
  }, []);

  const totalScenarios = testCases.length;
  const passedCount = testCases.filter(t => t.status === 'PASSED').length;
  const failedCount = testCases.filter(t => t.status === 'FAILED').length;
  const pendingCount = testCases.filter(t => t.status === 'PENDING').length;

  // Run single test
  const handleRunSingle = async (tcId: string) => {
    const updated = AttendanceService.runSingleTest(tcId);
    setTestCases(AttendanceService.getTestCases());
  };

  // Run all 17 test cases with sequential live animation
  const handleRunAll = async () => {
    setIsRunningAll(true);
    const tests = AttendanceService.getTestCases();

    for (let i = 0; i < tests.length; i++) {
      setCurrentRunningIndex(i);
      // Brief delay for visual test evaluation
      await new Promise(r => setTimeout(r, 120));
      AttendanceService.runSingleTest(tests[i].id);
      setTestCases(AttendanceService.getTestCases());
    }

    setCurrentRunningIndex(null);
    setIsRunningAll(false);
  };

  const handleResetTests = () => {
    const reset = testCases.map(t => ({
      ...t,
      status: 'PENDING' as const,
      actualResult: '[Awaiting test execution...]',
      executionTimeMs: undefined,
    }));
    AttendanceService.saveTestCases(reset);
    setTestCases(reset);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl sm:text-2xl">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>System Test Suite &amp; Verification Matrix</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live execution of functional and security test cases (TC-01 through TC-17) on the running codebase.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3 no-print">
          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Tests ({currentRunningIndex! + 1}/17)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute All 17 Test Cases</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Test Report</span>
          </button>

          <button
            onClick={handleResetTests}
            title="Reset Test Results"
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Scenarios
          </span>
          <div className="text-3xl font-black text-white mt-1">
            {totalScenarios}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive Test Plan
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Passed
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-1">
            {passedCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified on running build
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
            Failed
          </span>
          <div className="text-3xl font-black text-rose-400 mt-1">
            {failedCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Defects detected
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Pending Execution
          </span>
          <div className="text-3xl font-black text-slate-300 mt-1">
            {pendingCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Awaiting verification
          </p>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="rounded-2xl bg-amber-950/30 border border-amber-600/40 p-4 text-xs text-amber-200/90 shadow-md">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-300">
              Operational Quality &amp; Verification Protocol:
            </h4>
            <p className="text-slate-300 leading-relaxed">
              The Actual Result column is dynamically populated upon test execution against the active database state and security rule engine. A test is only marked as PASSED once verified on the running application.
            </p>
          </div>
        </div>
      </div>

      {/* Table 13 matching Image 2 */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Test Scenario</th>
                <th className="py-3.5 px-4">Expected Result</th>
                <th className="py-3.5 px-4">Actual Result (Verified)</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {testCases.map((tc, idx) => (
                <tr 
                  key={tc.id} 
                  className={`transition-colors ${
                    currentRunningIndex === idx 
                      ? 'bg-blue-950/40' 
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {tc.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs">
                    {tc.scenario}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                    {tc.expectedResult}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] max-w-sm">
                    {tc.status === 'PASSED' ? (
                      <span className="text-emerald-300">
                        {tc.actualResult}
                        {tc.executionTimeMs && (
                          <span className="text-slate-500 ml-1.5 font-sans text-[10px]">
                            ({tc.executionTimeMs}ms)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">
                        {tc.actualResult}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      {tc.status === 'PASSED' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASSED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          <span>PENDING</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleRunSingle(tc.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors no-print"
                        title="Execute Test"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Table 13: Functional Test Suite Execution Matrix</span>
          <span className="font-semibold text-emerald-400">
            Pass Rate: {totalScenarios > 0 ? Math.round((passedCount / totalScenarios) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};
