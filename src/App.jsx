import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth, RequireModule, HomeRedirect } from './routes/Guards';
import { PrintProvider } from './context/PrintContext';
import AppLayout from './components/layout/AppLayout';
import { Spinner } from './components/ui/States';
import LoginPage from './modules/auth/LoginPage';
import NotFoundPage from './modules/NotFoundPage';

// Each module is loaded on first visit, keeping the initial download small.
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage'));
const AppointmentPage = lazy(() => import('./modules/appointment/AppointmentPage'));
const AppointmentFormPage = lazy(() => import('./modules/appointment/AppointmentFormPage'));
const PrescriptionPage = lazy(() => import('./modules/appointment/prescription/PrescriptionPage'));
const IpdPage = lazy(() => import('./modules/ipd/IpdPage'));
const IpdDetailPage = lazy(() => import('./modules/ipd/IpdDetailPage'));
const AdmissionFormPage = lazy(() => import('./modules/ipd/AdmissionFormPage'));
const PatientListPage = lazy(() => import('./modules/patient/PatientListPage'));
const PatientFormPage = lazy(() => import('./modules/patient/PatientFormPage'));
const PatientDetailPage = lazy(() => import('./modules/patient/PatientDetailPage'));
const SettingsPage = lazy(() => import('./modules/settings/SettingsPage'));

const guard = (module, element, level) => (
  <RequireModule module={module} level={level}>
    <Suspense fallback={<Spinner />}>{element}</Suspense>
  </RequireModule>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<PrintProvider><AppLayout /></PrintProvider>}>
          <Route index element={<HomeRedirect>{guard('DASHBOARD', <DashboardPage />)}</HomeRedirect>} />
          <Route path="appointments" element={guard('APPOINTMENT', <AppointmentPage />)} />
          <Route path="appointments/new" element={guard('APPOINTMENT', <AppointmentFormPage />, 'WRITE')} />
          <Route path="appointments/:id/prescription" element={guard('APPOINTMENT', <PrescriptionPage />)} />
          <Route path="ipd" element={guard('IPD', <IpdPage />)} />
          <Route path="ipd/admit" element={guard('IPD', <AdmissionFormPage />, 'WRITE')} />
          <Route path="ipd/:id" element={guard('IPD', <IpdDetailPage />)} />
          <Route path="ipd/:id/edit" element={guard('IPD', <AdmissionFormPage />, 'WRITE')} />
          <Route path="patients" element={guard('PATIENT', <PatientListPage />)} />
          <Route path="patients/new" element={guard('PATIENT', <PatientFormPage />, 'WRITE')} />
          <Route path="patients/:id" element={guard('PATIENT', <PatientDetailPage />)} />
          <Route path="patients/:id/edit" element={guard('PATIENT', <PatientFormPage />, 'WRITE')} />
          <Route path="settings" element={guard('SETTINGS', <SettingsPage />)} />
          <Route path="settings/:section" element={guard('SETTINGS', <SettingsPage />)} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
