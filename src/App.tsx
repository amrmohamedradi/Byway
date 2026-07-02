import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';

// Layouts
import { PublicLayout } from './components/layouts/PublicLayout';
import { AdminLayout } from './components/layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailsPage } from './pages/public/CourseDetailsPage';
import { ShoppingCartPage } from './pages/public/ShoppingCartPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { PurchaseCompletePage } from './pages/public/PurchaseCompletePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInstructors } from './pages/admin/AdminInstructors';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminCategories } from './pages/admin/AdminCategories';


const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public/Student Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailsPage />} />
            <Route path="cart" element={<ShoppingCartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="purchase-complete" element={<PurchaseCompletePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="instructors" element={<AdminInstructors />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="courses" element={<AdminCourses />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
