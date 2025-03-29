'use client';

import React, { useState } from 'react';
import AWS from 'aws-sdk';

// Profile page component
export default function ProfilePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Function to upload image from URL to Supabase
  const uploadImageFromUrl = async (url: string) => {
    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Configure S3 client for Supabase Storage
      const s3 = new AWS.S3({
        endpoint: 'BRUH',  // Supabase Storage endpoint
        accessKeyId: 'BRUH',  // Your Supabase access key
        secretAccessKey: 'BRUH',  // Your Supabase secret key
        signatureVersion: 'v4',  // Default AWS Signature version
        region: 'us-east-1',  // Region (this can be any AWS region, since Supabase Storage is S3-compatible)
      });

      // Fetch the image
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: HTTP status ${response.status}`);
      }
      
      // Convert response to array buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate a unique file name
      const fileName = `profile-${Date.now()}.jpg`;
      
      // Upload parameters
      const uploadParams = {
        Bucket: 'profile-photos',
        Key: fileName,
        Body: buffer,
        ContentType: 'image/jpeg',
      };

      // Upload to Supabase Storage
      const result = await s3.upload(uploadParams).promise();
      
      // Update state with success
      setUploadStatus('Upload successful!');
      setImageUrl(result.Location);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const url = formData.get('imageUrl') as string;
    
    if (url) {
      uploadImageFromUrl(url);
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
              Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isUploading}
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