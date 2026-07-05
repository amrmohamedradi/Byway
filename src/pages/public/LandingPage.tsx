import React, { Suspense, lazy, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { CourseCard } from '../../components/common/CourseCard';
import { StarRating } from '../../components/common/StarRating';
import { Compass, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLoader } from '../../components/common/PageLoader';


const useCarousel = (itemCount: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    const el = ref.current;
    if (!el) return;

    const canScrollLeft = el.scrollLeft > 5;
    const remainingScroll = Math.max(0, el.scrollWidth - el.scrollLeft - el.clientWidth);
    const canScrollRight = remainingScroll > 5;

    setShowLeft(canScrollLeft);
    setShowRight(canScrollRight);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll();
    }, 150);

    const el = ref.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      if (el) {
        el.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [itemCount]);

  const scroll = (direction: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return { ref, showLeft, showRight, scroll, checkScroll };
};


const HeroBookParticles = lazy(() => import('../../components/common/HeroBookParticles'));

const CanvasFallback: React.FC = () => (
  <div className="w-full h-full min-h-[300px] sm:min-h-[450px] rounded-2xl bg-slate-100/50 animate-pulse flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
    <span className="text-xs font-semibold text-slate-400 font-sans">Loading interactive 3D universe...</span>
  </div>
);

