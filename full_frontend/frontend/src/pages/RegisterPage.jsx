import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage(){
	const [name,setName] = useState('');
	const [email,setEmail] = useState('');
	const [password,setPassword] = useState('');
	const [showPassword,setShowPassword] = useState(false);
	const [loading,setLoading] = useState(false);
	const [fieldErrors,setFieldErrors] = useState({});
	const [serverError,setServerError] = useState(null);
	const [success,setSuccess] = useState(null);

	const dispatch = useDispatch();
	const nav = useNavigate();

	const validate = ()=>{
		const err = {};
		if(!name.trim()) err.name = 'Name is required';
		if(!email.trim()) err.email = 'Email is required';
		else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err.email = 'Invalid email';
		if(password.length < 6) err.password = 'Password must be at least 6 characters';
		return err;
	};

	const submit = async (e)=>{
		e.preventDefault();
		setServerError(null);
		const err = validate();
		setFieldErrors(err);
		if(Object.keys(err).length) return;

		setLoading(true);
		try{
			await dispatch(register({name,email,password})).unwrap();
			setSuccess('Account created — redirecting...');
			setTimeout(()=>nav('/'), 1200);
		}catch(err){
			const msg = err?.response?.data?.message || err?.message || 'Registration failed';
			setServerError(msg);
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
						<h2 className="text-2xl font-semibold text-slate-800">Create your account</h2>
						<p className="text-sm text-slate-600">Join CollabFlow — organize tasks, sprints, and bugs with your team.</p>
					</div>
				</div>

				<form onSubmit={submit} className="space-y-4 mt-4">
					<div>
						<input
							value={name}
							onChange={e=>setName(e.target.value)}
							placeholder="Full name"
							className={`w-full p-3 rounded-xl border border-transparent bg-white/90 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${fieldErrors.name ? 'ring-2 ring-red-300' : ''}`}
						/>
						{fieldErrors.name && <div className="text-red-600 text-sm mt-2">{fieldErrors.name}</div>}
					</div>

					<div>
						<input
							value={email}
							onChange={e=>setEmail(e.target.value)}
							placeholder="Email"
							className={`w-full p-3 rounded-xl border border-transparent bg-white/90 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${fieldErrors.email ? 'ring-2 ring-red-300' : ''}`}
						/>
						{fieldErrors.email && <div className="text-red-600 text-sm mt-2">{fieldErrors.email}</div>}
					</div>

					<div>
						<div className="relative">
							<input
								value={password}
								onChange={e=>setPassword(e.target.value)}
								type={showPassword ? 'text' : 'password'}
								placeholder="Password"
								className={`w-full p-3 rounded-xl border border-transparent bg-white/90 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${fieldErrors.password ? 'ring-2 ring-red-300' : ''}`}
							/>
							<button
								type="button"
								onClick={()=>setShowPassword(s=>!s)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-600"
							>
								{showPassword ? 'Hide' : 'Show'}
							</button>
						</div>
						{fieldErrors.password && <div className="text-red-600 text-sm mt-2">{fieldErrors.password}</div>}
					</div>

					{serverError && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">{serverError}</div>}
					{success && <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md text-sm">{success}</div>}

					<button
						disabled={loading}
						className={`w-full p-3 rounded-full text-white shadow-lg transform transition ${loading ? 'opacity-70 cursor-not-allowed bg-indigo-400' : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:scale-[1.02]'}`}
					>
						{loading ? 'Creating account...' : 'Create account'}
					</button>
				</form>

				<div className="mt-5 text-sm text-center text-slate-700">
					Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Login</Link>
				</div>
			</div>
		</div>
	);
}
