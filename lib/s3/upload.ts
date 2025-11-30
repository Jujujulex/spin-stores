import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET, S3_REGION } from './config';

export interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

/**
 * Upload a file to S3
 * @param file - File buffer to upload
 * @param key - S3 object key (path)
 * @param contentType - MIME type of the file
 * @returns Upload result with public URL
 */
export async function uploadToS3(
    file: Buffer,
    key: string,
    contentType: string
): Promise<UploadResult> {
    try {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: 'public-read',
        });

        await s3Client.send(command);

        const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

        return {
            success: true,
            url,
            key,
        };
    } catch (error) {
        console.error('S3 upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Delete a file from S3
 * @param key - S3 object key to delete
 * @returns Success status
 */
export async function deleteFromS3(key: string): Promise<{ success: boolean; error?: string }> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        });

        await s3Client.send(command);

        return { success: true };
    } catch (error) {
        console.error('S3 delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        };
    }
}

/**
 * Generate a presigned URL for secure file upload
 * @param key - S3 object key
 * @param contentType - MIME type
 * @param expiresIn - URL expiration time in seconds (default: 300)
 * @returns Presigned URL
 */
export async function generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 300
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
}

/**
 * Generate a unique file key for S3
 * @param originalName - Original file name
 * @param prefix - Optional prefix for the key
 * @returns Unique S3 key
 */
export function generateFileKey(originalName: string, prefix: string = 'uploads'): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const sanitizedName = originalName
        .split('.')[0]
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase();

    return `${prefix}/${timestamp}-${randomString}-${sanitizedName}.${extension}`;
}
