import { z } from 'zod';
import {
  optionalText, requiredChoice, requiredDate, requiredId, requiredText,
} from '../../utils/validation';
import { isoDateTime } from '../../utils/format';

export const admissionSchema = z.object({
  patientId: requiredId('Patient'),
  bedId: requiredId('Bed'),
  admittedAt: requiredDate('Admission date and time'),
  expectedDischargeDate: z.string().optional(),
  reason: requiredText('Reason for admission'),
  notes: optionalText('Notes', 1000),
}).refine(
  (values) => !values.expectedDischargeDate || values.expectedDischargeDate >= values.admittedAt.slice(0, 10),
  { path: ['expectedDischargeDate'], message: 'Expected discharge cannot be before admission' },
);

export function toAdmissionForm(admission, overrides = {}) {
  return {
    patientId: admission?.patientId ? String(admission.patientId) : '',
    bedId: admission?.bedId ? String(admission.bedId) : '',
    admittedAt: admission?.admittedAt?.slice(0, 16) || isoDateTime(),
    expectedDischargeDate: admission?.expectedDischargeDate || '',
    reason: admission?.reason || '',
    notes: admission?.notes || '',
    ...overrides,
  };
}

export function dischargeSchema(admittedAt) {
  return z.object({
    dischargedAt: requiredDate('Discharge date and time').refine((value) => value >= admittedAt.slice(0, 16), 'Discharge cannot be before admission'),
    dischargeCondition: requiredChoice('Condition at discharge'),
    dischargeSummary: requiredText('Discharge summary', 2000),
  });
}
