import React, { useState } from 'react';
import { X, Utensils, Droplets, CheckCircle2, AlertCircle, Plus, Info, Scale } from 'lucide-react';
import { FeedingType, PatientRecord, WardSettings } from '../types';
import { computePatientMetrics, getExpectedFluidTargetMlKg } from '../utils/calculations';

interface FeedingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  settings: WardSettings;
  onUpdateFeeding: (patientId: string, updatedFeeding: PatientRecord['feeding'], notes?: string) => void;
}

const FEEDING_TYPES: FeedingType[] = [
  'Direct Breastfeeding (DBF)',
  'Expressed Breast Milk (EBM)',
  'Infant Formula',
  'Mixed (Breast + EBM)',
  'Mixed (Breast + Formula)',
  'IV Fluids / TPN',
];

export const FeedingDetailsModal: React.FC<FeedingDetailsModalProps> = ({
  isOpen,
  onClose,
  patient,
  settings,
  onUpdateFeeding,
}) => {
  if (!isOpen || !patient) return null;

  const [feeding, setFeeding] = useState({ ...patient.feeding });
  const [notes, setNotes] = useState(patient.clinicalNotes || '');
  const [quickFeedTime, setQuickFeedTime] = useState(settings.currentTime);
  const [quickFeedAmount, setQuickFeedAmount] = useState('35');

  const metrics = computePatientMetrics(patient, settings.currentDate, settings.currentTime);
  const targetFluid = getExpectedFluidTargetMlKg(metrics.daysOfLife);
  const currentActualMlKg = feeding.total24hVolumeMl && patient.todayWeightKg > 0
    ? Math.round(feeding.total24hVolumeMl / patient.todayWeightKg)
    : 0;

  const fluidAdequacyPercent = targetFluid > 0 ? Math.round((currentActualMlKg / targetFluid) * 100) : 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFeeding(patient.id, feeding, notes);
    onClose();
  };

  const handleQuickAddFeed = () => {
    const amount = parseFloat(quickFeedAmount) || 0;
    if (amount > 0) {
      const newTotal = (feeding.total24hVolumeMl || 0) + amount;
      const newCount = (feeding.frequencyCountPerDay || 0) + 1;
      setFeeding({
        ...feeding,
        total24hVolumeMl: newTotal,
        frequencyCountPerDay: newCount,
        frequency: `${newCount} feeds/24h`,
        volumePerFeedMl: Math.round(newTotal / newCount),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-700/80 flex items-center justify-center text-white">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Feeding & Hydration Log
                </h2>
                <span className="text-teal-200 text-xs font-mono">
                  {patient.bedNumber}
                </span>
              </div>
              <p className="text-xs text-teal-100">
                {patient.babyName} · {metrics.holFormatted} ({metrics.dolFormatted}) · Current Wt: {patient.todayWeightKg.toFixed(3)} kg
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fluid Intake & Neonatal Target Calculator Bar */}
        <div className="p-4 bg-teal-50/70 border-b border-teal-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            
            <div className="bg-white p-2.5 rounded-lg border border-teal-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Daily Fluid Target</span>
              <span className="text-base font-bold font-mono text-teal-900">
                {targetFluid} <span className="text-xs font-normal text-slate-600">mL/kg/day</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Expected target for {metrics.dolFormatted}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-teal-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Current Total Volume</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {feeding.total24hVolumeMl || 0} <span className="text-xs font-normal text-slate-600">mL/24h</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                ~{Math.round((feeding.total24hVolumeMl || 0) / (feeding.frequencyCountPerDay || 8))} mL/feed avg
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-teal-200/80 shadow-2xs">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Delivered Quota</span>
              <span className={`text-base font-bold font-mono ${currentActualMlKg < targetFluid * 0.7 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {currentActualMlKg} <span className="text-xs font-normal text-slate-600">mL/kg/day</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {fluidAdequacyPercent}% of daily target
              </span>
            </div>
          </div>
        </div>

        {/* Quick Feed Entry Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feeding Method / Route
              </label>
              <select
                value={feeding.type}
                onChange={(e) => setFeeding({ ...feeding, type: e.target.value as FeedingType })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 bg-white"
              >
                {FEEDING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feeding Frequency / Schedule
              </label>
              <input
                type="text"
                value={feeding.frequency}
                onChange={(e) => setFeeding({ ...feeding, frequency: e.target.value })}
                placeholder="e.g. q2-3h (8-10 feeds)"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feeds Count / 24h
              </label>
              <input
                type="number"
                value={feeding.frequencyCountPerDay || ''}
                onChange={(e) => {
                  const cnt = parseInt(e.target.value, 10) || 0;
                  setFeeding({
                    ...feeding,
                    frequencyCountPerDay: cnt,
                    total24hVolumeMl: (feeding.volumePerFeedMl || 0) * cnt || feeding.total24hVolumeMl,
                  });
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Volume Consumed per Feed (mL)
              </label>
              <input
                type="number"
                value={feeding.volumePerFeedMl || ''}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value) || 0;
                  setFeeding({
                    ...feeding,
                    volumePerFeedMl: vol,
                    total24hVolumeMl: vol * (feeding.frequencyCountPerDay || 8),
                  });
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total 24h Volume Consumed (mL)
              </label>
              <input
                type="number"
                value={feeding.total24hVolumeMl || ''}
                onChange={(e) => setFeeding({ ...feeding, total24hVolumeMl: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono font-bold text-teal-900"
              />
            </div>
          </div>

          {/* Quick Increment Feed Tool */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Quick Feed Session Logger:
            </span>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <input
                type="time"
                value={quickFeedTime}
                onChange={(e) => setQuickFeedTime(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-mono"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={quickFeedAmount}
                  onChange={(e) => setQuickFeedAmount(e.target.value)}
                  placeholder="mL"
                  className="w-16 px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-mono text-center"
                />
                <span className="text-slate-500">mL</span>
              </div>
              <button
                type="button"
                onClick={handleQuickAddFeed}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Log Feed</span>
              </button>
            </div>
          </div>

          {/* Hydration Outputs */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Hydration & Excretion Markers (24h)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wet Diapers Count
                </label>
                <input
                  type="number"
                  value={feeding.wetDiapers}
                  onChange={(e) => setFeeding({ ...feeding, wetDiapers: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Reassuring: &ge;4 on Day 2, &ge;6 from Day 4+
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stools Count
                </label>
                <input
                  type="number"
                  value={feeding.stools}
                  onChange={(e) => setFeeding({ ...feeding, stools: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stool Consistency / Color
                </label>
                <input
                  type="text"
                  value={feeding.stoolColor || ''}
                  onChange={(e) => setFeeding({ ...feeding, stoolColor: e.target.value })}
                  placeholder="e.g. Transitional yellow, Meconium"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Feeding Tolerance & Observations
            </label>
            <textarea
              rows={2}
              value={feeding.toleranceNotes || ''}
              onChange={(e) => setFeeding({ ...feeding, toleranceNotes: e.target.value })}
              placeholder="e.g. Sucking eagerly, satisfied for 2-3 hours after feeding, no regurgitation."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Update Feeding Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
