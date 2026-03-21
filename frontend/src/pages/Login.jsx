import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12
        bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">

        {/* Background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/5" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <span className="text-xl">💼</span>
          </div>
          <span className="text-white font-bold text-xl">JobTrackr</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Track every opportunity</span>
          </div>
          <h2 className="text-5xl font-bold text-white leading-tight mb-5">
            Land your<br />dream job<br />
            <span className="text-indigo-200">faster.</span>
          </h2>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
            Organize applications, track interviews, and never miss a follow-up — all in one beautiful dashboard.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { icon: '📋', value: 'Track', label: 'All applications' },
            { icon: '🎯', value: 'Prep', label: 'Interviews easily' },
            { icon: '🏆', value: 'Land', label: 'Your dream role' },
          ].map(({ icon, value, label }) => (
            <div key={value} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-2xl">{icon}</span>
              <p className="text-white font-bold text-base mt-2">{value}</p>
              <p className="text-indigo-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-xl">💼</span>
            <span className="font-bold text-gray-900 dark:text-white">JobTrackr</span>
          </div>
          <div className="ml-auto">
            <button onClick={toggle}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back 👋
              </h1>
              <p className="text-gray-400 dark:text-gray-500">
                Sign in to continue tracking your applications
              </p>
            </div>

            {/* Google Button */}
            <a href="http://localhost:5000/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3 mb-6 rounded-xl border-2
                border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
                hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800
                text-gray-700 dark:text-gray-200 font-semibold text-sm transition-all duration-200 active:scale-95 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.6 39.5 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.8l6.2 5.2C40.9 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" required placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                      focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-100 dark:focus:shadow-indigo-900/20
                      placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                      focus:outline-none focus:border-indigo-500 focus:shadow-sm focus:shadow-indigo-100 dark:focus:shadow-indigo-900/20
                      placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600
                  text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30
                  transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:shadow-none mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In →'
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create one free
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}