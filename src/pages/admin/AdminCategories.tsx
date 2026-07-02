import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Image, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/useApp';
import type { Category } from '../../context/appTypes';
import { DeleteModal } from '../../components/common/DeleteModal';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  imagePath: z.string().url('Use a valid image URL').or(z.literal('')),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      imagePath: '',
    },
  });

  const openCreate = () => {
    setSelectedCategory(null);
    reset({ name: '', imagePath: '' });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    reset({
      name: category.name,
      imagePath: category.imagePath ?? '',
    });
    setError(null);
    setModalOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setError(null);

    try {
      const payload = {
        name: values.name,
        imagePath: values.imagePath || undefined,
      };

      if (selectedCategory) {
        await updateCategory(selectedCategory.id, payload);
      } else {
        await addCategory(payload);
      }

      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save category.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-sm font-medium text-slate-400">Manage the course taxonomy used by the public catalog.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Image URL</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-400">
                      {category.imagePath ? (
                        <img src={category.imagePath} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Image className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{category.name}</span>
                  </div>
                </td>
                <td className="max-w-xl truncate px-5 py-4 text-sm font-medium text-slate-500">
                  {category.imagePath || 'No image'}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(category)}
                      className="rounded-full p-2 text-violet-500 hover:bg-violet-50 hover:text-violet-700"
                      title="Edit category"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(category)}
                      className="rounded-full p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="p-10 text-center text-sm font-medium text-slate-400">
            No categories returned by the API yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Name</label>
                <input
                  {...register('name')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Image URL</label>
                <input
                  {...register('imagePath')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {errors.imagePath && <p className="text-xs font-semibold text-red-500">{errors.imagePath.message}</p>}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.name ?? 'this category'}
        itemType="Category"
      />
    </div>
  );
};

