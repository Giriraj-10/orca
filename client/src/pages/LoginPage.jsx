import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ship, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    const res = await quickLoginAs(role);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <NavLink to="/" className="inline-flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <span className="font-extrabold text-white text-xl font-mono">OR</span>
          </div>
          <span className="text-3xl font-extrabold font-mono tracking-wider text-slate-100">
            ORCA
          </span>
        </NavLink>
        <p className="text-xs text-slate-400 font-medium">
          Marine EcOsystem Reasoning with Collaborative Agents
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-ocean-900/80 border border-ocean-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Access Marine Portal</h2>
        <p className="text-xs text-slate-400 mb-6">Enter credentials to authenticate into the intelligence system.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fisherman@orca.demo"
                className="w-full pl-9 pr-3 py-2.5 bg-ocean-950/80 border border-ocean-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-ocean-950/80 border border-ocean-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to ORCA'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Judge Personas */}
        <div className="mt-6 pt-6 border-t border-ocean-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              SIH Demo 1-Click Login:
            </span>
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('Fisherman')}
              disabled={loading}
              className="p-2 rounded-lg bg-ocean-950/70 hover:bg-ocean-800/80 border border-cyan-800/40 text-left transition-colors text-cyan-300 font-medium"
            >
              <div className="font-semibold text-xs">Fisherman</div>
              <div className="text-[10px] text-slate-400">Capt. Rajesh Patil</div>
            </button>

            <button
              onClick={() => handleQuickLogin('Researcher')}
              disabled={loading}
              className="p-2 rounded-lg bg-ocean-950/70 hover:bg-ocean-800/80 border border-teal-800/40 text-left transition-colors text-teal-300 font-medium"
            >
              <div className="font-semibold text-xs">Researcher</div>
              <div className="text-[10px] text-slate-400">Dr. Priya Varma</div>
            </button>

            <button
              onClick={() => handleQuickLogin('Authority')}
              disabled={loading}
              className="p-2 rounded-lg bg-ocean-950/70 hover:bg-ocean-800/80 border border-purple-800/40 text-left transition-colors text-purple-300 font-medium"
            >
              <div className="font-semibold text-xs">Authority</div>
              <div className="text-[10px] text-slate-400">Cdr. K. Nair</div>
            </button>

            <button
              onClick={() => handleQuickLogin('Administrator')}
              disabled={loading}
              className="p-2 rounded-lg bg-ocean-950/70 hover:bg-ocean-800/80 border border-rose-800/40 text-left transition-colors text-rose-300 font-medium"
            >
              <div className="font-semibold text-xs">Administrator</div>
              <div className="text-[10px] text-slate-400">System Admin</div>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-400">
          Need a new account?{' '}
          <NavLink to="/register" className="text-cyan-400 hover:underline font-medium">
            Register here
          </NavLink>
        </div>
      </div>

      <div className="max-w-md w-full mt-6">
        <DisclaimerBanner compact={true} />
      </div>
    </div>
  );
};

export default LoginPage;
