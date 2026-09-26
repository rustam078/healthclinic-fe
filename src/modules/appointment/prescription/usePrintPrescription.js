import { useState } from 'react';
import { createElement } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prescriptionApi, templatesApi } from '../../../api/endpoints';
import { usePrint } from '../../../context/PrintContext';
import { useToast } from '../../../context/ToastContext';
import PrescriptionPrint from './PrescriptionPrint';
import { PrescriptionDocument } from './PrescriptionSheet';
import { parseStrokes } from './ink';

/** Prints an appointment's prescription directly (e.g. from the appointment drawer) without opening the pad. */
export function usePrintPrescription() {
  const print = usePrint();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const run = async (appointment) => {
    setLoading(true);
    try {
      const [rx, template] = await Promise.all([
        prescriptionApi.get(appointment.id),
        queryClient.fetchQuery({ queryKey: [templatesApi.key, 'PRESCRIPTION'], queryFn: () => templatesApi.get('PRESCRIPTION') }),
      ]);
      print({
        type: 'PRESCRIPTION', date: appointment.appointmentDate, document: PrescriptionDocument, documentProps: { validUntil: rx.validUntil },
        content: createElement(PrescriptionPrint, {
          template, appointment, strokes: parseStrokes(rx.strokes), weightStrokes: parseStrokes(rx.weightStrokes), followUpDate: rx.followUpDate,
        }),
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { print: run, loading };
}
