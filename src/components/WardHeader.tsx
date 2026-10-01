import React from 'react';
import { 
  Baby, 
  Printer, 
  Plus, 
  Download, 
  Calculator, 
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { WardSettings, PatientRecord } from '../types';
import { computePatientMetrics } from '../utils/calculations';

interface WardHeaderProps {
  settings: WardSettings;
  onUpdateSettings: (settings: WardSettings) => void;
  patients: PatientRecord[];
  onAddPatient: () => void;
  onOpenCalculator: () => void;
  onOpenPhotoComparison: () => void;
  onResetData: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
}

export const WardHeader: React.FC<WardHeaderProps> = ({
  settings,
  onUpdateSettings,
  patients,
  onAddPatient,
  onOpenCalculator,
  onOpenPhotoComparison,
  onResetData,
  onPrint,
  onExportCSV,
}) => {
  // Aggregate stats
  const metrics = patients.map((p) =>
    computePatientMetrics(p, settings.currentDate, settings.currentTime)
  );

  const totalPatients = patients.length;
  const criticalWeightLossCount = metrics.filter((m) => m.isWeightLossCritical).length;
  const alertWeightLossCount = metrics.filter((m) => m.isWeightLossAlert).length;
  const bloodIncompatibilityCount = metrics.filter((m) => m.aboIncompatibilityRisk || m.rhRisk).length;
  const exclusiveBfCount = patients.filter((p) => p.feeding.type.includes('Breast')).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Bar Zone: Hospital, Ward Name, Date, Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Postnatal Monitoring Chart
                </h1>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">·</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm">
                  {settings.wardName}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{settings.hospitalName}</span>
                <span>·</span>
                <span className="text-teal-700 font-medium">Ward Round Shift: {settings.shift}</span>
              </p>
            </div>
          </div>

          {/* Monitoring Date & Time Settings Controls */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="monitoring-date" className="font-medium text-slate-500">Date:</label>
              <input
                id="monitoring-date"
                type="date"
                value={settings.currentDate}
                onChange={(e) => onUpdateSettings({ ...settings, currentDate: e.target.value })}
                className="bg-transparent text-slate-900 font-semibold focus:outline-hidden text-xs cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="monitoring-time" className="font-medium text-slate-500">Time:</label>
              <input
                id="monitoring-time"
                type="time"
                value={settings.currentTime}
                onChange={(e) => onUpdateSettings({ ...settings, currentTime: e.target.value })}
                className="bg-transparent text-slate-900 font-semibold focus:outline-hidden text-xs cursor-pointer"
              />
            </div>

            <select
              aria-label="Ward Shift"
              value={settings.shift}
              onChange={(e) => onUpdateSettings({ ...settings, shift: e.target.value as any })}
              className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="Morning">Morning Shift (08:00 - 14:00)</option>
              <option value="Evening">Evening Shift (14:00 - 20:00)</option>
              <option value="Night">Night Shift (20:00 - 08:00)</option>
            </select>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenPhotoComparison}
              title="Compare with Original Handwritten Paper Chart"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Original Paper</span> Chart
            </button>

            <button
              onClick={onOpenCalculator}
              title="Neonatal Clinical Age & Weight Calculator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculators</span>
            </button>

            <button
              onClick={onPrint}
              title="Print Professional A4 Ward Round Sheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Export monitoring data to CSV spreadsheet"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={onAddPatient}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Baby</span>
            </button>
          </div>
        </div>

        {/* Clinical Quick Ticker / Stat Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 flex-wrap text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Total Monitored: <strong className="text-slate-900 font-bold">{totalPatients} babies</strong>
            </span>

            {criticalWeightLossCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Critical Weight Loss (&gt;10%): {criticalWeightLossCount} baby
              </span>
            )}

            {alertWeightLossCount > 0 && (
              <span className="flex items-center gap-1.5 text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Excessive Weight Loss (7-10%): {alertWeightLossCount} babies
              </span>
            )}

            {bloodIncompatibilityCount > 0 && (
              <span className="flex items-center gap-1.5 text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                ABO/Rh Watch: {bloodIncompatibilityCount} babies
              </span>
            )}

            <span className="text-slate-500 hidden md:inline">
              Breastfeeding Rate: <strong className="text-slate-800">{Math.round((exclusiveBfCount / (totalPatients || 1)) * 100)}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="hidden lg:inline text-slate-400">
              Doctor: <span className="text-slate-700 font-medium">{settings.doctorInCharge}</span>
            </span>
            <button
              onClick={onResetData}
              title="Reset table with original handwritten chart data"
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
