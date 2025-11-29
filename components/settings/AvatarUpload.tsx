'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUpload: (url: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUpload }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState(currentAvatar);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onUpload(data.url);
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload avatar');
            setPreview(currentAvatar); // Revert on error
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    )}
                </div>
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            <div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Change Avatar
                </button>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    JPG, GIF or PNG. Max size of 5MB.
                </p>
            </div>
        </div>
    );
}
