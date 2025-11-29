'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
}

export default function FileUpload({ onFileSelect, isUploading }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

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
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
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
