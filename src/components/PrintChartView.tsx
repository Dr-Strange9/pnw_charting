import React from 'react';
import { PatientRecord, WardSettings } from '../types';
import { computePatientMetrics } from '../utils/calculations';

interface PrintChartViewProps {
  patients: PatientRecord[];
  settings: WardSettings;
}

export const PrintChartView: React.FC<PrintChartViewProps> = ({ patients, settings }) => {
  return (
    <div className="print-only p-4 bg-white text-black font-sans text-xs">
      
      {/* Hospital & Ward Header */}
      <div className="border-b-2 border-black pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold uppercase tracking-wide">
              {settings.hospitalName}
            </h1>
            <h2 className="text-sm font-semibold">
              POSTNATAL WARD & NEONATAL MONITORING ROUND SHEET
            </h2>
          </div>
          <div className="text-right text-[11px] font-mono">
            <div><strong>Date:</strong> {new Date(settings.currentDate).toLocaleDateString('en-GB')}</div>
            <div><strong>Shift:</strong> {settings.shift} ({settings.currentTime})</div>
            <div><strong>Ward:</strong> {settings.wardName}</div>
          </div>
        </div>
      </div>

      {/* Main Print Table */}
      <table className="w-full border-collapse border border-black text-[10px]">
        <thead>
          <tr className="bg-slate-200 text-black font-bold border-b border-black">
            <th className="border border-black p-1 text-center w-8">#</th>
            <th className="border border-black p-1 text-left">Bed / Baby Name</th>
            <th className="border border-black p-1 text-center">DOB / TOB</th>
            <th className="border border-black p-1 text-center">MBG / BBG</th>
            <th className="border border-black p-1 text-center">HOL / DOL</th>
            <th className="border border-black p-1 text-right">B.wt (kg)</th>
            <th className="border border-black p-1 text-right">Y.wt (kg)</th>
            <th className="border border-black p-1 text-right">T.wt (kg)</th>
            <th className="border border-black p-1 text-center">↑ / ↓ (g)</th>
            <th className="border border-black p-1 text-right">% Change</th>
            <th className="border border-black p-1 text-left">Daily Feeding & Volumes</th>
            <th className="border border-black p-1 text-left">Clinical Remarks & Plan</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, idx) => {
            const metrics = computePatientMetrics(patient, settings.currentDate, settings.currentTime);
            const diffGrams = metrics.dailyWeightDiffGrams;

            return (
              <tr key={patient.id} className="border-b border-black">
                <td className="border border-black p-1 text-center font-mono">
                  {idx + 1}
                </td>
                <td className="border border-black p-1">
                  <strong>{patient.babyName}</strong>
                  <div className="text-[9px] text-slate-700">
                    {patient.bedNumber} {patient.motherName ? `· M: ${patient.motherName}` : ''}
                  </div>
                </td>
                <td className="border border-black p-1 text-center font-mono whitespace-nowrap">
                  <div>
                    {new Date(patient.birthDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                  </div>
                  <div className="text-[9px]">@{patient.birthTime}</div>
                </td>
                <td className="border border-black p-1 text-center font-mono whitespace-nowrap">
                  <div>{patient.maternalBloodGroup} / {patient.babyBloodGroup}</div>
                  {metrics.aboIncompatibilityRisk && (
                    <span className="font-bold text-[8px] block">[ABO Watch]</span>
                  )}
                </td>
                <td className="border border-black p-1 text-center font-mono whitespace-nowrap">
                  <strong>{metrics.hoursOfLife <= 72 ? metrics.holFormatted : metrics.dolFormatted}</strong>
                  <div className="text-[9px] text-slate-700">
                    {metrics.hoursOfLife <= 72 ? metrics.dolFormatted : metrics.holFormatted}
                  </div>
                </td>
                <td className="border border-black p-1 text-right font-mono">
                  {patient.birthWeightKg.toFixed(3)}
                </td>
                <td className="border border-black p-1 text-right font-mono">
                  {patient.yesterdayWeightKg ? patient.yesterdayWeightKg.toFixed(3) : '—'}
                </td>
                <td className="border border-black p-1 text-right font-mono font-bold">
                  {patient.todayWeightKg.toFixed(3)}
                </td>
                <td className="border border-black p-1 text-center font-mono">
                  {diffGrams === null ? '—' : diffGrams > 0 ? `+${diffGrams}g ↑` : diffGrams < 0 ? `${Math.abs(diffGrams)}g ↓` : '0g'}
                </td>
                <td className="border border-black p-1 text-right font-mono font-bold">
                  {metrics.cumulativePercentChange > 0 ? '+' : ''}{metrics.cumulativePercentChange.toFixed(2)}%
                </td>
                <td className="border border-black p-1">
                  <div><strong>{patient.feeding.type}</strong></div>
                  <div className="text-[9px]">
                    {patient.feeding.frequency} · {patient.feeding.total24hVolumeMl ? `${patient.feeding.total24hVolumeMl} mL/d` : ''}
                    {metrics.actualFluidMlKg ? ` (${metrics.actualFluidMlKg} mL/kg)` : ''}
                  </div>
                  <div className="text-[9px]">
                    Wet: {patient.feeding.wetDiapers} · Stool: {patient.feeding.stools} ({patient.feeding.stoolColor || 'Normal'})
                  </div>
                </td>
                <td className="border border-black p-1 text-[9px]">
                  {patient.clinicalNotes || (metrics.isWeightLossCritical ? 'Review feed volume & hydration.' : 'Stable.')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Sign-off Boxes for Clinical Rounds */}
      <div className="mt-8 pt-4 border-t border-black flex justify-between items-end text-xs">
        <div className="w-64 border-t border-dashed border-black pt-1 text-center">
          <strong>Staff Nurse / Ward In-Charge</strong>
          <div className="text-[10px] text-slate-600">{settings.nurseInCharge}</div>
        </div>
        <div className="w-64 border-t border-dashed border-black pt-1 text-center">
          <strong>Resident / Medical Officer</strong>
          <div className="text-[10px] text-slate-600">Date & Stamp</div>
        </div>
        <div className="w-64 border-t border-dashed border-black pt-1 text-center">
          <strong>Consultant Neonatologist / Pediatrician</strong>
          <div className="text-[10px] text-slate-600">{settings.doctorInCharge}</div>
        </div>
      </div>
    </div>
  );
};
