import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const navigate   = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
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
    if (!form.name.trim()) errs.name = 'Full name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';

    if (!form.email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';

    if (!form.password) {
      errs.password = 'Password is required.';
    } else {
      if (form.password.length < 8) errs.password = 'At least 8 characters required.';
      else if (!/[A-Z]/.test(form.password)) errs.password = 'Must include an uppercase letter.';
      else if (!/[a-z]/.test(form.password)) errs.password = 'Must include a lowercase letter.';
      else if (!/[0-9]/.test(form.password)) errs.password = 'Must include a number.';
      else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) errs.password = 'Must include a special character.';
    }

    if (!form.confirmPassword) errs.confirmPassword = 'Confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';

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

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white border border-[#BDD8E9]/80 rounded-3xl p-8 shadow-md">

          {/* Logo */}
          <div className="flex items-center gap-2.5 justify-center mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#0A4174] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="font-display font-bold text-2xl text-[#001D39] tracking-tight">
              Career<span className="text-[#0A4174]">360</span>
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-[#001D39] text-center mb-1">
            Create Your Account
          </h1>
          <p className="text-slate-500 text-sm text-center mb-6">
            Join Career360 as a Student
          </p>

          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="register-name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              autoComplete="name"
            />

            <Input
              id="register-email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              id="register-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              label="Password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              id="register-confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <Button
              id="register-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Create Student Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0A4174] hover:text-[#001D39] font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Career360 — Your Complete Career &amp; Placement Intelligence Platform
        </p>
      </div>
    </div>
  );
}
