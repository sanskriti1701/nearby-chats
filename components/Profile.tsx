'use client';

import { useState } from 'react';

export default function Profile() {
    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.url) {
                setAvatar(data.url);
            } else {
                console.error('Upload failed:', data);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-md w-full max-w-md mx-auto mt-6">
            <label className="cursor-pointer">
                <img
                    src={avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 shadow-md"
                />
                <input type="file" onChange={handleFileChange} className="hidden" />
            </label>

            <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md"
            />

            <textarea
                placeholder="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={3}
            />
        </div>
    );
}
