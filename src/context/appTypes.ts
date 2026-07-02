export interface CurriculumSection {
  name: string;
  lecturesCount: number;
  time: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  categoryId?: string;
  level: string;
  levelValue?: number;
  instructorId: string;
  cost: number;
  totalHours: number;
  lectures: number;
  rate: number;
  description: string;
  certification: string;
  image: string;
  createdAt?: string;
  curriculum: CurriculumSection[];
}

export interface Instructor {
  id: string;
  name: string;
  jobTitle: string;
  rate: number;
  description: string;
  reviewsCount: number;
  studentsCount: number;
  coursesCount: number;
  bio: string;
  image: string;
  jobTitleValue?: string;
}

export interface User {
  email: string;
  name: string;
  role: 'student' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  imagePath?: string | null;
}

