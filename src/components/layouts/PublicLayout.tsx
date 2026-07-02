import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { ShoppingCart, LogOut, Search } from 'lucide-react';
import { FacebookIcon, GithubIcon, TwitterIcon } from '../common/SocialIcons';

export const PublicLayout: React.FC = () => {
  const { user, cart, categories, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-mono">B</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800 font-sans">Byway</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-700"
            />
          </form>

          {/* Action Links & User status */}
          <div className="flex items-center gap-4">
            <Link 
              to="/courses" 
              className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                location.pathname.startsWith('/courses') ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              Courses
            </Link>

            {user ? (
              // Logged in Navbar details
              <div className="flex items-center gap-4">
                {/* Cart link */}
                <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Link>

                {/* Dashboard / Quick switch link */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 font-semibold px-2.5 py-1.5 rounded transition-all">
                    Admin Dash
                  </Link>
                )}

                {/* Sign out */}
                <button 
                  onClick={logout} 
                  title="Logout" 
                  className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>

                {/* User Avatar Circle */}
                <div 
                  className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold cursor-pointer select-none"
                  onClick={() => user.role === 'admin' ? navigate('/admin/dashboard') : navigate('/courses')}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              // Logged out buttons
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-slate-900 border border-transparent rounded-md text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg font-mono">B</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white font-sans">Byway</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering learners through accessible and engaging online education. Byway is a leading online learning platform dedicated to providing high-quality, flexible, and affordable educational experiences.
            </p>
          </div>

          {/* Column 2: Get Help */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Get Help</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors">Latest Articles</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Programs</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link to={`/courses?category=${encodeURIComponent(category.name)}`} className="hover:text-white transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold text-base mb-1">Contact Us</h3>
            <p className="text-sm text-slate-400">
              <strong>Address:</strong> 123 Main Street, Anytown, CA 12345
            </p>
            <p className="text-sm text-slate-400">
              <strong>Tel:</strong> +(123) 456-7890
            </p>
            <p className="text-sm text-slate-400">
              <strong>Mail:</strong> bywayedu@webkul.in
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <FacebookIcon size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <GithubIcon size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <span className="font-bold text-xs">G</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <TwitterIcon size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors">
                <span className="font-bold text-xs">in</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
