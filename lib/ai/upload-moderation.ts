// Image Moderation Integration in Upload Flow
// Validates images before upload using moderation service

import { moderateImages } from '@/lib/ai/moderation';

export async function validateImagesBeforeUpload(
    imageUrls: string[]
): Promise<{ valid: boolean; flaggedImages: string[] }> {
    try {
        const results = await moderateImages(imageUrls);

        const flaggedImages = imageUrls.filter((url, index) => !results[index].safe);

        if (flaggedImages.length > 0) {
            console.warn('Flagged images detected:', flaggedImages);
            return { valid: false, flaggedImages };
        }

        return { valid: true, flaggedImages: [] };
    } catch (error) {
        console.error('Image moderation error:', error);
        // Fail open - allow images if moderation fails
        return { valid: true, flaggedImages: [] };
    }
}

export async function moderateProductImages(productId: string, imageUrls: string[]) {
    const { valid, flaggedImages } = await validateImagesBeforeUpload(imageUrls);

    if (!valid) {
        throw new Error(
            `Some images were flagged by moderation: ${flaggedImages.join(', ')}`
        );
    }

    return { success: true };
}
