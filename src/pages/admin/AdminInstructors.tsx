import React, { useState, useMemo } from 'react';
import type { Instructor } from '../../context/appTypes';
import { useApp } from '../../context/useApp';
import { StarRating } from '../../components/common/StarRating';
import { DeleteModal } from '../../components/common/DeleteModal';
import { Search, SlidersHorizontal, Plus, Eye, Pencil, Trash2, Camera, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const instructorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jobTitle: z.string().min(1, 'Job Title is required'),
  rate: z.coerce.number().min(1, 'Rate must be between 1 and 5').max(5, 'Rate must be between 1 and 5'),
  description: z.string().min(1, 'Description is required'),
});

type InstructorFormValues = z.infer<typeof instructorSchema>;

export const AdminInstructors: React.FC = () => {
  const { instructors, addInstructor, updateInstructor, deleteInstructor } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedInst, setSelectedInst] = useState<Instructor | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [instToDelete, setInstToDelete] = useState<Instructor | null>(null);

  const filteredInstructors = useMemo(() => {
    return instructors.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [instructors, searchQuery]);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
  });

  const handleOpenAddModal = () => {
    reset({
      name: '',
      jobTitle: '',
      rate: 5,
      description: '',
    });
    setSelectedInst(null);
    setActiveModal('add');
  };

  const handleOpenEditModal = (inst: Instructor) => {
    reset({
      name: inst.name,
      jobTitle: inst.jobTitle,
      rate: inst.rate,
      description: inst.bio, // map bio to description
    });
    setSelectedInst(inst);
    setActiveModal('edit');
  };

  const handleOpenViewModal = (inst: Instructor) => {
    setSelectedInst(inst);
    setActiveModal('view');
  };

  const handleOpenDeleteModal = (inst: Instructor) => {
    setInstToDelete(inst);
    setDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (instToDelete) {
      await deleteInstructor(instToDelete.id);
      setInstToDelete(null);
    }
  };

  const onSubmit = async (data: InstructorFormValues) => {
    if (activeModal === 'add') {
      await addInstructor({
        name: data.name,
        jobTitle: data.jobTitle,
        rate: data.rate,
        description: data.jobTitle + ' expert',
        reviewsCount: 0,
        studentsCount: 0,
        coursesCount: 0,
        bio: data.description,
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      });
    } else if (activeModal === 'edit' && selectedInst) {
      await updateInstructor(selectedInst.id, {
        name: data.name,
        jobTitle: data.jobTitle,
        rate: data.rate,
        bio: data.description,
      });
    }
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Instructors Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Instructors</h2>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-md">
              {instructors.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Add Instructor button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Instructor
            </button>

            {/* Search inputs */}
            <div className="relative max-w-xs flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search for Instructors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter buttons */}
            <button className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructors Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200 bg-white">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-700">
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name column */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img 
                        src={inst.image} 
                        alt={inst.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" 
                      />
                      <span className="font-bold text-slate-800">{inst.name}</span>
                    </td>
                    
                    {/* Job Title column */}
                    <td className="px-6 py-4 text-slate-500">{inst.jobTitle}</td>
                    
                    {/* Rate column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={inst.rate} size={14} />
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenViewModal(inst)}
                          title="View Details"
                          className="p-1.5 rounded-full hover:bg-slate-100 text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(inst)}
                          title="Edit Details"
                          className="p-1.5 rounded-full hover:bg-slate-100 text-violet-500 hover:text-violet-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(inst)}
                          title="Delete Instructor"
                          className="p-1.5 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-semibold">
                    No instructors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex justify-center items-center gap-2 pt-6">
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-400">&lt;</button>
          <button className="w-8 h-8 border border-slate-900 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xs">1</button>
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs">2</button>
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-600 text-xs">3</button>
          <button className="w-8 h-8 border border-slate-200 rounded flex items-center justify-center hover:bg-slate-50 text-slate-400">&gt;</button>
        </div>
      </div>

      {/* Reusable Delete Dialog */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        itemName={instToDelete ? instToDelete.name : ''}
        itemType="Instructor"
      />

      {/* CRUD Overlay Modals (Add / Edit / View Popup sheets) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {activeModal === 'add' && 'Add Instructor'}
                {activeModal === 'edit' && 'Update Instructor'}
                {activeModal === 'view' && 'View Instructor'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar circle camera indicator */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  {selectedInst ? (
                    <img src={selectedInst.image} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                </div>
                {activeModal !== 'view' && (
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-200">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            {activeModal === 'view' ? (
              // View modal detail layout
              <div className="space-y-4 text-slate-600 text-sm">
                <div>
                  <strong className="block text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">Nama</strong>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">{selectedInst?.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong className="block text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">Job Title</strong>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">{selectedInst?.jobTitle}</div>
                  </div>
                  <div>
                    <strong className="block text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">Rate</strong>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5">
                      <StarRating rating={selectedInst?.rate || 5} size={14} />
                      <span className="font-bold text-xs">{selectedInst?.rate}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <strong className="block text-slate-800 text-xs font-bold uppercase tracking-wider mb-1">Description</strong>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {selectedInst?.bio}
                  </div>
                </div>
              </div>
            ) : (
              // Add / Edit interactive forms
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Nama</label>
                  <input
                    type="text"
                    placeholder="Write here"
                    {...register('name')}
                    className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name.message}</p>}
                </div>

                {/* Job Title and Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">Job Title</label>
                    <select
                      {...register('jobTitle')}
                      className="block w-full px-4 py-2.5 border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-600 text-sm font-medium"
                    >
                      <option value="">Choose</option>
                      <option value="FullStackDeveloper">Full Stack Developer</option>
                      <option value="FrontEndDeveloper">Front-End Developer</option>
                      <option value="BackEndDeveloper">Back-End Developer</option>
                      <option value="UXUIDesigner">UX/UI Designer</option>
                    </select>
                    {errors.jobTitle && <p className="text-[10px] text-red-500 font-semibold">{errors.jobTitle.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">Rate</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 5"
                      {...register('rate')}
                      className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.rate ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                      }`}
                    />
                    {errors.rate && <p className="text-[10px] text-red-500 font-semibold">{errors.rate.message}</p>}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Write here"
                    {...register('description')}
                    className={`block w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.description ? 'border-red-300 focus:ring-red-100' : 'border-slate-300 focus:ring-blue-100'
                    }`}
                  />
                  {errors.description && <p className="text-[10px] text-red-500 font-semibold">{errors.description.message}</p>}
                </div>

                {/* Action buttons */}
                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="py-2.5 px-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-colors"
                  >
                    {activeModal === 'add' ? 'Add' : 'Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
