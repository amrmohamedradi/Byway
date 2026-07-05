import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../../context/useApp';
import { ArrowRight } from 'lucide-react';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { FacebookLoginButton } from '../../components/auth/FacebookLoginButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);

    try {
      const user = await login(data);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white overflow-hidden font-sans">


      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            {authError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {authError}
              </p>
            )}


            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Username or Email ID"
                {...register('email')}
                className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>


            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter Password"
                {...register('password')}
                className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>


            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>


          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase">
                <span className="bg-white px-3 text-slate-400">Sign in with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FacebookLoginButton />
              <GoogleLoginButton />
            </div>

            <p className="text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>


      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80"
          alt="Developer writing code"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />
      </div>
    </div>
  );
};

