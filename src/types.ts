export type BloodGroupType = 
  | 'A +ve' 
  | 'A -ve' 
  | 'B +ve' 
  | 'B -ve' 
  | 'AB +ve' 
  | 'AB -ve' 
  | 'O +ve' 
  | 'O -ve' 
  | 'Pending';

export type FeedingType = 
  | 'Direct Breastfeeding (DBF)' 
  | 'Expressed Breast Milk (EBM)' 
  | 'Infant Formula' 
  | 'Mixed (Breast + EBM)' 
  | 'Mixed (Breast + Formula)' 
  | 'IV Fluids / TPN';

export interface FeedingInfo {
  type: FeedingType;
  frequency: string; // e.g., "8-10 feeds/day", "q2h", "q3h", "12 feeds"
  frequencyCountPerDay: number; // numeric count (e.g., 8, 10, 12)
  volumePerFeedMl?: number; // e.g., 30, 45, 60 mL
  total24hVolumeMl?: number; // total daily volume in mL
  wetDiapers: number; // count in last 24h
  stools: number; // count in last 24h
  stoolColor?: string; // e.g., "Meconium", "Transitional", "Yellow seedy"
  toleranceNotes?: string; // e.g., "Good latch, well tolerated", "Spitting post-feed"
}

export interface PatientRecord {
  id: string;
  bedNumber: string; // e.g. "Bed 01", "PNC-02"
  babyName: string; // e.g. "B/o Manisha", "B/o Sarita"
  motherName?: string; // e.g. "Manisha", "Sarita"
  gender?: 'Male' | 'Female' | 'Undetermined';
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm or HH:mm:ss
  maternalBloodGroup: BloodGroupType;
  babyBloodGroup: BloodGroupType;
  
  // Weights in kg (e.g. 2.760)
  birthWeightKg: number;
  yesterdayWeightKg?: number;
  todayWeightKg: number;
  
  // Feeding
  feeding: FeedingInfo;
  
  // Custom manual overrides if needed
  manualHol?: number;
  manualDol?: number;
  
  clinicalNotes?: string;
  isHighRisk?: boolean;
}

export interface CalculatedPatientMetrics {
  hoursOfLife: number;
  daysOfLife: number;
  holFormatted: string; // e.g. "53 HOL" or "2 HOL"
  dolFormatted: string; // e.g. "6th DOL"
  dailyWeightDiffGrams: number | null; // (Today - Yesterday) * 1000
  dailyWeightDiffFormatted: string; // e.g. "50g ↓" or "15g ↑"
  dailyPercentChange: number | null; // % vs Yesterday
  cumulativePercentChange: number; // % vs Birth weight
  isWeightLossAlert: boolean; // loss > 7%
  isWeightLossCritical: boolean; // loss > 10%
  aboIncompatibilityRisk: boolean; // Mother O, Baby A or B
  rhIncompatibilityRisk: boolean; // Mother Rh-, Baby Rh+
  rhRisk: boolean;
  fluidRequirementTargetMlKg: number; // Expected target based on DOL
  actualFluidMlKg: number | null; // actual consumed mL/kg/day
}

export interface WardSettings {
  hospitalName: string;
  wardName: string;
  shift: 'Morning' | 'Evening' | 'Night';
  currentDate: string; // YYYY-MM-DD
  currentTime: string; // HH:mm
  doctorInCharge: string;
  nurseInCharge: string;
}
