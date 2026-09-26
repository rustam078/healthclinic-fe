import { z } from 'zod';

/** Shared zod building blocks so every form validates the same way as the backend. */
const PHONE = /^[0-9+()\-\s]{7,20}$/;
const PHONE_MESSAGE = 'Enter a valid phone number (7-20 digits)';

export const requiredText = (label, max = 255) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

export const optionalText = (label, max = 255) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`).optional().or(z.literal(''));

export const requiredPhone = (label = 'Mobile number') =>
  z.string().trim().min(1, `${label} is required`).regex(PHONE, PHONE_MESSAGE);

export const optionalPhone = () => z.string().trim().regex(PHONE, PHONE_MESSAGE).optional().or(z.literal(''));

export const optionalEmail = () => z.string().trim().email('Enter a valid email address').optional().or(z.literal(''));

export const requiredChoice = (label) => z.string().min(1, `${label} is required`);

/** Select holding a record id (string in the form, number in the payload). */
export const requiredId = (label) => z.coerce.number().int().positive(`${label} is required`);

export const optionalId = () => z.union([z.literal(''), z.coerce.number().int().positive()]).optional();

export const requiredDate = (label) => z.string().min(1, `${label} is required`);

/** Amount field: '' when left empty (then required check applies), otherwise a non-negative number. */
export const money = (label, { required = true } = {}) =>
  z.union([
    z.literal(''),
    z.coerce.number({ message: `${label} must be a number` }).min(0, `${label} cannot be negative`).max(99999999.99, `${label} is too large`),
  ]).refine((value) => !required || value !== '', `${label} is required`);

export const intRange = (label, min, max) =>
  z.coerce.number({ message: `${label} must be a number` }).int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`);

/** Converts empty strings to null before sending to the API. */
export function toPayload(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === '' ? null : value]));
}

/** Copies backend field errors ({ field: message }) onto react-hook-form fields. */
export function applyServerErrors(error, setError) {
  // Nested fields (e.g. patient.fullName) are shown on the matching form field (fullName).
  Object.entries(error?.errors || {}).forEach(([field, message]) => setError(field.split('.').pop(), { type: 'server', message }));
}
