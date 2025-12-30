import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      await dispatch(login({email,password})).unwrap();
      nav('/');
    }catch(err){
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-pink-50 to-yellow-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">CF</div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Welcome back</h2>
            <p className="text-sm text-slate-600">Sign in to continue to CollabFlow</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 mt-4">
          <div>
            <input
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded-xl border border-transparent bg-white/90 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          <div>
            <input
              value={password}
              onChange={e=>setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-xl border border-transparent bg-white/90 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">{error}</div>}

          <button
            disabled={loading}
            className={`w-full p-3 rounded-full text-white shadow-lg transform transition ${loading ? 'opacity-70 cursor-not-allowed bg-indigo-400' : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:scale-[1.02]'}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 text-sm text-center text-slate-700">
          Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Register</Link>
        </div>
      </div>
    </div>
  );
}
