import React, { useState, useEffect } from 'react';
import { X, Baby, Calendar, Clock, Scale, Utensils, AlertTriangle, Droplets, Info } from 'lucide-react';
import { BloodGroupType, FeedingType, PatientRecord, WardSettings } from '../types';
import { computePatientMetrics } from '../utils/calculations';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: PatientRecord) => void;
  patientToEdit?: PatientRecord | null;
  settings: WardSettings;
}

const BLOOD_GROUPS: BloodGroupType[] = [
  'A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve', 'Pending'
];

const FEEDING_TYPES: FeedingType[] = [
  'Direct Breastfeeding (DBF)',
  'Expressed Breast Milk (EBM)',
  'Infant Formula',
  'Mixed (Breast + EBM)',
  'Mixed (Breast + Formula)',
  'IV Fluids / TPN',
];

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientToEdit,
  settings,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<PatientRecord>(() => {
    if (patientToEdit) return { ...patientToEdit };
    return {
      id: `p-${Date.now()}`,
      bedNumber: `PNC-${Math.floor(Math.random() * 20) + 1}`,
      babyName: '',
      motherName: '',
      gender: 'Male',
      birthDate: settings.currentDate,
      birthTime: '08:00',
      maternalBloodGroup: 'O +ve',
      babyBloodGroup: 'Pending',
      birthWeightKg: 2.800,
      yesterdayWeightKg: 2.800,
      todayWeightKg: 2.750,
      feeding: {
        type: 'Direct Breastfeeding (DBF)',
        frequency: 'q2-3h (8-10 feeds)',
        frequencyCountPerDay: 8,
        volumePerFeedMl: 30,
        total24hVolumeMl: 240,
        wetDiapers: 4,
        stools: 2,
        stoolColor: 'Transitional yellow-green',
        toleranceNotes: 'Good latch and suckling.',
      },
      clinicalNotes: '',
    };
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (patientToEdit) {
      setFormData({ ...patientToEdit });
    }
  }, [patientToEdit]);

  // Live computed metrics for preview
  const liveMetrics = computePatientMetrics(formData, settings.currentDate, settings.currentTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.babyName.trim()) {
      newErrors.babyName = "Baby's name is required (e.g. B/o Meena)";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'Date of birth is required';
    }
    if (formData.birthWeightKg <= 0) {
      newErrors.birthWeightKg = 'Birth weight must be greater than 0';
    }
    if (formData.todayWeightKg <= 0) {
      newErrors.todayWeightKg = "Today's weight must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {patientToEdit ? `Edit Patient: ${patientToEdit.babyName}` : 'Add New Baby to Postnatal Ward'}
              </h2>
              <p className="text-xs text-slate-500">
                Record birth details, weights, blood groups, and daily feeding monitoring parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-slate-100/70 border-b border-slate-200 px-6 py-3 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-700">Calculated:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-teal-800">
                {liveMetrics.holFormatted} ({liveMetrics.dolFormatted})
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                Daily Diff: <strong className={liveMetrics.dailyWeightDiffGrams && liveMetrics.dailyWeightDiffGrams < 0 ? 'text-amber-700' : 'text-emerald-700'}>
                  {liveMetrics.dailyWeightDiffFormatted}
                </strong>
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                Total % vs Birth:{' '}
                <strong className={liveMetrics.isWeightLossCritical ? 'text-rose-600 font-bold' : liveMetrics.isWeightLossAlert ? 'text-amber-700 font-bold' : 'text-slate-900'}>
                  {liveMetrics.cumulativePercentChange > 0 ? '+' : ''}{liveMetrics.cumulativePercentChange.toFixed(2)}%
                </strong>
              </span>
            </div>

            {liveMetrics.isWeightLossCritical && (
              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Critical &gt;10% Loss
              </span>
            )}
            {liveMetrics.aboIncompatibilityRisk && (
              <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                ABO Incompatibility Risk
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Patient Identity */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span>1. Patient Details & Identification</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bed / Crib #
                </label>
                <input
                  type="text"
                  value={formData.bedNumber}
                  onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                  placeholder="e.g. PNC-01, Bed 12"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Baby's Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.babyName}
                  onChange={(e) => {
                    setFormData({ ...formData, babyName: e.target.value });
                    if (errors.babyName) setErrors({ ...errors, babyName: '' });
                  }}
                  placeholder="e.g. B/o Manisha"
                  className={`w-full text-xs px-3 py-2 border rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.babyName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                  }`}
                />
                {errors.babyName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.babyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={formData.motherName || ''}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="e.g. Manisha"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || 'Male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="Male">Male Infant</option>
                  <option value="Female">Female Infant</option>
                  <option value="Undetermined">Undetermined</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maternal Blood (MBG)
                  </label>
                  <select
                    value={formData.maternalBloodGroup}
                    onChange={(e) => setFormData({ ...formData, maternalBloodGroup: e.target.value as BloodGroupType })}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white font-mono"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Baby Blood (BBG)
                  </label>
                  <select
                    value={formData.babyBloodGroup}
                    onChange={(e) => setFormData({ ...formData, babyBloodGroup: e.target.value as BloodGroupType })}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white font-mono"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Date & Time of Birth (DOB / TOB) and Age Monitoring */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span>2. Date & Time of Birth & Age Monitoring</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth (DOB) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time of Birth (TOB)
                </label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manual HOL / DOL (Optional Override)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.manualHol !== undefined ? formData.manualHol : ''}
                    onChange={(e) => setFormData({ ...formData, manualHol: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    placeholder="HOL (e.g. 53)"
                    className="w-1/2 text-xs px-2 py-2 border border-slate-200 rounded-md font-mono"
                  />
                  <input
                    type="number"
                    value={formData.manualDol !== undefined ? formData.manualDol : ''}
                    onChange={(e) => setFormData({ ...formData, manualDol: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    placeholder="DOL (e.g. 6)"
                    className="w-1/2 text-xs px-2 py-2 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Daily Weight Monitoring */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span>3. Daily Weight Monitoring (in Kilograms)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birth Weight - B.wt (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.birthWeightKg || ''}
                  onChange={(e) => setFormData({ ...formData, birthWeightKg: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 2.760"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  = {Math.round(formData.birthWeightKg * 1000)} grams
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yesterday's Weight - Y.wt (kg)
                </label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.yesterdayWeightKg || ''}
                  onChange={(e) => setFormData({ ...formData, yesterdayWeightKg: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g. 2.645"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {formData.yesterdayWeightKg ? `= ${Math.round(formData.yesterdayWeightKg * 1000)} grams` : 'Leave empty if Day 1'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Today's Weight - T.wt (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.todayWeightKg || ''}
                  onChange={(e) => setFormData({ ...formData, todayWeightKg: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 2.595"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  = {Math.round(formData.todayWeightKg * 1000)} grams
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Daily Feeding Frequency & Volumes Consumed */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <span>4. Daily Feeding Frequency & Volumes Consumed</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feeding Method / Type
                </label>
                <select
                  value={formData.feeding.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    feeding: { ...formData.feeding, type: e.target.value as FeedingType }
                  })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  {FEEDING_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feeding Frequency
                </label>
                <input
                  type="text"
                  value={formData.feeding.frequency}
                  onChange={(e) => setFormData({
                    ...formData,
                    feeding: { ...formData.feeding, frequency: e.target.value }
                  })}
                  placeholder="e.g. q2-3h (8-10 feeds)"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated / Consumed Volume per Feed (mL)
                </label>
                <input
                  type="number"
                  value={formData.feeding.volumePerFeedMl || ''}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value) || 0;
                    const count = formData.feeding.frequencyCountPerDay || 8;
                    setFormData({
                      ...formData,
                      feeding: {
                        ...formData.feeding,
                        volumePerFeedMl: vol,
                        total24hVolumeMl: vol > 0 ? vol * count : formData.feeding.total24hVolumeMl,
                      },
                    });
                  }}
                  placeholder="e.g. 35 mL"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total 24h Volume (mL)
                </label>
                <input
                  type="number"
                  value={formData.feeding.total24hVolumeMl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    feeding: { ...formData.feeding, total24hVolumeMl: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="e.g. 280 mL"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono font-medium"
                />
                {liveMetrics.actualFluidMlKg !== null && (
                  <span className="text-[10px] text-teal-700 font-mono mt-0.5 block font-semibold">
                    = {liveMetrics.actualFluidMlKg} mL/kg/day (Target: ~{liveMetrics.fluidRequirementTargetMlKg})
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wet Diapers (24h)
                </label>
                <input
                  type="number"
                  value={formData.feeding.wetDiapers}
                  onChange={(e) => setFormData({
                    ...formData,
                    feeding: { ...formData.feeding, wetDiapers: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stools Count (24h)
                </label>
                <input
                  type="number"
                  value={formData.feeding.stools}
                  onChange={(e) => setFormData({
                    ...formData,
                    feeding: { ...formData.feeding, stools: parseInt(e.target.value, 10) || 0 }
                  })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stool Appearance / Color
                </label>
                <input
                  type="text"
                  value={formData.feeding.stoolColor || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    feeding: { ...formData.feeding, stoolColor: e.target.value }
                  })}
                  placeholder="e.g. Meconium / Yellow seedy"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feeding Tolerance & Clinical Notes
              </label>
              <textarea
                rows={2}
                value={formData.clinicalNotes || ''}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                placeholder="e.g. Sucking and rooting well. Bilirubin within zone. Kangaroo mother care initiated."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              {patientToEdit ? 'Save Changes' : 'Add Baby to Chart'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
