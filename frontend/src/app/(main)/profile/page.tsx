"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export default function ProfilePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
    }
  };

  const maxSize = 5 * 1024 * 1024; // 5MB max size

  // Validate file size
  if (imageFile && imageFile.size > maxSize) {
    setUploadStatus('File is too large. Max size is 5MB.');
  }

  // Validate file type
  if (imageFile && !imageFile.type.startsWith('image/')) {
    setUploadStatus('Invalid file type. Please upload an image.');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!imageFile) {
      setUploadStatus('Please select an image first.');
      return;
    }
  
    setIsUploading(true);
    setUploadStatus(null);
  
    try {
      const { data, error } = await supabase.storage
        .from('profile-photos') // The bucket name in Supabase
        .upload(`profile-photo-${Date.now()}`, imageFile);
  
      if (error) {
        console.error('Supabase upload error:', error); // Log the error
        throw error;  // Throw the error to be caught in the catch block
      }
  
      console.log('Upload data:', data);  // Log the successful upload response
  
      const publicUrl = supabase.storage.from('profile-photos').getPublicUrl(data.path).data.publicUrl;
      setImageUrl(publicUrl);
      setUploadStatus('Image uploaded successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setUploadStatus(`Upload failed: ${error.message}`);
      } else {
        setUploadStatus('Upload failed: Unknown error');
      }
      console.error('Error during upload:', error);  // Log the complete error
    } finally {
      setIsUploading(false);
    }
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      
      {/* Image upload form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Profile Photo</h2>
          
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Choose Image
            </label>
            <input
              type="file"
              id="imageUrl"
              name="imageUrl"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isUploading || !imageFile}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
          
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded ${uploadStatus.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {uploadStatus}
          </div>
        )}
          
        {imageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</p>
            <img src={imageUrl} alt="Uploaded profile" className="max-w-xs rounded" />
          </div>
        )}
      </div>
    </div>
  );
}
