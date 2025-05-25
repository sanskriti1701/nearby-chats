'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function ChatHeader() {
    const [searching, setSearching] = useState(false);

    const handleSearchNearby = () => {
        setSearching(true);

        // Simulate a search delay
        setTimeout(() => {
            setSearching(false);
            alert('No nearby devices found (yet) 😅');
        }, 3000);
    };

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-purple-100 rounded-md shadow">
            <h2 className="text-lg font-semibold text-purple-800">Chats</h2>
            <button
                onClick={handleSearchNearby}
                className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition"
                title="Search for nearby users"
            >
                <Plus size={20} />
            </button>

            {searching && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 bg-white border border-purple-300 rounded-md shadow-md text-purple-600">
                    Searching for nearby devices...
                </div>
            )}
        </div>
    );
}
