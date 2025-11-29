import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // TODO: Implement actual file upload to S3 or Cloudinary
        // For now, we'll return a mock URL
        // const buffer = Buffer.from(await file.arrayBuffer());
        // await uploadToS3(buffer, file.name);

        console.log('Mock upload:', file.name, file.size);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            url: `https://via.placeholder.com/300?text=${encodeURIComponent(file.name)}`,
            filename: file.name,
            type: file.type
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
