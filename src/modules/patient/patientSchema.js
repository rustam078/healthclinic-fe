import { z } from 'zod';
import {
  optionalPhone, optionalText, requiredChoice, requiredPhone, requiredText,
} from '../../utils/validation';
import { isoDate } from '../../utils/format';

export const patientSchema = z.object({
  fullName: requiredText('Name', 100),
  phone: requiredPhone(),
  gender: requiredChoice('Gender'),
  dateOfBirth: z.string().optional().refine((value) => !value || value < isoDate(), 'Date of birth must be in the past'),
  bloodGroup: optionalText('Blood group', 5),
  address: optionalText('Address'),
  emergencyContactName: optionalText('Emergency contact name', 100),
  emergencyContactPhone: optionalPhone(),
  allergies: optionalText('Allergies'),
  status: z.string().optional(),
});

const FIELDS = Object.keys(patientSchema.shape);

/** API patient -> form values (nulls become empty strings). */
export function toPatientForm(patient, overrides = {}) {
  const values = Object.fromEntries(FIELDS.map((field) => [field, patient?.[field] ?? '']));
  return { ...values, status: patient?.status || 'ACTIVE', ...overrides };
}

