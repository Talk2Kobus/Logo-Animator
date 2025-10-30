
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
    onImageUpload: (base64: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file.');
                setPreview(null);
                onImageUpload(null);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                onImageUpload(result);
                setError(null);
            };
            reader.onerror = () => {
                setError('Failed to read the file.');
                setPreview(null);
                onImageUpload(null);
            };
            reader.readAsDataURL(file);
        }
    }, [onImageUpload]);

    return (
        <div className="w-full">
            <label 
                htmlFor="file-upload" 
                className="relative cursor-pointer bg-gray-700 rounded-lg border-2 border-dashed border-gray-500 hover:border-indigo-500 transition-colors p-4 flex flex-col items-center justify-center text-center"
            >
                {preview ? (
                    <img src={preview} alt="Image preview" className="max-h-40 rounded-lg object-contain" />
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9a3 3 0 100-6 3 3 0 000 6z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l-4-4-4 4" />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-gray-300">
                           Click to upload an image
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                           PNG, JPG, GIF up to 10MB
                        </span>
                    </>
                )}
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </label>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
    );
};
