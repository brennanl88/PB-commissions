export type CalcType = 'Tiered GP' | 'Percent of GP' | 'Flat' | 'Percent of Revenue';

export interface Tier {
  from: number;
  to: number | null; // null for "and above"
  rate: number;
}

export interface CommissionStructure {
  id: string;
  name: string;
  trigger: string;
  basis: string;
  calcType: CalcType;
  formulaDetails: {
    tiers?: Tier[];
    rate?: number; // for Percent
    amount?: number; // for Flat
  };
  eligibleJobs: string;
  split: string;
  payoutTiming: string;
  notes?: string;
}

export interface Clawback {
  allowNegativeDeltas: boolean;
  maxAgeDays: number;
}

export interface Employee {
  id: string;
  name: string;
  roles: string;
  employeeId: string;
  commissionStructures: CommissionStructure[];
  clawback?: Clawback;
}

export interface CommissionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  structureName: string;
  jobIdentifier: string;
  date: string;
  inputValue: number; // For Tiered GP this will be the final GP, for others it's revenue/GP as before.
  calculatedAmount: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  commissionRate?: number;
}

export interface PendingGPRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  structureId: string;
  structureName: string;
  jobIdentifier: string;
  date: string; // Date sold
  totalRevenue: number;
}

export type View = 'data_entry' | 'log_sale' | 'finalize_gp' | 'admin_report' | 'structure_builder';

export type SortKey = keyof CommissionRecord;

export type SortDirection = 'asc' | 'desc';