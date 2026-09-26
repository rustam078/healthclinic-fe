import { labelize } from './format';

const toOptions = (values) => values.map((value) => ({ value, label: labelize(value) }));

export const GENDER_OPTIONS = toOptions(['MALE', 'FEMALE', 'OTHER']);
export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ value: v, label: v }));
export const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
];
export const ROOM_TYPE_OPTIONS = toOptions(['GENERAL', 'SEMI_PRIVATE', 'PRIVATE', 'ICU']);
export const DISCHARGE_CONDITION_OPTIONS = [
  { value: 'RECOVERED', label: 'Recovered' },
  { value: 'IMPROVED', label: 'Improved' },
  { value: 'REFERRED', label: 'Referred elsewhere' },
  { value: 'AGAINST_ADVICE', label: 'Left against medical advice' },
  { value: 'DECEASED', label: 'Deceased' },
];
export const ACTIVE_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];
export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'STAFF', label: 'Staff' },
];
export const LOGO_POSITION_OPTIONS = toOptions(['LEFT', 'CENTER', 'RIGHT']);
