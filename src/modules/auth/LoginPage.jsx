import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../context/AuthContext';
import { useClinicSettings } from '../../hooks/useClinicSettings';
import { usePageTitle } from '../../hooks/useBrowserTab';
import { TextField } from '../../components/form/Fields';
import PasswordField from '../../components/form/PasswordField';
import Button from '../../components/ui/Button';
import LogoBox from '../../components/print/LogoBox';

const schema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { user, login } = useAuth();
  const { data: settings } = useClinicSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  usePageTitle('Sign in');
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await login(values);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoBox src={settings?.logoUrl} width={180} height={60} alt={settings?.clinicName || 'Clinic logo'} />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">{settings?.clinicName || 'Clinic'}</h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {serverError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{serverError}</p>}
          <TextField label="Username" autoComplete="username" autoFocus error={formState.errors.username?.message} {...register('username')} />
          <PasswordField label="Password" autoComplete="current-password" error={formState.errors.password?.message} {...register('password')} />
          <Button type="submit" icon={LogIn} loading={formState.isSubmitting} className="w-full">Sign in</Button>
        </form>
      </div>
    </main>
  );
}
