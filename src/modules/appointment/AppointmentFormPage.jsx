import { useNavigate } from 'react-router-dom';
import { appointmentsApi, patientsApi } from '../../api/endpoints';
import { useApiMutation } from '../../hooks/useResource';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import BookingForm from './BookingForm';

/** Book a walk-in appointment. After booking, the new entry opens so its token slip can be printed. */
export default function AppointmentFormPage() {
  const navigate = useNavigate();
  const mutation = useApiMutation(appointmentsApi.create, {
    success: (booked) => `Token ${booked.tokenNumber} booked for ${booked.patientName}`,
    invalidate: [appointmentsApi.key, patientsApi.key, 'activity', 'dashboard'],
    onSuccess: () => navigate('/appointments'),
  });

  return (
    <>
      <PageHeader title="Book appointment" breadcrumbs={[{ label: 'Appointments', to: '/appointments' }, { label: 'Book' }]} />
      <Card className="mx-auto max-w-3xl">
        <CardBody><BookingForm mutation={mutation} onCancel={() => navigate(-1)} /></CardBody>
      </Card>
    </>
  );
}
