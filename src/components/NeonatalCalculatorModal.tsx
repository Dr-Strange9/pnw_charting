import React, { useState } from 'react';
import { X, Calculator, Scale, Droplet, Clock, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { calculateAge, getExpectedFluidTargetMlKg } from '../utils/calculations';

interface NeonatalCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  currentTime: string;
}

export const NeonatalCalculatorModal: React.FC<NeonatalCalculatorModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  currentTime,
}) => {
  if (!isOpen) return null;

  // Age calc state
  const [calcDob, setCalcDob] = useState(currentDate);
  const [calcTob, setCalcTob] = useState('06:00');
  const [evalDate, setEvalDate] = useState(currentDate);
  const [evalTime, setEvalTime] = useState(currentTime);

  // Weight calc state
  const [calcBwt, setCalcBwt] = useState('3.000');
  const [calcYwt, setCalcYwt] = useState('2.900');
  const [calcTwt, setCalcTwt] = useState('2.820');

  // Fluid state
  const [fluidDol, setFluidDol] = useState(3);
  const [fluidWeight, setFluidWeight] = useState('2.820');

  // Derived age
  const ageResult = calculateAge(calcDob, calcTob, evalDate, evalTime);

  // Derived weight
  const bwt = parseFloat(calcBwt) || 0;
  const ywt = parseFloat(calcYwt) || 0;
  const twt = parseFloat(calcTwt) || 0;

  const dailyDiffGrams = ywt > 0 && twt > 0 ? Math.round((twt - ywt) * 1000) : null;
  const dailyPercent = ywt > 0 && twt > 0 ? ((twt - ywt) / ywt) * 100 : null;
  const cumPercent = bwt > 0 && twt > 0 ? ((twt - bwt) / bwt) * 100 : 0;

  const isCritLoss = cumPercent <= -10;
  const isAlertLoss = cumPercent <= -7 && cumPercent > -10;

  // Derived fluids
  const targetMlKg = getExpectedFluidTargetMlKg(fluidDol);
  const fWeight = parseFloat(fluidWeight) || 0;
  const totalFluidMl = Math.round(targetMlKg * fWeight);
  const mlPerFeed8 = Math.round(totalFluidMl / 8);
  const mlPerFeed12 = Math.round(totalFluidMl / 12);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Neonatal Clinical Age & Weight Calculator
              </h2>
              <p className="text-xs text-slate-400">
                Evidence-based calculations for Hours of Life (HOL), Days of Life (DOL), and Weight Nadir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Age (HOL / DOL) Calculator */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>1. Hours of Life (HOL) & Days of Life (DOL) Calculator</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={calcDob}
                  onChange={(e) => setCalcDob(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Time of Birth</label>
                <input
                  type="time"
                  value={calcTob}
                  onChange={(e) => setCalcTob(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Date</label>
                <input
                  type="date"
                  value={evalDate}
                  onChange={(e) => setEvalDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Assessment Time</label>
                <input
                  type="time"
                  value={evalTime}
                  onChange={(e) => setEvalTime(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>
            </div>

            <div className="mt-3 p-3 bg-white border border-teal-200/80 rounded-md flex items-center justify-around flex-wrap gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Hours of Life</span>
                <span className="text-xl font-bold font-mono text-teal-800">{ageResult.holFormatted}</span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[11px] text-slate-500 block">Days of Life</span>
                <span className="text-xl font-bold font-mono text-teal-800">{ageResult.dolFormatted}</span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span className="text-[11px] text-slate-500 block">Clinical Phase</span>
                <span className="text-xs font-bold text-slate-700">
                  {ageResult.hol <= 24 ? 'Immediate Transition (Day 1)' : ageResult.hol <= 72 ? 'Early Neonatal / Physiological Nadir' : 'Established Feeding Phase'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Weight Gain/Loss & Percentage Change */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-teal-600" />
              <span>2. Daily Weight Change & Cumulative Loss/Gain Evaluation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Birth Weight - B.wt (kg)</label>
                <input
                  type="number"
                  step="0.005"
                  value={calcBwt}
                  onChange={(e) => setCalcBwt(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Yesterday Weight - Y.wt (kg)</label>
                <input
                  type="number"
                  step="0.005"
                  value={calcYwt}
                  onChange={(e) => setCalcYwt(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Today's Weight - T.wt (kg)</label>
                <input
                  type="number"
                  step="0.005"
                  value={calcTwt}
                  onChange={(e) => setCalcTwt(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Daily Diff (grams)</span>
                <span className={`text-lg font-bold font-mono ${dailyDiffGrams && dailyDiffGrams < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {dailyDiffGrams !== null ? (dailyDiffGrams > 0 ? `+${dailyDiffGrams}g ↑` : `${Math.abs(dailyDiffGrams)}g ↓`) : '—'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {dailyPercent !== null ? `${dailyPercent.toFixed(2)}% vs yesterday` : ''}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Total % vs Birth Wt</span>
                <span className={`text-lg font-bold font-mono ${isCritLoss ? 'text-rose-600' : isAlertLoss ? 'text-amber-700' : 'text-slate-900'}`}>
                  {cumPercent > 0 ? '+' : ''}{cumPercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Math.round((twt - bwt) * 1000)}g net change
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Clinical Status</span>
                {isCritLoss ? (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block mt-1">
                    Critical Nadir (&gt;10%)
                  </span>
                ) : isAlertLoss ? (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                    Excessive Loss (7-10%)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                    Physiological Range
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Fluid Requirement Calculator */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-teal-600" />
              <span>3. Neonatal Daily Fluid Requirement Guidelines</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Day of Life (DOL)</label>
                <select
                  value={fluidDol}
                  onChange={(e) => setFluidDol(parseInt(e.target.value, 10))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                >
                  <option value={1}>Day 1 (0-24 HOL) - Target: 60 mL/kg/day</option>
                  <option value={2}>Day 2 (24-48 HOL) - Target: 85 mL/kg/day</option>
                  <option value={3}>Day 3 (48-72 HOL) - Target: 110 mL/kg/day</option>
                  <option value={4}>Day 4 (72-96 HOL) - Target: 130 mL/kg/day</option>
                  <option value={5}>Day 5+ (Established) - Target: 150 mL/kg/day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fluidWeight}
                  onChange={(e) => setFluidWeight(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                />
              </div>
            </div>

            <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-teal-800 font-medium block">Total 24h Fluid Quota</span>
                <span className="text-lg font-bold font-mono text-teal-950">{totalFluidMl} mL/24h</span>
                <span className="text-[10px] text-teal-700 block">({targetMlKg} mL/kg/day)</span>
              </div>

              <div>
                <span className="text-[11px] text-teal-800 font-medium block">8 Feeds/Day (q3h)</span>
                <span className="text-lg font-bold font-mono text-teal-950">{mlPerFeed8} mL</span>
                <span className="text-[10px] text-teal-700 block">per 3-hourly feed</span>
              </div>

              <div>
                <span className="text-[11px] text-teal-800 font-medium block">12 Feeds/Day (q2h)</span>
                <span className="text-lg font-bold font-mono text-teal-950">{mlPerFeed12} mL</span>
                <span className="text-[10px] text-teal-700 block">per 2-hourly feed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
