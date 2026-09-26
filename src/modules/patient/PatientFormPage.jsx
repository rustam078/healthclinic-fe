import { useNavigate, useParams } from 'react-router-dom';
import { patientsApi } from '../../api/endpoints';
import { useItem } from '../../hooks/useResource';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import { QueryState } from '../../components/ui/States';
import PatientForm from './PatientForm';

export default function PatientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useItem(patientsApi, id);
  const title = id ? 'Edit patient' : 'Register patient';
  const breadcrumbs = [{ label: 'Patients', to: '/patients' }, { label: title }];
  const onSaved = (saved) => navigate(`/patients/${saved.id}`);

  const form = (patient) => (
    <Card className="mx-auto max-w-3xl">
      <CardBody>
        <PatientForm patient={patient} onSaved={onSaved} onCancel={() => navigate(-1)} />
      </CardBody>
    </Card>
  );

  return (
    <>
      <PageHeader title={title} breadcrumbs={breadcrumbs} subtitle={id ? undefined : 'Only name, mobile number and gender are required'} />
      {id ? <QueryState query={query}>{form}</QueryState> : form(null)}
    </>
  );
}
