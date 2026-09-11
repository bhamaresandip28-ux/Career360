import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const passwordRules = [
  { label: 'At least 8 characters',  test: (p) => p.length >= 8 },
  { label: 'Contains a letter',       test: (p) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number',       test: (p) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const navigate    = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Full name must be at least 2 characters.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (!/[a-zA-Z]/.test(form.password)) errs.password = 'Password must contain at least one letter.';
    else if (!/[0-9]/.test(form.password))    errs.password = 'Password must contain at least one number.';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      await register(form.name.trim(), form.email, form.password, form.confirmPassword);
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const lockIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );

  const eyeIcon = (show, toggle, label) => (
    <button type="button" onClick={toggle} className="focus:outline-none hover:text-white transition-colors" tabIndex={-1} aria-label={label}>
      {show ? (
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
  );

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 py-10">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="glass border border-white/10 rounded-3xl p-8 shadow-card">

          {/* Logo */}
          <div className="flex items-center gap-2.5 justify-center mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              Career<span className="text-primary-400">360</span>
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white text-center mb-1">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Join Career360 as a Student
          </p>

          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-sm text-danger-300">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="reg-name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              autoComplete="name"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
            />

            <Input
              id="reg-email"
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
              id="reg-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              label="Password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
              leftIcon={lockIcon}
              rightIcon={eyeIcon(showPw, () => setShowPw((v) => !v), showPw ? 'Hide password' : 'Show password')}
            />

            {/* Password strength indicators */}
            {form.password && (
              <div className="flex flex-wrap gap-2 mt-1">
                {passwordRules.map((r) => (
                  <span
                    key={r.label}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      r.test(form.password)
                        ? 'bg-accent-500/15 border-accent-500/30 text-accent-300'
                        : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    {r.test(form.password) ? '✓ ' : ''}{r.label}
                  </span>
                ))}
              </div>
            )}

            <Input
              id="reg-confirm-password"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              leftIcon={lockIcon}
              rightIcon={eyeIcon(showConfirm, () => setShowConfirm((v) => !v), showConfirm ? 'Hide password' : 'Show password')}
            />

            <Button
              id="register-submit"
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Sign In
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
