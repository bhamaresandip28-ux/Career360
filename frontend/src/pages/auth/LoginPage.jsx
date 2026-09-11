import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARDS } from '../../components/guards/ProtectedRoute';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      const user = await login(form.email, form.password);
      const userRole = user?.role;
      const roleHome = ROLE_DASHBOARDS[userRole] || '/student/dashboard';
      const dest = (from && from !== '/' && from !== '/login' && from !== '/register' && from !== '/dashboard')
        ? from
        : roleHome;
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="glass border border-white/10 rounded-3xl p-8 shadow-card">

          {/* Logo */}
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              Career<span className="text-primary-400">360</span>
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white text-center mb-1">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm text-center mb-8">
            Sign in to your Career360 account
          </p>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-sm text-danger-300">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
            />

            <Input
              id="login-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
              rightIcon={
                <button type="button" onClick={() => setShowPw((v) => !v)} className="focus:outline-none hover:text-white transition-colors" tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              }
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                onClick={() => {/* Password reset — Phase 1 architecture only */}}
              >
                Forgot password?
              </button>
            </div>

            <Button
              id="login-submit"
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Career360 — Your Complete Journey from Classroom to Career
        </p>
      </div>
    </div>
  );
}
