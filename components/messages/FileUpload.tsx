'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onUploadComplete?: (url: string) => void;
    isUploading: boolean;
}

export default function FileUpload({ onFileSelect, onUploadComplete, isUploading }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setError(null);
        setUploadProgress(0);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }

        onFileSelect(file);

        // Upload file
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            setUploadProgress(100);

            if (onUploadComplete && data.url) {
                onUploadComplete(data.url);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setPreview(null);
        }
    };

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
                accept="image/*,.pdf"
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                title="Attach file"
            >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
            </button>

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Uploading...</span>
                        <span className="text-xs font-semibold text-primary-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Preview */}
            {preview && (
                <div className="absolute bottom-full left-0 mb-2 w-32 h-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}

            {dragActive && (
                <div
                    className="absolute bottom-full left-0 mb-2 w-64 h-32 bg-white dark:bg-gray-800 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center z-50 shadow-lg"
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <p className="text-sm text-gray-500">Drop file here</p>
                </div>
            )}
        </div>
    );
}
