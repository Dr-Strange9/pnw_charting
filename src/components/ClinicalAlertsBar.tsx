import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Droplets, Info } from 'lucide-react';
import { PatientRecord, WardSettings } from '../types';
import { computePatientMetrics } from '../utils/calculations';

interface ClinicalAlertsBarProps {
  patients: PatientRecord[];
  settings: WardSettings;
  onSelectPatient: (patient: PatientRecord) => void;
}

export const ClinicalAlertsBar: React.FC<ClinicalAlertsBarProps> = ({
  patients,
  settings,
  onSelectPatient,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const alertedPatients = patients
    .map((patient) => ({
      patient,
      metrics: computePatientMetrics(patient, settings.currentDate, settings.currentTime),
    }))
    .filter(
      ({ metrics }) =>
        metrics.isWeightLossCritical ||
        metrics.isWeightLossAlert ||
        metrics.aboIncompatibilityRisk ||
        metrics.rhRisk
    );

  if (alertedPatients.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 no-print">
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 sm:p-4 text-xs shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Clinical Attention & Monitoring Alerts ({alertedPatients.length})</span>
            <span className="text-xs font-normal text-amber-700 hidden sm:inline">
              — Identified based on neonatal weight loss thresholds and hemolytic risk
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>{isOpen ? 'Collapse' : 'View Alerts'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-amber-200/70">
            {alertedPatients.map(({ patient, metrics }) => {
              const isCrit = metrics.isWeightLossCritical;
              const isAlert = metrics.isWeightLossAlert;

              return (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  className={`p-2.5 rounded-md border transition-all cursor-pointer hover:shadow-xs ${
                    isCrit
                      ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                      : isAlert
                      ? 'bg-amber-100/60 border-amber-300 text-amber-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="font-bold text-sm block">
                        {patient.babyName}{' '}
                        <span className="text-xs font-normal text-slate-600">({patient.bedNumber})</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {metrics.holFormatted} · {metrics.dolFormatted}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      {isCrit ? (
                        <span className="inline-block px-1.5 py-0.5 bg-rose-600 text-white font-bold rounded text-[11px] tabular-nums">
                          {metrics.cumulativePercentChange.toFixed(2)}%
                        </span>
                      ) : isAlert ? (
                        <span className="inline-block px-1.5 py-0.5 bg-amber-600 text-white font-bold rounded text-[11px] tabular-nums">
                          {metrics.cumulativePercentChange.toFixed(2)}%
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-col gap-1 text-[11px]">
                    {isCrit && (
                      <span className="font-semibold text-rose-700 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Critical Weight Loss nadir &gt; 10% (loss: {metrics.dailyWeightDiffFormatted})
                      </span>
                    )}

                    {isAlert && (
                      <span className="font-medium text-amber-800">
                        Weight drop &gt; 7% from birth weight (B.wt: {patient.birthWeightKg.toFixed(3)}kg)
                      </span>
                    )}

                    {metrics.aboIncompatibilityRisk && (
                      <span className="text-indigo-800 font-medium flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-indigo-600" />
                        ABO Risk: Mother {patient.maternalBloodGroup} / Baby {patient.babyBloodGroup}
                      </span>
                    )}

                    <div className="text-slate-600 truncate mt-0.5">
                      Feed: {patient.feeding.type} ({patient.feeding.frequency})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
