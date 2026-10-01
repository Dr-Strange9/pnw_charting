import { BloodGroupType, CalculatedPatientMetrics, PatientRecord } from '../types';

export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Calculates Hours of Life (HOL) and Days of Life (DOL)
 */
export function calculateAge(
  birthDate: string,
  birthTime: string,
  currentDateStr: string,
  currentTimeStr: string
): { hol: number; dol: number; holFormatted: string; dolFormatted: string } {
  try {
    const birthDateTime = new Date(`${birthDate}T${birthTime || '00:00'}:00`);
    const currentDateTime = new Date(`${currentDateStr}T${currentTimeStr || '12:00'}:00`);

    const diffMs = currentDateTime.getTime() - birthDateTime.getTime();
    const hol = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    // Days of life: Day 1 starts at 0 hours. Day 2 at 24 hours, etc.
    const dol = Math.max(1, Math.floor(hol / 24) + 1);

    return {
      hol,
      dol,
      holFormatted: `${hol} HOL`,
      dolFormatted: `${getOrdinalSuffix(dol)} DOL`,
    };
  } catch {
    return {
      hol: 0,
      dol: 1,
      holFormatted: '0 HOL',
      dolFormatted: '1st DOL',
    };
  }
}

/**
 * Checks for ABO and Rh incompatibility risks
 */
export function checkBloodIncompatibility(
  maternal: BloodGroupType,
  baby: BloodGroupType
): { aboRisk: boolean; rhRisk: boolean } {
  if (maternal === 'Pending' || baby === 'Pending') {
    return { aboRisk: false, rhRisk: false };
  }

  const isMotherO = maternal.startsWith('O');
  const isBabyAorBorAB = baby.startsWith('A') || baby.startsWith('B') || baby.startsWith('AB');
  const aboRisk = isMotherO && isBabyAorBorAB;

  const isMotherRhNeg = maternal.includes('-ve');
  const isBabyRhPos = baby.includes('+ve');
  const rhRisk = isMotherRhNeg && isBabyRhPos;

  return { aboRisk, rhRisk };
}

/**
 * Standard neonatal expected fluid requirement per day of life (full term infant)
 */
export function getExpectedFluidTargetMlKg(dol: number): number {
  if (dol <= 1) return 60;
  if (dol === 2) return 85;
  if (dol === 3) return 110;
  if (dol === 4) return 130;
  return 150; // Day 5 onwards
}

/**
 * Computes all clinical metrics for a given patient record
 */
export function computePatientMetrics(
  patient: PatientRecord,
  currentDateStr: string,
  currentTimeStr: string
): CalculatedPatientMetrics {
  const age = calculateAge(
    patient.birthDate,
    patient.birthTime,
    currentDateStr,
    currentTimeStr
  );

  const hoursOfLife = patient.manualHol !== undefined ? patient.manualHol : age.hol;
  const daysOfLife = patient.manualDol !== undefined ? patient.manualDol : age.dol;

  // Weight differences
  const hasYesterday = patient.yesterdayWeightKg !== undefined && patient.yesterdayWeightKg > 0;
  
  let dailyWeightDiffGrams: number | null = null;
  let dailyWeightDiffFormatted = '—';
  let dailyPercentChange: number | null = null;

  if (hasYesterday && patient.yesterdayWeightKg) {
    const diffKg = patient.todayWeightKg - patient.yesterdayWeightKg;
    dailyWeightDiffGrams = Math.round(diffKg * 1000);
    const absGrams = Math.abs(dailyWeightDiffGrams);
    
    if (dailyWeightDiffGrams > 0) {
      dailyWeightDiffFormatted = `${absGrams}g ↑`;
    } else if (dailyWeightDiffGrams < 0) {
      dailyWeightDiffFormatted = `${absGrams}g ↓`;
    } else {
      dailyWeightDiffFormatted = '0g';
    }

    dailyPercentChange = ((patient.todayWeightKg - patient.yesterdayWeightKg) / patient.yesterdayWeightKg) * 100;
  }

  // Cumulative percentage change compared with birth weight:
  // ((Today - Birth) / Birth) * 100
  const cumulativePercentChange = patient.birthWeightKg > 0
    ? ((patient.todayWeightKg - patient.birthWeightKg) / patient.birthWeightKg) * 100
    : 0;

  // Clinical weight loss alerts:
  // Physiological loss up to 7% is normal in first 3-4 days.
  // > 7% warrants careful feeding assessment.
  // > 10% is critical neonatology threshold for excessive weight loss.
  const isWeightLossAlert = cumulativePercentChange <= -7.0 && cumulativePercentChange > -10.0;
  const isWeightLossCritical = cumulativePercentChange <= -10.0;

  // Incompatibility
  const { aboRisk, rhRisk } = checkBloodIncompatibility(
    patient.maternalBloodGroup,
    patient.babyBloodGroup
  );

  // Feeding & Fluids
  const fluidRequirementTargetMlKg = getExpectedFluidTargetMlKg(daysOfLife);
  const actualFluidMlKg = (patient.feeding.total24hVolumeMl && patient.todayWeightKg > 0)
    ? Math.round(patient.feeding.total24hVolumeMl / patient.todayWeightKg)
    : null;

  return {
    hoursOfLife,
    daysOfLife,
    holFormatted: `${hoursOfLife} HOL`,
    dolFormatted: `${getOrdinalSuffix(daysOfLife)} DOL`,
    dailyWeightDiffGrams,
    dailyWeightDiffFormatted,
    dailyPercentChange,
    cumulativePercentChange,
    isWeightLossAlert,
    isWeightLossCritical,
    aboIncompatibilityRisk: aboRisk,
    rhIncompatibilityRisk: rhRisk,
    rhRisk,
    fluidRequirementTargetMlKg,
    actualFluidMlKg,
  };
}
