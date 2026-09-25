import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Fisherman');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await register({ name, email, password, role });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <NavLink to="/" className="inline-flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <span className="font-extrabold text-white text-xl font-mono">OR</span>
          </div>
          <span className="text-3xl font-extrabold font-mono tracking-wider text-slate-100">
            ORCA
          </span>
        </NavLink>
        <p className="text-xs text-slate-400 font-medium">Create your collaborative intelligence account</p>
      </div>

      <div className="w-full max-w-md bg-ocean-900/80 border border-ocean-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <h2 className="text-xl font-bold text-slate-100 mb-1">Create Account</h2>
        <p className="text-xs text-slate-400 mb-6">Select your marine operational persona.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Nayak"
                className="w-full pl-9 pr-3 py-2.5 bg-ocean-950/80 border border-ocean-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@fisheries.org"
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
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2.5 bg-ocean-950/80 border border-ocean-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Operational Role</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-ocean-950/80 border border-ocean-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                <option value="Fisherman">Fisherman / Vessel Master</option>
                <option value="Researcher">Marine Researcher / Oceanographer</option>
                <option value="Authority">Maritime Authority / Coast Guard / Port Officer</option>
                <option value="Administrator">Platform Administrator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already registered?{' '}
          <NavLink to="/login" className="text-cyan-400 hover:underline font-medium">
            Sign in
          </NavLink>
        </div>
      </div>

      <div className="max-w-md w-full mt-6">
        <DisclaimerBanner compact={true} />
      </div>
    </div>
  );
};

export default RegisterPage;
