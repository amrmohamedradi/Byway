import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import { CourseCard } from '../../components/common/CourseCard';
import { StarRating } from '../../components/common/StarRating';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { courses, categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Collapsible Filters Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ratingsExpanded, setRatingsExpanded] = useState(true);
  const [lecturesExpanded, setLecturesExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);

  // Filters State
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLectureRange, setSelectedLectureRange] = useState<string>(''); // '', '1-15', '16-30', '31-45', '46+'
  const [maxPrice, setMaxPrice] = useState<number>(980);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Sort State: 'latest' | 'oldest' | 'price-high' | 'price-low'
  const [sortBy, setSortBy] = useState<string>('latest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Read search & category parameters from URL query string
  useEffect(() => {
    const catQuery = searchParams.get('category');
    if (catQuery) {
      setSelectedCategories([catQuery]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  const categoriesList = categories.length > 0
    ? categories.map((category) => category.name)
    : ['Frontend', 'Backend', 'Testing', 'UI/UX Design'];

  const handleCategoryChange = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Filter & Sort Logic
  const filteredCourses = useMemo(() => {
    const searchVal = searchParams.get('search')?.toLowerCase() || '';

    return courses.filter((course) => {
      // 1. Search Query filter
      if (searchVal && !course.title.toLowerCase().includes(searchVal) && !course.category.toLowerCase().includes(searchVal)) {
        return false;
      }
      
      // 2. Rating filter
      if (selectedRating !== null && Math.floor(course.rate) < selectedRating) {
        return false;
      }

      // 3. Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
        return false;
      }

      // 4. Price filter
      if (course.cost > maxPrice) {
        return false;
      }

      // 5. Lectures Range filter
      if (selectedLectureRange) {
        const count = course.lectures;
        if (selectedLectureRange === '1-15' && (count < 1 || count > 15)) return false;
        if (selectedLectureRange === '16-30' && (count < 16 || count > 30)) return false;
        if (selectedLectureRange === '31-45' && (count < 31 || count > 45)) return false;
        if (selectedLectureRange === '46+' && count < 46) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (sortBy === 'latest') return b.id.localeCompare(a.id); // Simple ID comparison
      if (sortBy === 'oldest') return a.id.localeCompare(b.id);
      if (sortBy === 'price-high') return b.cost - a.cost;
      if (sortBy === 'price-low') return a.cost - b.cost;
      return 0;
    });
  }, [courses, searchParams, selectedRating, selectedCategories, maxPrice, selectedLectureRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left font-sans">
      
      {/* Title Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Design Courses</h1>
        <p className="text-slate-400 text-sm font-semibold mt-1">All Development Courses</p>
      </div>

      {/* Control Bar */}
      <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between gap-4">
        {/* Toggle Filters Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
            sidebarOpen 
              ? 'bg-slate-900 border-slate-900 text-white' 
              : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>

        {/* Sort Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Sort By</span>
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center justify-between gap-6 px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 min-w-[140px] text-left"
            >
              <span className="capitalize">
                {sortBy === 'latest' && 'The latest'}
                {sortBy === 'oldest' && 'The oldest'}
                {sortBy === 'price-high' && 'Highest price'}
                {sortBy === 'price-low' && 'Lowest price'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Dropdown Items (matches Component 1.png style!) */}
          {sortDropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white border border-slate-200 shadow-lg z-20 py-1 font-medium text-slate-700 text-sm">
              {[
                { label: 'Highest price', value: 'price-high' },
                { label: 'Lowest price', value: 'price-low' },
                { label: 'The latest', value: 'latest' },
                { label: 'The oldest', value: 'oldest' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                    sortBy === option.value ? 'bg-slate-50 text-blue-600 font-semibold' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Sidebar + Courses Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters */}
        {sidebarOpen && (
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6 bg-white p-4 rounded-xl border border-slate-200">
            
            {/* Filter Section: Rating */}
            <div className="border-b border-slate-100 pb-4">
              <button
                onClick={() => setRatingsExpanded(!ratingsExpanded)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                <span>Rating</span>
                {ratingsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {ratingsExpanded && (
                <div className="mt-3 space-y-2">
                  {[5, 4, 3].map((stars) => (
                    <label 
                      key={stars} 
                      className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      <input
                        type="radio"
                        name="rating-filter"
                        checked={selectedRating === stars}
                        onChange={() => setSelectedRating(selectedRating === stars ? null : stars)}
                        onClick={(e) => {
                          // Allow deselecting the radio
                          const target = e.target as HTMLInputElement;
                          if (selectedRating === stars) {
                            setSelectedRating(null);
                            target.checked = false;
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <StarRating rating={stars} size={14} />
                      <span>{stars} Stars & Up</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Section: Number of Lectures */}
            <div className="border-b border-slate-100 pb-4">
              <button
                onClick={() => setLecturesExpanded(!lecturesExpanded)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                <span>Number of Lectures</span>
                {lecturesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {lecturesExpanded && (
                <div className="mt-3 space-y-2.5">
                  {[
                    { label: '1-15', value: '1-15' },
                    { label: '16-30', value: '16-30' },
                    { label: '31-45', value: '31-45' },
                    { label: 'More than 45', value: '46+' },
                  ].map((range) => (
                    <label 
                      key={range.value} 
                      className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-600"
                    >
                      <input
                        type="radio"
                        name="lectures-filter"
                        checked={selectedLectureRange === range.value}
                        onChange={() => setSelectedLectureRange(range.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                  {selectedLectureRange && (
                    <button 
                      onClick={() => setSelectedLectureRange('')}
                      className="text-[10px] text-red-500 hover:underline font-bold mt-1 block"
                    >
                      Clear Lecture Filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Filter Section: Price */}
            <div className="border-b border-slate-100 pb-4">
              <button
                onClick={() => setPriceExpanded(!priceExpanded)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                <span>Price</span>
                {priceExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {priceExpanded && (
                <div className="mt-4 px-2 space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="980"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>$0</span>
                    <span className="text-blue-600 text-xs">${maxPrice} max</span>
                    <span>$980</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filter Section: Category */}
            <div>
              <button
                onClick={() => setCategoryExpanded(!categoryExpanded)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-800 uppercase tracking-wider"
              >
                <span>Category</span>
                {categoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {categoryExpanded && (
                <div className="mt-3 space-y-2.5">
                  {categoriesList.map((cat) => (
                    <label 
                      key={cat} 
                      className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Reset Button */}
            <button
              onClick={() => {
                setSelectedRating(null);
                setSelectedLectureRange('');
                setMaxPrice(980);
                setSelectedCategories([]);
                setSearchParams({});
              }}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-500 transition-colors"
            >
              Reset Filters
            </button>
          </aside>
        )}

        {/* Course Cards Grid */}
        <div className="flex-1 space-y-8 w-full">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-12 text-center border border-dashed border-slate-200">
              <p className="text-slate-500 font-medium text-sm">No courses match your active filter settings.</p>
              <button 
                onClick={() => {
                  setSelectedRating(null);
                  setSelectedLectureRange('');
                  setMaxPrice(980);
                  setSelectedCategories([]);
                }}
                className="mt-3 text-sm text-blue-600 font-bold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}

          {filteredCourses.length > 0 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button className="w-9 h-9 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-400">&lt;</button>
              <button className="w-9 h-9 border border-slate-900 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-sm">1</button>
              <button className="w-9 h-9 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-sm">2</button>
              <button className="w-9 h-9 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-sm">3</button>
              <button className="w-9 h-9 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-400">&gt;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

