import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { LayoutDashboard, Users, FolderOpen, LogOut, Bell, Tags } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };


  const getSectionDetails = () => {
    const path = location.pathname;
    if (path.includes('/admin/instructors')) {
      return {
        title: 'Instructors',
        breadcrumbs: [
          { name: 'Dashboard', path: '/admin/dashboard' },
          { name: 'Instructors', path: '/admin/instructors' }
        ]
      };
    } else if (path.includes('/admin/courses')) {
      return {
        title: 'Courses',
        breadcrumbs: [
          { name: 'Dashboard', path: '/admin/dashboard' },
          { name: 'Courses', path: '/admin/courses' }
        ]
      };
    } else if (path.includes('/admin/categories')) {
      return {
        title: 'Categories',
        breadcrumbs: [
          { name: 'Dashboard', path: '/admin/dashboard' },
          { name: 'Categories', path: '/admin/categories' }
        ]
      };
    }
    return {
      title: 'Dashboard',
      breadcrumbs: [
        { name: 'Dashboard', path: '/admin/dashboard' }
      ]
    };
  };

  const { title, breadcrumbs } = getSectionDetails();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Instructors', path: '/admin/instructors', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Courses', path: '/admin/courses', icon: FolderOpen },
  ];

  return (
    <>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">


      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0">
        <div>

          <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-mono">B</span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800 font-sans">Byway</span>
          </div>


          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-violet-50 text-violet-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-violet-500' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>


        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>


      <div className="flex-1 flex flex-col overflow-hidden">


        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">


          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">{title}</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={bc.name}>
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-slate-500">{bc.name}</span>
                  ) : (
                    <Link to={bc.path} className="hover:text-slate-600 transition-colors">
                      {bc.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>


          <div className="flex items-center gap-4">

            <div className="relative p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shadow-sm">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
            </div>


            <div
              className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm select-none cursor-pointer"
              onClick={() => navigate('/')}
              title="Return to Student Portal"
            >
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>


        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>


      <ConfirmDialog
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
        title="Log out?"
        message="Are you sure you want to log out of your admin session?"
        confirmLabel="Log Out"
        cancelLabel="Stay"
        icon={<LogOut className="w-7 h-7 text-slate-500" />}
      />
    </>
  );
};
