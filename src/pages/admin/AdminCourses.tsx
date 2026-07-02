import React, { useState, useMemo } from 'react';
import type { Course } from '../../context/appTypes';
import { useApp } from '../../context/useApp';
import { CourseCard } from '../../components/common/CourseCard';
import { DeleteModal } from '../../components/common/DeleteModal';
import { 
  Plus, Search, SlidersHorizontal, ChevronDown, Upload, X, ArrowLeft, Trash2, 
  Bold, Italic, Underline, Highlighter, Type, List, ListOrdered, Link2, Table, Quote 
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const courseSchema = z.object({
  title: z.string().min(1, 'Course Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  level: z.string().min(1, 'Level is required'),
  instructorId: z.string().min(1, 'Instructor is required'),
  cost: z.coerce.number().min(0, 'Cost must be positive'),
  totalHours: z.coerce.number().min(1, 'Total hours must be positive'),
  rate: z.coerce.number().min(1).max(5),
  description: z.string().min(1, 'Description is required'),
  certification: z.string().min(1, 'Certification details are required'),
  curriculum: z.array(z.object({
    name: z.string().min(1, 'Section Name is required'),
    lecturesCount: z.coerce.number().min(1, 'Lectures count is required'),
    time: z.string().min(1, 'Time duration is required'),
  })),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export const AdminCourses: React.FC = () => {
  const { courses, instructors, categories, addCourse, updateCourse, deleteCourse } = useApp();

  // Controls states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('All');
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const selectedCategoryFilterLabel = selectedCatFilter === 'All'
    ? 'All Categories'
    : categories.find((category) => category.id === selectedCatFilter)?.name ?? 'All Categories';

  // Wizard modal states
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<'add' | 'edit' | 'view'>('add');
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Delete modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCatFilter === 'All' || c.categoryId === selectedCatFilter;
      return matchSearch && matchCat;
    });
  }, [courses, searchQuery, selectedCatFilter]);

  // Form hooks
  const {
    register,
    control,
    handleSubmit,
    trigger,
    reset,
    formState: { errors }
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      curriculum: [{ name: '', lecturesCount: 5, time: '1 hour' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'curriculum'
  });

  // Action helpers
  const handleOpenAdd = () => {
    reset({
      title: '',
      categoryId: '',
      level: '',
      instructorId: instructors[0]?.id || '',
      cost: 45,
      totalHours: 22,
      rate: 5,
      description: '',
      certification: '',
      curriculum: [{ name: '', lecturesCount: 5, time: '1 hour' }]
    });
    setSelectedCourse(null);
    setWizardMode('add');
    setWizardStep(1);
    setWizardOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    reset({
      title: course.title,
      categoryId: course.categoryId ?? '',
      level: course.level,
      instructorId: course.instructorId,
      cost: course.cost,
      totalHours: course.totalHours,
      rate: course.rate,
      description: course.description,
      certification: course.certification,
      curriculum: course.curriculum,
    });
    setSelectedCourse(course);
    setWizardMode('edit');
    setWizardStep(1);
    setWizardOpen(true);
  };

  const handleOpenView = (course: Course) => {
    setSelectedCourse(course);
    setWizardMode('view');
    setWizardStep(1);
    setWizardOpen(true);
  };

  const handleOpenDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete.id);
      setCourseToDelete(null);
    }
  };

  const handleNextStep = async () => {
    // Validate Step 1 fields before proceeding
    const isStep1Valid = await trigger([
      'title', 'categoryId', 'level', 'instructorId', 
      'cost', 'totalHours', 'rate', 'description', 'certification'
    ]);
    if (isStep1Valid) {
      setWizardStep(2);
    }
  };

  const handleFormSubmit = async (data: CourseFormValues) => {
    const selectedCategory = categories.find((category) => category.id === data.categoryId);
    const coursePayload = {
      title: data.title,
      category: selectedCategory?.name ?? '',
      categoryId: data.categoryId,
      level: data.level,
      levelValue: data.level === 'All Level' ? 1 : data.level === 'Intermediate' ? 3 : data.level === 'Expert' ? 4 : 2,
      instructorId: data.instructorId,
      cost: data.cost,
      totalHours: data.totalHours,
      lectures: data.curriculum.reduce((sum, item) => sum + item.lecturesCount, 0),
      rate: data.rate,
      description: data.description,
      certification: data.certification,
      curriculum: data.curriculum,
      image: selectedCourse?.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    };

    if (wizardMode === 'add') {
      await addCourse(coursePayload);
    } else if (wizardMode === 'edit' && selectedCourse) {
      await updateCourse(selectedCourse.id, coursePayload);
    }
    setWizardOpen(false);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Container card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        {/* Control bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Courses</h2>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-md">
              {courses.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Add Course button */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>

            {/* Categories filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setCatFilterOpen(!catFilterOpen)}
                className="flex items-center justify-between gap-6 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
              >
                <span>{selectedCategoryFilterLabel}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {catFilterOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white border border-slate-200 shadow-lg z-20 py-1 font-semibold text-slate-600 text-xs">
                  {[{ id: 'All', name: 'All Categories' }, ...categories].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCatFilter(cat.id);
                        setCatFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search courses bar */}
            <div className="relative max-w-xs flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search for Courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs leading-5 bg-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Filter icon button */}
            <button className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid of Courses */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                isAdmin={true}
                onView={() => handleOpenView(c)}
                onEdit={() => handleOpenEdit(c)}
                onDelete={() => handleOpenDelete(c)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
            No courses found.
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 pt-6">
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-400">&lt;</button>
          <button className="w-8 h-8 border border-slate-900 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xs">1</button>
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs">2</button>
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs">3</button>
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-400">&gt;</button>
        </div>
      </div>

      {/* Delete confirmation popup */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={courseToDelete ? courseToDelete.title : ''}
        itemType="Course"
      />

      {/* Wizard Modal Overlay (Add / Edit / View steps sheets) */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Close button top right */}
            <button 
              onClick={() => setWizardOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header step row */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              {wizardStep === 2 && wizardMode !== 'view' && (
                <button 
                  onClick={() => setWizardStep(1)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {wizardMode === 'add' && 'Add Course'}
                  {wizardMode === 'edit' && 'Update Course'}
                  {wizardMode === 'view' && 'View Course'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Step {wizardStep} of 2
                </p>
              </div>
            </div>

            {/* Step 1 of 2: Details */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Course details</h4>
                
                {/* Upload Image box */}
                <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center bg-slate-50/50">
                  <div className="w-full md:w-48 h-28 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-white">
                    {selectedCourse ? (
                      <img src={selectedCourse.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold">Upload Image</span>
                      </>
                    )}
                  </div>
                  <div className="text-slate-500 space-y-1.5 text-xs text-center md:text-left flex-1">
                    <p className="font-semibold text-slate-700">Size: 700x430 pixels</p>
                    <p className="text-slate-400">File Support: .jpg, .jpeg, png, or .gif</p>
                    {wizardMode !== 'view' && (
                      <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Course Nama</label>
                    <input
                      type="text"
                      placeholder="Write here"
                      disabled={wizardMode === 'view'}
                      {...register('title')}
                      className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.title ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                      }`}
                    />
                    {errors.title && <p className="text-[10px] text-red-500 font-semibold">{errors.title.message}</p>}
                  </div>

                  {/* Category and Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
                      <select
                        disabled={wizardMode === 'view'}
                        {...register('categoryId')}
                        className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none text-slate-600 text-sm font-medium"
                      >
                        <option value="">Choose</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {errors.categoryId && <p className="text-[10px] text-red-500 font-semibold">{errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Level</label>
                      <select
                        disabled={wizardMode === 'view'}
                        {...register('level')}
                        className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none text-slate-600 text-sm font-medium"
                      >
                        <option value="">Choose</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                      {errors.level && <p className="text-[10px] text-red-500 font-semibold">{errors.level.message}</p>}
                    </div>
                  </div>

                  {/* Instructor and Cost */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Instructor</label>
                      <select
                        disabled={wizardMode === 'view'}
                        {...register('instructorId')}
                        className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none text-slate-600 text-sm font-medium"
                      >
                        {instructors.map(inst => (
                          <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Cost</label>
                      <input
                        type="number"
                        placeholder="Write here"
                        disabled={wizardMode === 'view'}
                        {...register('cost')}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none"
                      />
                      {errors.cost && <p className="text-[10px] text-red-500 font-semibold">{errors.cost.message}</p>}
                    </div>
                  </div>

                  {/* Hours and Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Total hours</label>
                      <input
                        type="number"
                        placeholder="Write here"
                        disabled={wizardMode === 'view'}
                        {...register('totalHours')}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Rate</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 4.6"
                        disabled={wizardMode === 'view'}
                        {...register('rate')}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description and Certification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Description */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                      {/* Rich Text Toolbar Mockup */}
                      <div className="flex flex-wrap items-center gap-1 p-1.5 border border-b-0 border-slate-300 rounded-t-lg bg-slate-50/50 text-slate-400">
                        <Bold className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Italic className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Underline className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                        <Highlighter className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Type className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                        <List className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <ListOrdered className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                        <Link2 className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Table className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Quote className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Write here"
                        disabled={wizardMode === 'view'}
                        {...register('description')}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-b-lg focus:outline-none text-slate-700 text-xs leading-relaxed"
                      />
                      {errors.description && <p className="text-[10px] text-red-500 font-semibold">{errors.description.message}</p>}
                    </div>

                    {/* Certification */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Certification</label>
                      {/* Rich Text Toolbar Mockup */}
                      <div className="flex flex-wrap items-center gap-1 p-1.5 border border-b-0 border-slate-300 rounded-t-lg bg-slate-50/50 text-slate-400">
                        <Bold className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Italic className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Underline className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                        <Highlighter className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Type className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                        <List className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <ListOrdered className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <span className="h-4 w-[1px] bg-slate-200 mx-1"></span>
                        <Link2 className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Table className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                        <Quote className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Write here"
                        disabled={wizardMode === 'view'}
                        {...register('certification')}
                        className="block w-full px-4 py-2.5 border border-slate-300 rounded-b-lg focus:outline-none text-slate-700 text-xs leading-relaxed"
                      />
                      {errors.certification && <p className="text-[10px] text-red-500 font-semibold">{errors.certification.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Footer button row */}
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardOpen(false)}
                    className="py-2.5 px-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  {wizardMode === 'view' ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="py-2.5 px-6 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="py-2.5 px-6 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 of 2: Curriculum Content Builder */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Add Content</h4>
                
                {/* Scrollable listing box */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {wizardMode === 'view' ? (
                    // Read only view
                    selectedCourse?.curriculum.map((section, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</label>
                          <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-bold">{section.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lectures Number</label>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-bold">{section.lecturesCount}</div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</label>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-bold">{section.time}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Interactive editor list
                    fields.map((field, idx) => (
                      <div key={field.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 relative">
                        {/* Name field */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Name</label>
                          <input
                            type="text"
                            placeholder="Write here"
                            {...register(`curriculum.${idx}.name` as const)}
                            className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none"
                          />
                        </div>

                        {/* Details row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Lectures Number</label>
                            <input
                              type="number"
                              placeholder="Write here"
                              {...register(`curriculum.${idx}.lecturesCount` as const)}
                              className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Time</label>
                            <input
                              type="text"
                              placeholder="Write here"
                              {...register(`curriculum.${idx}.time` as const)}
                              className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Remove button at subsequent elements bottom left */}
                        {fields.length > 1 && (
                          <div className="pt-2 flex justify-start">
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove Content
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Add Content wide dashed button */}
                  {wizardMode !== 'view' && (
                    <button
                      type="button"
                      onClick={() => append({ name: '', lecturesCount: 5, time: '1 hour' })}
                      className="w-full py-4 border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Content
                    </button>
                  )}
                </div>

                {/* Footer button row */}
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardOpen(false)}
                    className="py-2.5 px-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  {wizardMode === 'view' ? (
                    <button
                      type="button"
                      onClick={() => setWizardOpen(false)}
                      className="py-2.5 px-6 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                    >
                      Finish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit(handleFormSubmit)}
                      className="py-2.5 px-6 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-colors animate-pulse-slow"
                    >
                      {wizardMode === 'add' ? 'Add' : 'Update'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

