import toast from 'react-hot-toast';
import type { Category, Course, Instructor } from '../context/appTypes';
import {
  API_BASE_URL,
  getRefreshToken,
  getStoredSession,
  getToken,
  refreshRequest,
  saveRefreshToken,
  saveToken,
} from './auth';

interface ApiEnvelope<T> {
  success: boolean;
  message: string | null;
  data: T;
}

interface ApiErrorBody {
  message?: string | null;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface CourseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  createdAt: string;
  level: number;
  imagePath: string | null;
  categoryId: string;
  instructorId: string;
}

interface InstructorDto {
  id: string;
  name: string;
  jobTitle: string | number;
  bio: string | null;
  imagePath: string | null;
}

interface CartDto {
  courses: Array<{
    courseId: string;
    description: string;
    price: number;
    imagePath: string | null;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

export interface DashboardStats {
  coursesCount: number;
  categoriesCount: number;
  instructorsCount: number;
  monthlySales: number;
}

export interface CategoryPayload {
  name: string;
  imagePath?: string;
}

export interface CoursePayload {
  name: string;
  description: string;
  price: number;
  rating: number;
  imagePath?: string;
  createdAt: string;
  level: number;
  categoryId: string;
  instructorId: string;
}

export interface InstructorPayload {
  name: string;
  jobTitle: string;
  bio?: string;
  imagePath?: string;
}

const levelLabels: Record<number, string> = {
  1: 'All Level',
  2: 'Beginner',
  3: 'Intermediate',
  4: 'Expert',
};

const jobTitleLabels: Record<string, string> = {
  '0': 'Full Stack Developer',
  '1': 'Full Stack Developer',
  '2': 'Back-End Developer',
  '3': 'Front-End Developer',
  '4': 'UX/UI Designer',
  FullStackDeveloper: 'Full Stack Developer',
  BackEndDeveloper: 'Back-End Developer',
  FrontEndDeveloper: 'Front-End Developer',
  UXUIDesigner: 'UX/UI Designer',
};

const fallbackCourseImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80';
const fallbackInstructorImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';

const buildHeaders = (options: RequestInit, token = getToken()) => {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getApiErrorMessage = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const errorBody = body as ApiErrorBody;

  if (typeof errorBody.message === 'string' && errorBody.message.trim()) {
    return errorBody.message;
  }

  const firstValidationMessage = Object.values(errorBody.errors ?? {})[0]?.[0];
  return firstValidationMessage ?? null;
};

const notifyApiError = (message: string) => {
  toast.error(message);
};

const request = async <T>(path: string, options: RequestInit = {}, retry = true): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options),
    });
  } catch {
    const message = 'Unable to reach the API server. Check the API URL, CORS, or dev proxy configuration.';
    notifyApiError(message);
    throw new Error(message);
  }

  if (response.status === 401 && retry) {
    const session = getStoredSession();
    const refreshToken = getRefreshToken();

    if (session?.user.email && refreshToken) {
      const nextSession = await refreshRequest(session.user.email, refreshToken);
      saveToken(nextSession.token);
      saveRefreshToken(nextSession.refreshToken);
      return request<T>(path, options, false);
    }
  }

  const body = await readJson(response);
  const envelope = body as ApiEnvelope<T> | null;

  if (!response.ok || envelope?.success === false) {
    const message = getApiErrorMessage(body) ?? envelope?.message ?? 'The API request failed.';
    notifyApiError(message);
    throw new Error(message);
  }

  return envelope?.data as T;
};

const courseFromDto = (dto: CourseDto, categories: Category[] = []): Course => {
  const category = categories.find((item) => item.id === dto.categoryId);

  return {
    id: dto.id,
    title: dto.name,
    category: category?.name ?? dto.categoryId,
    categoryId: dto.categoryId,
    level: levelLabels[dto.level] ?? 'All Level',
    levelValue: dto.level,
    instructorId: dto.instructorId,
    cost: dto.price,
    totalHours: 0,
    lectures: 0,
    rate: dto.rating,
    description: dto.description,
    certification: 'Certificate of completion included.',
    image: dto.imagePath || fallbackCourseImage,
    createdAt: dto.createdAt,
    curriculum: [],
  };
};

