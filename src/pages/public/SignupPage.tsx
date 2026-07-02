import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '../../context/useApp';
import { ArrowRight } from 'lucide-react';
import { FacebookIcon } from '../../components/common/SocialIcons';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const { registerUser } = useApp();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setAuthError(null);

    try {
      const user = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      navigate(user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to create account.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-white overflow-hidden font-sans">
      
      {/* Left side: Desk Photo */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80"
          alt="Clean desk space with notebook"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/5 mix-blend-multiply" />
      </div>

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your Account
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            {authError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {authError}
              </p>
            )}

            {/* Full Name Row */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Full Name
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="First Name"
                    {...register('firstName')}
                    className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.firstName
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-[10px] text-red-500 font-medium">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...register('lastName')}
                    className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.lastName
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-[10px] text-red-500 font-medium">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-800">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                {...register('username')}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.username
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
              {errors.username && (
                <p className="text-xs text-red-500 font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email ID"
                {...register('email')}
                className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter Password"
                  {...register('password')}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-800">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  {...register('confirmPassword')}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Social Logins */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase">
                <span className="bg-white px-3 text-slate-400">Sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Facebook */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
              >
                <FacebookIcon className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Facebook</span>
              </button>

              {/* Google */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
              >
                <span className="font-bold text-sm text-red-500">G</span>
                <span className="hidden sm:inline">Google</span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
              >
                <span className="font-semibold text-xs text-blue-500">■</span>
                <span className="hidden sm:inline">Microsoft</span>
              </button>
            </div>
            
            <p className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
