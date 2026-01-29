'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/lib/contexts/ToastContext';
import { format } from 'date-fns';

interface ProgressPhoto {
  id: number;
  date: string;
  category: string;
  photoData: string;
  weight?: number | null;
  notes?: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'FRONT', label: 'Front', icon: '👤' },
  { value: 'BACK', label: 'Back', icon: '🔙' },
  { value: 'SIDE', label: 'Side', icon: '↔️' },
  { value: 'OTHER', label: 'Other', icon: '📸' },
];

export default function ProgressPhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const toast = useToast();

  // Upload form state
  const [uploadCategory, setUploadCategory] = useState('FRONT');
  const [uploadWeight, setUploadWeight] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadPhoto, setUploadPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [filterCategory]);

  async function fetchPhotos() {
    setLoading(true);
    try {
      const url = filterCategory
        ? `/api/progress-photos?category=${filterCategory}`
        : '/api/progress-photos';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setPhotos(result.data);
      } else {
        toast.error('Failed to load photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!uploadPhoto) {
      toast.error('Please select a photo');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('/api/progress-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: uploadCategory,
          photoData: uploadPhoto,
          weight: uploadWeight ? parseFloat(uploadWeight) : null,
          notes: uploadNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Photo uploaded successfully!');
        setShowUploadModal(false);
        setUploadPhoto(null);
        setUploadWeight('');
        setUploadNotes('');
        fetchPhotos();
      } else {
        toast.error(result.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/progress-photos/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Photo deleted');
        fetchPhotos();
      } else {
        toast.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  }

  function togglePhotoSelection(id: number) {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos(selectedPhotos.filter((p) => p !== id));
    } else {
      if (selectedPhotos.length >= 4) {
        toast.info('You can compare up to 4 photos at once');
        return;
      }
      setSelectedPhotos([...selectedPhotos, id]);
    }
  }

  const comparePhotos = photos.filter((p) => selectedPhotos.includes(p.id));

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Progress Photos
        </h1>
        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          📸 Add Photo
        </Button>
      </div>

      {/* Filter and Compare */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-950 dark:text-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        {selectedPhotos.length >= 2 && (
          <Button
            variant="primary"
            onClick={() => setShowCompareModal(true)}
          >
            Compare {selectedPhotos.length} Photos
          </Button>
        )}

        {selectedPhotos.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => setSelectedPhotos([])}
          >
            Clear Selection
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <p className="text-gray-600 dark:text-zinc-400">Loading photos...</p>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-zinc-400 mb-4">
            No progress photos yet. Add your first photo to start tracking!
          </p>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            📸 Add First Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className={`cursor-pointer transition-all ${
                selectedPhotos.includes(photo.id)
                  ? 'ring-4 ring-blue-500 dark:ring-blue-400'
                  : ''
              }`}
              onClick={() => togglePhotoSelection(photo.id)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-zinc-900">
                  <img
                    src={photo.photoData}
                    alt={`Progress photo - ${photo.category}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {selectedPhotos.indexOf(photo.id) + 1}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {CATEGORIES.find((c) => c.value === photo.category)?.icon}{' '}
                      {photo.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      {format(new Date(photo.date), 'MMM d')}
                    </span>
                  </div>
                  {photo.weight && (
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">
                      {photo.weight} kg
                    </p>
                  )}
                  {photo.notes && (
                    <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2">
                      {photo.notes}
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Progress Photo
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo Preview */}
              {uploadPhoto ? (
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
                  <img
                    src={uploadPhoto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setUploadPhoto(null)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <p className="text-gray-600 dark:text-zinc-400 mb-2">
                      📸 Click to select photo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">
                      or use camera on mobile
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <Input
                type="number"
                label="Weight (kg) - Optional"
                value={uploadWeight}
                onChange={(e) => setUploadWeight(e.target.value)}
                step="0.1"
                placeholder="70.5"
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="How you're feeling, what you're working on, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!uploadPhoto || uploading}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-lg max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Compare Progress Photos
              </h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className={`grid grid-cols-${Math.min(comparePhotos.length, 2)} md:grid-cols-${comparePhotos.length} gap-4`}>
              {comparePhotos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
                    <img
                      src={photo.photoData}
                      alt={`Progress photo - ${photo.category}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(photo.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {CATEGORIES.find((c) => c.value === photo.category)?.icon}{' '}
                      {photo.category}
                    </p>
                    {photo.weight && (
                      <p className="text-gray-600 dark:text-zinc-400">
                        {photo.weight} kg
                      </p>
                    )}
                    {photo.notes && (
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                        {photo.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
