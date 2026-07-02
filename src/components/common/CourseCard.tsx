import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../context/appTypes';
import { useApp } from '../../context/useApp';
import { StarRating } from './StarRating';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isAdmin?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isAdmin = false,
  onView,
  onEdit,
  onDelete,
}) => {
  const { instructors } = useApp();
  const instructor = instructors.find((i) => i.id === course.instructorId);
  const instructorName = instructor ? instructor.name : 'Unknown Instructor';

  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(course.cost);

  const CardContent = (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Course Cover Image with Tag Overlay */}
      <div className="relative aspect-[700/430] overflow-hidden bg-slate-100">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md">
          {course.category}
        </span>
      </div>

      {/* Info details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-bold text-slate-800 text-base line-clamp-2 leading-tight">
            {course.title}
          </h3>
          
          {/* Author */}
          <p className="text-xs text-slate-500">By {instructorName}</p>

          {/* Rating Stars */}
          <div className="flex items-center gap-1.5">
            <StarRating rating={course.rate} />
            <span className="text-xs font-medium text-slate-400">({course.rate})</span>
          </div>

          {/* Details Row */}
          <p className="text-xs text-slate-400 font-medium">
            {course.totalHours} Total Hours. {course.lectures} Lectures. {course.level}
          </p>
        </div>

        {/* Bottom row: Price & Admin actions */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">{formattedPrice}</span>
          
          {/* Admin management buttons */}
          {isAdmin && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onView?.();
                }}
                title="View details"
                className="p-1.5 rounded-full hover:bg-slate-100 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit?.();
                }}
                title="Edit Course"
                className="p-1.5 rounded-full hover:bg-slate-100 text-violet-500 hover:text-violet-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete?.();
                }}
                title="Delete Course"
                className="p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If in admin mode, click triggers the View action; if in public mode, click navigates to course page.
  if (isAdmin) {
    return (
      <div onClick={onView} className="cursor-pointer h-full">
        {CardContent}
      </div>
    );
  }

  return (
    <Link to={`/courses/${course.id}`} className="h-full block">
      {CardContent}
    </Link>
  );
};