export const LandingPage: React.FC = () => {
  const { courses, instructors, categories, user } = useApp();
  const navigate = useNavigate();


  const topCourses = courses.slice(0, 4);

  const topInstructors = instructors.slice(0, 5);

  const categoriesCarousel = useCarousel(Math.min(categories.length, 4));
  const instructorsCarousel = useCarousel(topInstructors.length);
  const testimonialsCarousel = useCarousel(Math.min(topInstructors.length, 3));

  const stats = [
    { label: 'Courses available', value: courses.length.toLocaleString() },
    { label: 'Categories covered', value: categories.length.toLocaleString() },
    { label: 'Instructors teaching', value: instructors.length.toLocaleString() },
    { label: 'Top-rated courses', value: courses.filter((course) => course.rate >= 4).length.toLocaleString() },
  ];


  if (courses.length === 0 && instructors.length === 0 && categories.length === 0) {
    return <PageLoader message="Loading Byway..." />;
  }

  return (
    <div className="bg-white">

      <section className="relative bg-slate-50 py-16 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Unlock Your Potential <br/>with Byway
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
              Welcome to Byway, where learning knows no bounds. We believe that education is the key to personal and professional growth, and we're here to guide you on your journey to success.
            </p>
            <div>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-md text-white bg-slate-950 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5"
              >
                Start your journey
              </Link>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-6 flex justify-center relative h-[360px] sm:h-[450px] w-full"
          >
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-50/50 border border-slate-100/80 shadow-inner flex items-center justify-center">
              <Suspense fallback={<CanvasFallback />}>
                <HeroBookParticles />
              </Suspense>
            </div>


            <div className="absolute bottom-6 right-4 sm:right-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-3 max-w-[190px] border border-slate-100/50 flex flex-col items-center gap-1.5 z-10 hover:scale-105 transition-transform">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" alt="" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50" alt="" />
              </div>
              <p className="text-[10px] font-bold text-slate-700 leading-tight text-center">
                Learn from <strong className="text-blue-600 text-xs block">{instructors.length} Instructors</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </section>


      <section className="bg-slate-100/50 py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x md:divide-slate-200">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-xs text-slate-400 font-medium px-4">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top Categories</h2>
            {(categoriesCarousel.showLeft || categoriesCarousel.showRight) && (
              <div className="flex items-center gap-2">
                {categoriesCarousel.showLeft && (
                  <button
                    onClick={() => categoriesCarousel.scroll('left')}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {categoriesCarousel.showRight && (
                  <button
                    onClick={() => categoriesCarousel.scroll('right')}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            ref={categoriesCarousel.ref}
            className="flex overflow-x-auto scrollbar-none gap-6 pb-2 scroll-smooth snap-x snap-mandatory"
          >
            {categories.slice(0, 4).map((cat) => {
              const categoryCourses = courses.filter((course) => course.categoryId === cat.id || course.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/courses?category=${encodeURIComponent(cat.name)}`)}
                  className="w-[calc(50%-12px)] md:w-[calc(25%-18px)] flex-shrink-0 snap-start bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all text-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    {cat.imagePath ? (
                      <img src={cat.imagePath} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <Compass className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {categoryCourses} {categoryCourses === 1 ? 'Course' : 'Courses'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <section className="py-16 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top Courses</h2>
            <Link to="/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>


      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top Instructors</h2>
            {(instructorsCarousel.showLeft || instructorsCarousel.showRight) && (
              <div className="flex items-center gap-2">
                {instructorsCarousel.showLeft && (
                  <button
                    onClick={() => instructorsCarousel.scroll('left')}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {instructorsCarousel.showRight && (
                  <button
                    onClick={() => instructorsCarousel.scroll('right')}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            ref={instructorsCarousel.ref}
            className="flex overflow-x-auto scrollbar-none gap-6 pb-2 scroll-smooth snap-x snap-mandatory"
          >
            {topInstructors.map((instructor) => (
              <div
                key={instructor.id}
                className="w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(20%-19.2px)] flex-shrink-0 snap-start bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all text-center flex flex-col justify-between"
              >
                <div>
                  <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-slate-100 mb-4 border-2 border-slate-100 shadow-sm">
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-tight mb-0.5">{instructor.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{instructor.jobTitle}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-2 flex items-center justify-center gap-1.5">
                  <StarRating rating={instructor.rate} size={13} />
                  <span className="text-[10px] font-bold text-slate-400">{instructor.rate}</span>
                  <span className="text-[10px] text-slate-400">({instructor.studentsCount} Students)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-16 bg-slate-50/50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">What Our Customer Say About Us</h2>
            {(testimonialsCarousel.showLeft || testimonialsCarousel.showRight) && (
              <div className="flex items-center gap-2">
                {testimonialsCarousel.showLeft && (
                  <button
                    onClick={() => testimonialsCarousel.scroll('left')}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {testimonialsCarousel.showRight && (
                  <button
                    onClick={() => testimonialsCarousel.scroll('right')}
                    className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            ref={testimonialsCarousel.ref}
            className="flex overflow-x-auto scrollbar-none gap-6 pb-2 scroll-smooth snap-x snap-mandatory"
          >
            {topInstructors.slice(0, 3).map((instructor) => (
              <div
                key={instructor.id}
                className="w-full md:w-[calc(33.333%-16px)] flex-shrink-0 snap-start bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-blue-400 rotate-180 fill-blue-50/50" />
                  <p className="text-slate-600 text-sm leading-relaxed text-left">"{instructor.bio || instructor.description}"</p>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div className="text-left">
                    <h4 className="font-bold text-slate-800 text-sm">{instructor.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{instructor.jobTitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          <div className="md:col-span-6 flex justify-center relative">
            <div className="w-72 h-72 rounded-full bg-violet-100 absolute -z-10 bottom-4 left-1/2 -translate-x-1/2"></div>
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
              alt="Become Instructor"
              className="w-80 h-80 rounded-2xl object-cover shadow-lg hover:rotate-2 transition-transform duration-300"
            />
          </div>

          <div className="md:col-span-6 text-left space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Become an Instructor</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Instructors from around the world teach millions of students on Byway. We provide the tools and skills to teach what you love.
            </p>
            <div>
              <button
                onClick={() => user ? navigate('/admin/dashboard') : navigate('/login')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold transition-all group shadow-md"
              >
                Start Your Instructor Journey
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          <div className="md:col-span-6 text-left space-y-4 order-2 md:order-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transform your life through education</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Learners around the world are launching new careers, advancing in their fields, and enriching their lives.
            </p>
            <div>
              <button
                onClick={() => navigate('/courses')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold transition-all group shadow-md"
              >
                Checkout Courses
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-6 flex justify-center relative order-1 md:order-2">
            <div className="w-72 h-72 rounded-full bg-blue-50 absolute -z-10 bottom-4 left-1/2 -translate-x-1/2"></div>
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80"
              alt="Transform Life"
              className="w-80 h-80 rounded-2xl object-cover shadow-lg hover:-rotate-2 transition-transform duration-300"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