const instructorFromDto = (dto: InstructorDto): Instructor => ({
  id: dto.id,
  name: dto.name,
  jobTitle: jobTitleLabels[String(dto.jobTitle)] ?? String(dto.jobTitle),
  jobTitleValue: String(dto.jobTitle),
  rate: 0,
  description: jobTitleLabels[String(dto.jobTitle)] ?? String(dto.jobTitle),
  reviewsCount: 0,
  studentsCount: 0,
  coursesCount: 0,
  bio: dto.bio ?? '',
  image: dto.imagePath || fallbackInstructorImage,
});

export const getCategories = () => request<Category[]>('/api/Category');

export const createCategory = (payload: CategoryPayload) => request<Category>('/api/Category', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const updateCategory = (id: string, payload: CategoryPayload) => request<null>(`/api/Category/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload),
});

export const deleteCategory = (id: string) => request<null>(`/api/Category/${id}`, { method: 'DELETE' });

export const getCourses = async (params: { pageNumber?: number; pageSize?: number; search?: string } = {}) => {
  const query = new URLSearchParams({
    pageNumber: String(params.pageNumber ?? 1),
    pageSize: String(params.pageSize ?? 50),
  });

  if (params.search) {
    query.set('search', params.search);
  }

  const [categories, page] = await Promise.all([
    getCategories().catch(() => []),
    request<PaginatedResponse<CourseDto>>(`/api/Course?${query.toString()}`),
  ]);

  return {
    ...page,
    items: page.items.map((course) => courseFromDto(course, categories)),
  };
};

export const getCourse = async (id: string) => {
  const [categories, course] = await Promise.all([
    getCategories().catch(() => []),
    request<CourseDto>(`/api/Course/${id}`),
  ]);

  return courseFromDto(course, categories);
};

export const getSimilarCourses = async (id: string) => {
  const categories = await getCategories().catch(() => []);
  const courses = await request<CourseDto[]>(`/api/GetSimilarCourses/${id}/similar`);
  return courses.map((course) => courseFromDto(course, categories));
};

export const createCourse = (payload: CoursePayload) => request<string>('/api/Course', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const updateCourse = (id: string, payload: CoursePayload) => request<null>(`/api/Course/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload),
});

export const deleteCourse = (id: string) => request<null>(`/api/Course/${id}`, { method: 'DELETE' });

export const getTopCourses = async () => {
  const categories = await getCategories().catch(() => []);
  const courses = await request<CourseDto[]>('/api/Home/top-courses');
  return courses.map((course) => courseFromDto(course, categories));
};

export const getTopCategories = () => request<Category[]>('/api/Home/top-Categories');

export const getTopInstructors = async () => {
  const instructors = await request<InstructorDto[]>('/api/Home/top-Instructor');
  return instructors.map(instructorFromDto);
};

export const getInstructors = async (params: { pageNumber?: number; pageSize?: number; search?: string } = {}) => {
  const query = new URLSearchParams({
    pageNumber: String(params.pageNumber ?? 1),
    pageSize: String(params.pageSize ?? 50),
  });

  if (params.search) {
    query.set('search', params.search);
  }

  const page = await request<PaginatedResponse<InstructorDto>>(`/api/Instructor?${query.toString()}`);

  return {
    ...page,
    items: page.items.map(instructorFromDto),
  };
};

export const createInstructor = (payload: InstructorPayload) => request<string>('/api/Instructor', {
  method: 'POST',
  body: JSON.stringify(payload),
});

export const updateInstructor = (id: string, payload: InstructorPayload) => request<null>(`/api/Instructor/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload),
});

export const deleteInstructor = (id: string) => request<null>(`/api/Instructor/${id}`, { method: 'DELETE' });

export const getDashboardStats = () => request<DashboardStats>('/api/DashBoard');

export const getCart = () => request<CartDto>('/api/Cart');

export const addCartItem = (courseId: string) => request<null>(`/api/Cart/${courseId}`, { method: 'POST' });

export const removeCartItem = (courseId: string) => request<null>(`/api/Cart/${courseId}`, { method: 'DELETE' });

export const checkoutOrder = () => request<string>('/api/Order/checkout', { method: 'POST' });
