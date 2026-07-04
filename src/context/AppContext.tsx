import React, { useCallback, useState, useEffect } from 'react';
import {
  clearToken,
  getStoredSession,
  loginRequest,
  registerRequest,
  saveRefreshToken,
  saveToken,
} from '../services/auth';
import type { AuthSession, LoginCredentials, RegisterPayload } from '../services/auth';
import * as api from '../services/api';
import { AppContext } from './appContextValue';
import type { Category, Course, Instructor, User } from './appTypes';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return getStoredSession()?.user ?? null;
  });

  const [courses, setCourses] = useState<Course[]>([]);

  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [cart, setCart] = useState<string[]>([]);

  const refreshCart = useCallback(async () => {
    if (!user) {
      return;
    }

    const backendCart = await api.getCart();
    setCart(backendCart.courses.map((item) => item.courseId));
  }, [user]);

  const refreshCatalog = async () => {
    const [categoryData, coursePage, topInstructors] = await Promise.all([
      api.getCategories(),
      api.getCourses({ pageNumber: 1, pageSize: 100 }),
      api.getTopInstructors().catch(() => []),
    ]);

    setCategories(categoryData);
    setCourses(coursePage.items);

    if (topInstructors.length > 0) {
      setInstructors(topInstructors);
    }
  };

  useEffect(() => {
    refreshCatalog().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) {
      refreshCart().catch(() => undefined);
    }
  }, [refreshCart, user]);

  const login = async (credentials: LoginCredentials) => {
    const session = await loginRequest(credentials);
    saveToken(session.token);
    saveRefreshToken(session.refreshToken);
    setUser(session.user);
    return session.user;
  };

  const registerUser = async (payload: RegisterPayload) => {
    const session = await registerRequest(payload);
    saveToken(session.token);
    saveRefreshToken(session.refreshToken);
    setUser(session.user);
    return session.user;
  };

  // Used by GoogleLoginButton and FacebookLoginButton after they call externalLoginRequest.
  // Accepts the fully resolved AuthSession (JWT + refreshToken + user) and commits it to
  // app state — identical result to a normal login from the rest of the app's perspective.
  const loginWithSession = (session: AuthSession) => {
    saveToken(session.token);
    saveRefreshToken(session.refreshToken);
    setUser(session.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const addToCart = async (courseId: string) => {
    if (user) {
      await api.addCartItem(courseId);
    }

    if (!cart.includes(courseId)) {
      setCart([...cart, courseId]);
    }
  };

  const removeFromCart = async (courseId: string) => {
    if (user) {
      await api.removeCartItem(courseId);
    }

    setCart(cart.filter(id => id !== courseId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    const orderId = await api.checkoutOrder();
    setCart([]);
    return orderId;
  };

  const toCoursePayload = (courseData: Partial<Course>): api.CoursePayload => ({
    name: courseData.title ?? '',
    description: courseData.description ?? '',
    price: courseData.cost ?? 0,
    rating: courseData.rate ?? 0,
    imagePath: courseData.image,
    createdAt: courseData.createdAt ?? new Date().toISOString(),
    level: courseData.levelValue ?? (
      courseData.level === 'All Level' ? 1 :
      courseData.level === 'Intermediate' ? 3 :
      courseData.level === 'Expert' || courseData.level === 'Advanced' ? 4 :
      2
    ),
    categoryId: courseData.categoryId ?? categories.find((item) => item.name === courseData.category)?.id ?? '',
    instructorId: courseData.instructorId ?? '',
  });

  const instructorJobTitle = (value?: string) => {
    if (value === 'Frontend' || value === 'Front-End Developer') return 'FrontEndDeveloper';
    if (value === 'Backend' || value === 'Back-End Developer') return 'BackEndDeveloper';
    if (value === 'UI/UX Designer' || value === 'UX/UI Designer') return 'UXUIDesigner';
    if (value === 'Full Stack Developer') return 'FullStackDeveloper';
    return value ?? 'FullStackDeveloper';
  };

  const toInstructorPayload = (instructorData: Partial<Instructor>): api.InstructorPayload => ({
    name: instructorData.name ?? '',
    jobTitle: instructorJobTitle(instructorData.jobTitleValue ?? instructorData.jobTitle),
    bio: instructorData.bio,
    imagePath: instructorData.image,
  });

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    await api.createCourse(toCoursePayload(courseData));
    await refreshCatalog();
  };

  const updateCourse = async (id: string, updatedFields: Partial<Course>) => {
    const current = courses.find((course) => course.id === id);
    await api.updateCourse(id, toCoursePayload({ ...current, ...updatedFields }));
    await refreshCatalog();
  };

  const deleteCourse = async (id: string) => {
    await api.deleteCourse(id);
    setCourses(courses.filter(c => c.id !== id));
    setCart(cart.filter(cartId => cartId !== id));
  };

  const refreshAdminInstructors = async () => {
    const page = await api.getInstructors({ pageNumber: 1, pageSize: 100 });
    setInstructors(page.items);
  };

  const addInstructor = async (instData: Omit<Instructor, 'id'>) => {
    await api.createInstructor(toInstructorPayload(instData));
    await refreshAdminInstructors();
  };

  const updateInstructor = async (id: string, updatedFields: Partial<Instructor>) => {
    const current = instructors.find((instructor) => instructor.id === id);
    await api.updateInstructor(id, toInstructorPayload({ ...current, ...updatedFields }));
    await refreshAdminInstructors();
  };

  const deleteInstructor = async (id: string) => {
    await api.deleteInstructor(id);
    setInstructors(instructors.filter(i => i.id !== id));
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    await api.createCategory({ name: category.name, imagePath: category.imagePath ?? undefined });
    setCategories(await api.getCategories());
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    const current = categories.find((item) => item.id === id);
    await api.updateCategory(id, {
      name: category.name ?? current?.name ?? '',
      imagePath: category.imagePath ?? current?.imagePath ?? undefined,
    });
    setCategories(await api.getCategories());
    await refreshCatalog();
  };

  const deleteCategory = async (id: string) => {
    await api.deleteCategory(id);
    setCategories(categories.filter((item) => item.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      courses,
      instructors,
      categories,
      cart,
      login,
      loginWithSession,
      registerUser,
      logout,
      refreshCatalog,
      addToCart,
      removeFromCart,
      clearCart,
      checkout,
      addCourse,
      updateCourse,
      deleteCourse,
      addInstructor,
      updateInstructor,
      deleteInstructor,
      addCategory,
      updateCategory,
      deleteCategory,
    }}>
      {children}
    </AppContext.Provider>
  );
};

