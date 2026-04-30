import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Activity, Loader2 } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.email || !form.password) {
      return toast.error('Sab fields fill karo!');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.user, res.data.access_token);
      toast.success(`Welcome back, ${res.data.user.name}! 💪`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed! Check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo login ke liye shortcut
  const demoLogin = (role) => {
    const demos = {
      admin:   { email: 'admin@gym.com',   password: 'admin123' },
      trainer: { email: 'trainer@gym.com', password: 'trainer123' },
      member:  { email: 'member@gym.com',  password: 'member123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 
                      bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Activity size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">GymPro</span>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Manage Your Gym<br />Like a Pro 💪
          </h2>
          <p className="text-orange-100 text-lg">
            QR attendance, member management, workout plans — sab ek jagah.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Members' },
            { value: '99%',  label: 'Uptime' },
            { value: '24/7', label: 'Access' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white font-bold text-2xl">{stat.value}</p>
              <p className="text-orange-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Activity size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">GymPro</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back!</h2>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@gym.com"
                className="input"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-sm font-medium block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 
                         disabled:cursor-not-allowed text-white font-semibold py-3 
                         rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <p className="text-gray-600 text-xs text-center mb-3 uppercase tracking-wider">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'trainer', 'member'].map(role => (
                <button
                  key={role}
                  onClick={() => demoLogin(role)}
                  className="bg-dark-card border border-dark-border hover:border-orange-500/40 
                             text-gray-400 hover:text-white text-xs py-2 rounded-lg 
                             capitalize font-medium transition-all"
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-gray-700 text-xs text-center mt-2">
              Click to fill credentials, then Sign In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}