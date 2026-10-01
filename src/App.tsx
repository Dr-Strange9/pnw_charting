import React, { useState, useEffect } from 'react';
import { WardSettings, PatientRecord } from './types';
import { initialPatients, initialWardSettings } from './data/initialData';
import { computePatientMetrics } from './utils/calculations';
import { WardHeader } from './components/WardHeader';
import { ClinicalAlertsBar } from './components/ClinicalAlertsBar';
import { PostnatalTable } from './components/PostnatalTable';
import { PatientModal } from './components/PatientModal';
import { FeedingDetailsModal } from './components/FeedingDetailsModal';
import { NeonatalCalculatorModal } from './components/NeonatalCalculatorModal';
import { PhotoComparisonModal } from './components/PhotoComparisonModal';
import { PrintChartView } from './components/PrintChartView';

const PATIENTS_STORAGE_KEY = 'postnatal_patients_v1';
const SETTINGS_STORAGE_KEY = 'postnatal_settings_v1';

export default function App() {
  // Load settings with fallback
  const [settings, setSettings] = useState<WardSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return initialWardSettings;
  });

  // Load patients with fallback
  const [patients, setPatients] = useState<PatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return initialPatients;
  });

  // Modal states
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientRecord | null>(null);

  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
  const [feedingPatient, setFeedingPatient] = useState<PatientRecord | null>(null);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPhotoComparisonOpen, setIsPhotoComparisonOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
    } catch {
      // ignore
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Handlers
  const handleAddPatient = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (patient: PatientRecord) => {
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = (savedPatient: PatientRecord) => {
    setPatients((prev) => {
      const index = prev.findIndex((p) => p.id === savedPatient.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedPatient;
        return updated;
      }
      return [savedPatient, ...prev];
    });
  };

  const handleDeletePatient = (patientId: string) => {
    const toDelete = patients.find((p) => p.id === patientId);
    if (!toDelete) return;

    if (window.confirm(`Are you sure you want to remove ${toDelete.babyName} (${toDelete.bedNumber}) from the monitoring chart?`)) {
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    }
  };

  const handleOpenFeeding = (patient: PatientRecord) => {
    setFeedingPatient(patient);
    setIsFeedingModalOpen(true);
  };

  const handleUpdateFeeding = (
    patientId: string,
    updatedFeeding: PatientRecord['feeding'],
    notes?: string
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            feeding: updatedFeeding,
            clinicalNotes: notes !== undefined ? notes : p.clinicalNotes,
          };
        }
        return p;
      })
    );
  };

  const handleResetData = () => {
    if (window.confirm('Reset monitoring chart with original 12 handwritten patient records from 24/09/2026?')) {
      setPatients(initialPatients);
      setSettings(initialWardSettings);
      localStorage.removeItem(PATIENTS_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Bed No',
      "Baby's Name",
      "Mother's Name",
      'Gender',
      'DOB',
      'TOB',
      'Maternal Blood Group (MBG)',
      'Baby Blood Group (BBG)',
      'Hours of Life (HOL)',
      'Days of Life (DOL)',
      'Birth Weight (kg)',
      "Yesterday's Weight (kg)",
      "Today's Weight (kg)",
      'Daily Gain/Loss (grams)',
      'Daily % Change vs Yesterday',
      'Total % Change vs Birth Weight',
      'Feeding Method',
      'Feeding Frequency',
      'Volume per Feed (mL)',
      'Total 24h Volume (mL)',
      'Fluid Intake (mL/kg/day)',
      'Wet Diapers (24h)',
      'Stools (24h)',
      'Stool Consistency',
      'Clinical Notes',
    ];

    const rows = patients.map((patient) => {
      const metrics = computePatientMetrics(patient, settings.currentDate, settings.currentTime);
      return [
        `"${patient.bedNumber}"`,
        `"${patient.babyName}"`,
        `"${patient.motherName || ''}"`,
        `"${patient.gender || ''}"`,
        `"${patient.birthDate}"`,
        `"${patient.birthTime}"`,
        `"${patient.maternalBloodGroup}"`,
        `"${patient.babyBloodGroup}"`,
        metrics.hoursOfLife,
        metrics.daysOfLife,
        patient.birthWeightKg.toFixed(3),
        patient.yesterdayWeightKg ? patient.yesterdayWeightKg.toFixed(3) : '',
        patient.todayWeightKg.toFixed(3),
        metrics.dailyWeightDiffGrams !== null ? metrics.dailyWeightDiffGrams : '',
        metrics.dailyPercentChange !== null ? metrics.dailyPercentChange.toFixed(2) : '',
        metrics.cumulativePercentChange.toFixed(2),
        `"${patient.feeding.type}"`,
        `"${patient.feeding.frequency}"`,
        patient.feeding.volumePerFeedMl || '',
        patient.feeding.total24hVolumeMl || '',
        metrics.actualFluidMlKg || '',
        patient.feeding.wetDiapers,
        patient.feeding.stools,
        `"${patient.feeding.stoolColor || ''}"`,
        `"${(patient.clinicalNotes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postnatal_monitoring_chart_${settings.currentDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Interactive Header */}
      <WardHeader
        settings={settings}
        onUpdateSettings={setSettings}
        patients={patients}
        onAddPatient={handleAddPatient}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenPhotoComparison={() => setIsPhotoComparisonOpen(true)}
        onResetData={handleResetData}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
      />

      {/* 2. Clinical Monitoring Alerts Bar */}
      <ClinicalAlertsBar
        patients={patients}
        settings={settings}
        onSelectPatient={handleEditPatient}
      />

      {/* 3. Main Postnatal Monitoring Chart Table */}
      <main className="flex-1">
        <PostnatalTable
          patients={patients}
          settings={settings}
          onEditPatient={handleEditPatient}
          onOpenFeeding={handleOpenFeeding}
          onDeletePatient={handleDeletePatient}
        />
      </main>

      {/* 4. Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Neonatal & Postnatal Ward Monitoring System · {settings.hospitalName}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Pediatrician Sign-off Ready</span>
            <span>·</span>
            <span>Tabular Figures Calibrated</span>
            <span>·</span>
            <span>Formula: Physiological Nadir ≤ 10%</span>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={handleSavePatient}
        patientToEdit={patientToEdit}
        settings={settings}
      />

      <FeedingDetailsModal
        isOpen={isFeedingModalOpen}
        onClose={() => setIsFeedingModalOpen(false)}
        patient={feedingPatient}
        settings={settings}
        onUpdateFeeding={handleUpdateFeeding}
      />

      <NeonatalCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        currentDate={settings.currentDate}
        currentTime={settings.currentTime}
      />

      <PhotoComparisonModal
        isOpen={isPhotoComparisonOpen}
        onClose={() => setIsPhotoComparisonOpen(false)}
      />

      {/* 6. Medical Print View for Hospital Ward Printing */}
      <PrintChartView patients={patients} settings={settings} />
    </div>
  );
}
