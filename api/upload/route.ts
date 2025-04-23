// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const blob = await put(`avatars/${file.name}`, file, {
        access: 'public',
        token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN!
    });

    return NextResponse.json(blob);
}
