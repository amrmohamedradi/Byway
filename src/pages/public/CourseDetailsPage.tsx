import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { StarRating } from '../../components/common/StarRating';
import { CourseCard } from '../../components/common/CourseCard';
import {
  Trophy, GraduationCap, PlayCircle,
} from 'lucide-react';
import { FacebookIcon, GithubIcon, TwitterIcon } from '../../components/common/SocialIcons';
import { getSimilarCourses } from '../../services/api';
import type { Course } from '../../context/appTypes';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, instructors, cart, addToCart } = useApp();

  const [activeTab, setActiveTab] = useState<'desc' | 'inst' | 'content'>('desc');
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);

  const course = courses.find(c => c.id === id);
  useEffect(() => {
    if (!id) {
      return;
    }

    getSimilarCourses(id)
      .then(setRecommendedCourses)
      .catch(() => setRecommendedCourses([]));
  }, [id]);

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-lg font-medium">Course not found.</p>
        <Link to="/courses" className="mt-4 inline-block text-blue-600 font-bold hover:underline">
          Back to Courses Catalog
        </Link>
      </div>
    );
  }

  const instructor = instructors.find(i => i.id === course.instructorId);
  const isInCart = cart.includes(course.id);

  const handleAddToCartClick = () => {
    addToCart(course.id);
  };

  const handleBuyNowClick = () => {
    addToCart(course.id);
    navigate('/checkout');
  };

  return (
    <div className="bg-white text-left font-sans">
      
      {/* Breadcrumb banner */}
      <div className="bg-slate-50 border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-400 flex gap-2 items-center">
          <Link to="/" className="hover:text-slate-600">Home</Link>
          <span>&gt;</span>
          <Link to="/courses" className="hover:text-slate-600">Courses</Link>
          <span>&gt;</span>
          <span className="text-blue-600">{course.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Main Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Description */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {course.description}
            </p>
            
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 font-bold text-sm">{course.rate}</span>
                <StarRating rating={course.rate} size={14} />
              </div>
              <span className="text-slate-300">|</span>
              <span>{course.totalHours} Total Hours. {course.lectures} Lectures. All levels</span>
            </div>

            {/* Author indicator */}
            {instructor && (
              <div className="flex items-center gap-2 pt-2">
                <img 
                  src={instructor.image} 
                  alt={instructor.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200" 
                />
                <span className="text-xs text-slate-500 font-medium">
                  Created by <strong className="text-blue-600 font-semibold">{instructor.name}</strong>
                </span>
              </div>
            )}

            {/* Category tag */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-600 font-mono">
                {course.category}
              </span>
            </div>
          </div>

          {/* Navigation Buttons Row */}
          <div className="border-b border-slate-200 flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'desc', label: 'Description' },
              { id: 'inst', label: 'Instructor' },
              { id: 'content', label: 'Content' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-semibold rounded-md border transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content area */}
          <div className="space-y-8">
            {activeTab === 'desc' && (
              <>
                {/* Course Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-800">Course Description</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Certification */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-800">Certification</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {course.certification}
                  </p>
                </div>
              </>
            )}

            {activeTab === 'inst' && instructor && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Instructor</h3>
                
                <div className="space-y-1">
                  <h4 className="text-blue-600 font-extrabold text-base">{instructor.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{instructor.jobTitle}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <img 
                    src={instructor.image} 
                    alt={instructor.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-100 shadow-sm flex-shrink-0" 
                  />
                  
                  <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-slate-400" />
                      <span>{instructor.reviewsCount.toLocaleString()} Reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{instructor.studentsCount.toLocaleString()} Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-slate-400" />
                      <span>{instructor.coursesCount} Courses</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed">
                  {instructor.bio}
                </p>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Content</h3>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
                  {course.curriculum.map((section, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <span className="font-bold text-slate-700 text-sm">{section.name}</span>
                      <div className="flex gap-4 text-xs font-medium text-slate-400">
                        <span>{section.lecturesCount} Lectures</span>
                        <span>{section.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Purchase Widget */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg p-5 space-y-5">
            
            {/* Aspect Course image */}
            <div className="aspect-[700/430] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Price tag */}
            <div className="text-left">
              <span className="text-3xl font-extrabold text-slate-900">
                ${course.cost.toFixed(2)}
              </span>
            </div>

            {/* CTA Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleAddToCartClick}
                disabled={isInCart}
                className={`w-full py-3 rounded-lg text-sm font-bold shadow-md transition-all ${
                  isInCart
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                    : 'bg-slate-950 hover:bg-slate-800 text-white shadow-slate-100'
                }`}
              >
                {isInCart ? 'Added To Cart' : 'Add To Cart'}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="w-full py-3 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Social Share grid */}
            <div className="border-t border-slate-100 pt-4 text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Share</h4>
              <div className="flex items-center gap-2">
                <a href="#" className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors">
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-black transition-colors">
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors">
                  <span className="font-bold text-xs">G</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors">
                  <TwitterIcon className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-700 transition-colors">
                  <span className="font-bold text-xs">in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Courses Carousel Section */}
      <section className="border-t border-slate-200 py-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">More Courses Like This</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((rCourse) => (
              <CourseCard key={rCourse.id} course={rCourse} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

