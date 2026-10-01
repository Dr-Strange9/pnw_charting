import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Utensils, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Droplet,
  Info,
  ChevronRight
} from 'lucide-react';
import { PatientRecord, WardSettings } from '../types';
import { computePatientMetrics } from '../utils/calculations';

interface PostnatalTableProps {
  patients: PatientRecord[];
  settings: WardSettings;
  onEditPatient: (patient: PatientRecord) => void;
  onOpenFeeding: (patient: PatientRecord) => void;
  onDeletePatient: (patientId: string) => void;
}

type SortField = 'bedNumber' | 'babyName' | 'hol' | 'birthWeight' | 'todayWeight' | 'weightDiff' | 'cumulativePercent';
type SortOrder = 'asc' | 'desc';

export const PostnatalTable: React.FC<PostnatalTableProps> = ({
  patients,
  settings,
  onEditPatient,
  onOpenFeeding,
  onDeletePatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'alert' | 'abo' | 'early_hol' | 'gaining'>('all');
  const [sortField, setSortField] = useState<SortField>('bedNumber');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [percentDisplayMode, setPercentDisplayMode] = useState<'both' | 'vs_birth' | 'vs_yesterday'>('both');

  // Compute metrics for all patients
  const evaluatedPatients = useMemo(() => {
    return patients.map((patient) => {
      const metrics = computePatientMetrics(patient, settings.currentDate, settings.currentTime);
      return { patient, metrics };
    });
  }, [patients, settings.currentDate, settings.currentTime]);

  // Filtering
  const filteredPatients = useMemo(() => {
    return evaluatedPatients.filter(({ patient, metrics }) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        patient.babyName.toLowerCase().includes(query) ||
        (patient.motherName && patient.motherName.toLowerCase().includes(query)) ||
        patient.bedNumber.toLowerCase().includes(query) ||
        patient.maternalBloodGroup.toLowerCase().includes(query) ||
        patient.babyBloodGroup.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Filter types
      if (filterType === 'critical') return metrics.isWeightLossCritical;
      if (filterType === 'alert') return metrics.isWeightLossAlert || metrics.isWeightLossCritical;
      if (filterType === 'abo') return metrics.aboIncompatibilityRisk || metrics.rhRisk;
      if (filterType === 'early_hol') return metrics.hoursOfLife <= 24;
      if (filterType === 'gaining') return (metrics.dailyWeightDiffGrams || 0) > 0;

      return true;
    });
  }, [evaluatedPatients, searchQuery, filterType]);

  // Sorting
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'bedNumber':
          comparison = a.patient.bedNumber.localeCompare(b.patient.bedNumber);
          break;
        case 'babyName':
          comparison = a.patient.babyName.localeCompare(b.patient.babyName);
          break;
        case 'hol':
          comparison = a.metrics.hoursOfLife - b.metrics.hoursOfLife;
          break;
        case 'birthWeight':
          comparison = a.patient.birthWeightKg - b.patient.birthWeightKg;
          break;
        case 'todayWeight':
          comparison = a.patient.todayWeightKg - b.patient.todayWeightKg;
          break;
        case 'weightDiff':
          comparison = (a.metrics.dailyWeightDiffGrams || 0) - (b.metrics.dailyWeightDiffGrams || 0);
          break;
        case 'cumulativePercent':
          comparison = a.metrics.cumulativePercentChange - b.metrics.cumulativePercentChange;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPatients, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Controls Bar: Search, Filters, Display mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 no-print">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by baby name, mother, bed #, blood group..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
          />
        </div>

        {/* Filter Segmented Control & Display toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({patients.length})
            </button>
            <button
              onClick={() => setFilterType('alert')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'alert' ? 'bg-white text-amber-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weight Loss (&gt;7%)
            </button>
            <button
              onClick={() => setFilterType('abo')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'abo' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ABO/Rh Watch
            </button>
            <button
              onClick={() => setFilterType('early_hol')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'early_hol' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              &le;24 HOL
            </button>
            <button
              onClick={() => setFilterType('gaining')}
              className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'gaining' ? 'bg-white text-emerald-800 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weight Gaining (↑)
            </button>
          </div>

          {/* % Mode Toggle */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md">
            <span>% View:</span>
            <button
              onClick={() => setPercentDisplayMode('both')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${percentDisplayMode === 'both' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-800'}`}
            >
              Both
            </button>
            <button
              onClick={() => setPercentDisplayMode('vs_birth')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${percentDisplayMode === 'vs_birth' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-800'}`}
            >
              vs Birth Wt
            </button>
            <button
              onClick={() => setPercentDisplayMode('vs_yesterday')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${percentDisplayMode === 'vs_yesterday' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-800'}`}
            >
              vs Yesterday
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Header matching handwritten columns: Name, DOB/TOB, MBG/BBG, HOL/DOL, B.wt, Y.wt, T.wt, ↑/↓, % change + Daily Feeding */}
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 select-none">
                
                {/* 1. Bed & Name */}
                <th className="py-3 px-3.5 whitespace-nowrap">
                  <button
                    onClick={() => toggleSort('babyName')}
                    className="flex items-center gap-1 font-semibold text-slate-800 hover:text-teal-700 cursor-pointer"
                  >
                    <span>Patient Details / Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Bed / Baby of</span>
                </th>

                {/* 2. DOB / TOB */}
                <th className="py-3 px-3 whitespace-nowrap">
                  <span>DOB / TOB</span>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Date & Time of Birth</span>
                </th>

                {/* 3. MBG / BBG */}
                <th className="py-3 px-3 whitespace-nowrap">
                  <span>MBG / BBG</span>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Maternal / Baby Blood</span>
                </th>

                {/* 4. HOL / DOL */}
                <th className="py-3 px-3 whitespace-nowrap">
                  <button
                    onClick={() => toggleSort('hol')}
                    className="flex items-center gap-1 font-semibold text-slate-800 hover:text-teal-700 cursor-pointer"
                  >
                    <span>HOL / DOL</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Hours / Days of Life</span>
                </th>

                {/* 5. B.wt */}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleSort('birthWeight')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-teal-700 cursor-pointer ml-auto"
                  >
                    <span>B.wt (kg)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Birth Weight</span>
                </th>

                {/* 6. Y.wt */}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  <span>Y.wt (kg)</span>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Yesterday</span>
                </th>

                {/* 7. T.wt */}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleSort('todayWeight')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-teal-700 cursor-pointer ml-auto"
                  >
                    <span>T.wt (kg)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Today's Weight</span>
                </th>

                {/* 8. Daily Change: ↑ / ↓ */}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleSort('weightDiff')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-teal-700 cursor-pointer ml-auto"
                  >
                    <span>↑ / ↓ (g)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Daily Gain/Loss</span>
                </th>

                {/* 9. % Change */}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => toggleSort('cumulativePercent')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-teal-700 cursor-pointer ml-auto"
                  >
                    <span>% Change</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                    {percentDisplayMode === 'vs_birth' ? 'vs Birth Wt' : percentDisplayMode === 'vs_yesterday' ? 'vs Yesterday' : 'vs Birth / Y.wt'}
                  </span>
                </th>

                {/* 10. Feeding Frequency & Volume Monitoring */}
                <th className="py-3 px-4 min-w-[220px]">
                  <span>Daily Feeding & Volumes</span>
                  <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Method · Frequency · mL/feed · 24h Vol</span>
                </th>

                {/* 11. Actions */}
                <th className="py-3 px-3 text-right whitespace-nowrap no-print">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-sans">
              {sortedPatients.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No babies found matching your search/filter.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="mt-2 text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
                    >
                      Clear search & filters
                    </button>
                  </td>
                </tr>
              ) : (
                sortedPatients.map(({ patient, metrics }, index) => {
                  const isCrit = metrics.isWeightLossCritical;
                  const isAlert = metrics.isWeightLossAlert;
                  const diffGrams = metrics.dailyWeightDiffGrams;

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCrit ? 'bg-rose-50/40' : isAlert ? 'bg-amber-50/30' : index % 2 === 1 ? 'bg-slate-50/20' : ''
                      }`}
                    >
                      {/* 1. Patient Details */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {patient.bedNumber}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-teal-700 transition-colors">
                              {patient.babyName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              {patient.motherName && <span>M: {patient.motherName}</span>}
                              {patient.gender && <span>· {patient.gender}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. DOB / TOB */}
                      <td className="py-2.5 px-3 align-middle whitespace-nowrap font-mono text-slate-700">
                        <div>
                          {new Date(patient.birthDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          @{patient.birthTime || '00:00'}
                        </div>
                      </td>

                      {/* 3. MBG / BBG */}
                      <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="font-medium text-slate-800" title="Maternal Blood Group">
                            M: {patient.maternalBloodGroup}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="font-medium text-slate-800" title="Baby Blood Group">
                            B: {patient.babyBloodGroup}
                          </span>
                        </div>
                        {metrics.aboIncompatibilityRisk && (
                          <div className="text-[10px] text-indigo-700 font-semibold flex items-center gap-0.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            ABO Incomp.
                          </div>
                        )}
                        {metrics.rhRisk && (
                          <div className="text-[10px] text-rose-700 font-semibold flex items-center gap-0.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            Rh Incomp.
                          </div>
                        )}
                      </td>

                      {/* 4. HOL / DOL */}
                      <td className="py-2.5 px-3 align-middle whitespace-nowrap font-mono">
                        <div className="font-semibold text-slate-800 text-xs">
                          {metrics.hoursOfLife <= 72 ? (
                            <span className="text-teal-900 font-bold">{metrics.holFormatted}</span>
                          ) : (
                            <span className="text-slate-700">{metrics.dolFormatted}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {metrics.hoursOfLife <= 72 ? metrics.dolFormatted : metrics.holFormatted}
                        </div>
                      </td>

                      {/* 5. Birth Weight (B.wt) */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono tabular-nums text-slate-800 font-medium">
                        {patient.birthWeightKg.toFixed(3)}
                      </td>

                      {/* 6. Yesterday's Weight (Y.wt) */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono tabular-nums text-slate-600">
                        {patient.yesterdayWeightKg !== undefined && patient.yesterdayWeightKg > 0
                          ? patient.yesterdayWeightKg.toFixed(3)
                          : '—'}
                      </td>

                      {/* 7. Today's Weight (T.wt) */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono tabular-nums font-bold text-slate-900">
                        {patient.todayWeightKg.toFixed(3)}
                      </td>

                      {/* 8. Daily Gain / Loss (grams: ↑ / ↓) */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono tabular-nums whitespace-nowrap">
                        {diffGrams === null ? (
                          <span className="text-slate-400">—</span>
                        ) : diffGrams > 0 ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            {Math.abs(diffGrams)}g ↑
                          </span>
                        ) : diffGrams < 0 ? (
                          <span className={`font-bold inline-flex items-center gap-0.5 ${Math.abs(diffGrams) >= 150 ? 'text-rose-700' : 'text-amber-800'}`}>
                            <TrendingDown className="w-3 h-3" />
                            {Math.abs(diffGrams)}g ↓
                          </span>
                        ) : (
                          <span className="text-slate-500">0g</span>
                        )}
                      </td>

                      {/* 9. Percentage Change */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono tabular-nums whitespace-nowrap">
                        {/* Cumulative vs Birth Weight */}
                        {(percentDisplayMode === 'both' || percentDisplayMode === 'vs_birth') && (
                          <div>
                            <span
                              className={`inline-block font-bold text-xs ${
                                isCrit
                                  ? 'text-rose-700 bg-rose-100/70 px-1 py-0.2 rounded border border-rose-300'
                                  : isAlert
                                  ? 'text-amber-800 bg-amber-100/70 px-1 py-0.2 rounded border border-amber-300'
                                  : metrics.cumulativePercentChange > 0
                                  ? 'text-emerald-700'
                                  : 'text-slate-700'
                              }`}
                              title="Cumulative % Change vs Birth Weight"
                            >
                              {metrics.cumulativePercentChange > 0 ? '+' : ''}
                              {metrics.cumulativePercentChange.toFixed(2)}%
                            </span>
                            {percentDisplayMode === 'both' && (
                              <span className="block text-[10px] text-slate-400 font-normal">vs Birth</span>
                            )}
                          </div>
                        )}

                        {/* Daily vs Yesterday */}
                        {(percentDisplayMode === 'both' || percentDisplayMode === 'vs_yesterday') && (
                          <div className={percentDisplayMode === 'both' ? 'mt-1 text-[11px]' : ''}>
                            {metrics.dailyPercentChange !== null ? (
                              <span
                                className={`text-[11px] ${
                                  metrics.dailyPercentChange > 0
                                    ? 'text-emerald-600 font-medium'
                                    : metrics.dailyPercentChange < -3
                                    ? 'text-rose-600 font-medium'
                                    : 'text-slate-500'
                                }`}
                                title="Daily % Change vs Yesterday"
                              >
                                {metrics.dailyPercentChange > 0 ? '+' : ''}
                                {metrics.dailyPercentChange.toFixed(2)}%
                                {percentDisplayMode === 'both' && <span className="text-slate-400 text-[10px]"> (d/d)</span>}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">—</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 10. Feeding Frequency & Volumes Consumed */}
                      <td className="py-2.5 px-4 align-middle">
                        <div
                          onClick={() => onOpenFeeding(patient)}
                          className="group cursor-pointer p-1.5 -m-1.5 rounded hover:bg-teal-50/60 transition-colors"
                          title="Click to view/edit feeding log & fluid quota"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-slate-800 text-[11px] truncate">
                              {patient.feeding.type}
                            </span>
                            <span className="text-[10px] text-teal-700 group-hover:text-teal-900 font-medium shrink-0 flex items-center">
                              Details <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-slate-700">{patient.feeding.frequency}</span>
                            {patient.feeding.volumePerFeedMl && (
                              <span>· {patient.feeding.volumePerFeedMl} mL/feed</span>
                            )}
                          </div>

                          {/* Fluid Intake vs Target */}
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            {metrics.actualFluidMlKg !== null ? (
                              <span className="font-mono font-medium text-slate-700">
                                Total: {patient.feeding.total24hVolumeMl} mL (
                                <strong className={metrics.actualFluidMlKg < metrics.fluidRequirementTargetMlKg * 0.75 ? 'text-amber-700' : 'text-slate-800'}>
                                  {metrics.actualFluidMlKg} mL/kg/d
                                </strong>
                                )
                              </span>
                            ) : (
                              <span className="text-slate-400">Total vol: not entered</span>
                            )}
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500">
                              Wet: {patient.feeding.wetDiapers} · Stool: {patient.feeding.stools}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 11. Actions */}
                      <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap no-print">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenFeeding(patient)}
                            title="Log Feeding & Hydration"
                            className="p-1 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Utensils className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditPatient(patient)}
                            title="Edit Patient & Weights"
                            className="p-1 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePatient(patient.id)}
                            title="Delete Patient Record"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{sortedPatients.length}</strong> of{' '}
            <strong className="text-slate-800">{patients.length}</strong> monitored neonates
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-300"></span>
              Critical loss (&gt;10%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300"></span>
              Alert loss (7-10%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300"></span>
              Weight gain (↑)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
