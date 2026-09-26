import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { bedsApi, ipdApi, patientsApi } from '../../api/endpoints';
import { useItem, useSave } from '../../hooks/useResource';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import { QueryState, Spinner } from '../../components/ui/States';
import AdmissionForm from './AdmissionForm';

export default function AdmissionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mutation = useSave(ipdApi, id, { invalidate: [bedsApi.key, 'rooms'], onSuccess: (saved) => navigate(id ? `/ipd/${saved.id}` : '/ipd') });
  const title = id ? 'Edit admission' : 'Admit patient';
  const props = { mutation, onCancel: () => navigate(-1) };

  return (
    <>
      <PageHeader title={title} breadcrumbs={[{ label: 'IPD', to: '/ipd' }, { label: title }]} />
      <Card className="mx-auto max-w-3xl">
        <CardBody>{id ? <EditAdmission id={id} {...props} /> : <NewAdmission {...props} />}</CardBody>
      </Card>
    </>
  );
}

function EditAdmission({ id, ...props }) {
  const query = useItem(ipdApi, id);
  return (
    <QueryState query={query}>
      {(admission) => (
        <AdmissionForm
          admission={admission}
          patient={{ id: admission.patientId, fullName: admission.patientName, patientCode: admission.patientCode, phone: admission.patientPhone }}
          {...props}
        />
      )}
    </QueryState>
  );
}

/** ?patientId= and ?bedId= pre-fill the form (from the patient profile or the bed board). */
function NewAdmission(props) {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const bedId = searchParams.get('bedId') || '';
  const patientQuery = useItem(patientsApi, patientId);
  if (patientId && patientQuery.isPending) return <Spinner />;
  return <AdmissionForm patient={patientQuery.data} initialValues={{ bedId }} {...props} />;
}
