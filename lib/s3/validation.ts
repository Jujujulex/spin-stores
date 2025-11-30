const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export function validateFileSize(file: File): FileValidationResult {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
    }
    return { valid: true };
}

export function validateFileType(file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES): FileValidationResult {
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }
    return { valid: true };
}

export function validateFile(file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES): FileValidationResult {
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) return sizeValidation;

    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.valid) return typeValidation;

    return { valid: true };
}

export { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES };
