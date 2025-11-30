import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { uploadToS3, generateFileKey } from '@/lib/s3/upload';
import { validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/s3/validation';

const JWT_SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (files.length === 0) {
            const singleFile = formData.get('file') as File;
            if (singleFile) {
                files.push(singleFile);
            }
        }

        if (files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Validate all files first
        for (const file of files) {
            const validation = validateFile(file, ALLOWED_IMAGE_TYPES);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
        }

        // Upload all files to S3
        const uploadResults = await Promise.all(
            files.map(async (file) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                const key = generateFileKey(file.name, `users/${userId}`);
                const result = await uploadToS3(buffer, key, file.type);

                if (!result.success) {
                    throw new Error(result.error || 'Upload failed');
                }

                return {
                    url: result.url,
                    key: result.key,
                    filename: file.name,
                    type: file.type,
                    size: file.size,
                };
            })
        );

        // Return single object if only one file, otherwise return array
        if (uploadResults.length === 1) {
            return NextResponse.json(uploadResults[0]);
        }

        return NextResponse.json({ files: uploadResults });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload file' },
            { status: 500 }
        );
    }
}
