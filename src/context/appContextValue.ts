import { createContext } from 'react';
import type { LoginCredentials, RegisterPayload } from '../services/auth';
import type { Category, Course, Instructor, User } from './appTypes';

export interface AppContextType {
  user: User | null;
  courses: Course[];
  instructors: Instructor[];
  categories: Category[];
  cart: string[];
  login: (credentials: LoginCredentials) => Promise<User>;
  registerUser: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshCatalog: () => Promise<void>;
  addToCart: (courseId: string) => Promise<void>;
  removeFromCart: (courseId: string) => Promise<void>;
  clearCart: () => void;
  checkout: () => Promise<string>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  addInstructor: (instructor: Omit<Instructor, 'id'>) => Promise<void>;
  updateInstructor: (id: string, instructor: Partial<Instructor>) => Promise<void>;
  deleteInstructor: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

