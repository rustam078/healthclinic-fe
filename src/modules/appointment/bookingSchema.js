import { z } from 'zod';
import {
  optionalText, requiredChoice, requiredDate, requiredPhone, requiredText, toPayload,
} from '../../utils/validation';
import { isoDate } from '../../utils/format';

export const bookingSchema = z.object({
  phone: requiredPhone(),
  fullName: requiredText('Name', 100),
  gender: requiredChoice('Sex'),
  dateOfBirth: z.string().optional().refine((value) => !value || value <= isoDate(), 'Date of birth cannot be in the future'),
  address: optionalText('Address'),
  appointmentDate: requiredDate('Date').refine((value) => value >= isoDate(), 'Date cannot be in the past'),
});

export const emptyBooking = () => ({
  phone: '', fullName: '', gender: '', dateOfBirth: '', address: '', appointmentDate: isoDate(),
});

/** Booking request: an existing patient (with any corrections) or a new patient, plus the date. */
export function toBookingPayload(values, selectedPatientId) {
  const { appointmentDate, ...patient } = values;
  return { patientId: selectedPatientId || null, appointmentDate, patient: toPayload(patient) };
}

/** Form values from a patient picked in the mobile-number lookup. */
export function fromPatient(patient) {
  return {
    phone: patient.phone,
    fullName: patient.fullName,
    gender: patient.gender,
    dateOfBirth: patient.dateOfBirth || '',
    address: patient.address || '',
  };
}
