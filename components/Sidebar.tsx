// components/Sidebar.tsx
"use client";
import { useState } from 'react';

const Sidebar = ({ setActiveSection }) => {
    const [active, setActive] = useState('chat');

    const handleClick = (section: string) => {
        setActive(section);
        setActiveSection(section); // Pass the active section to the parent component
    };

    return (
        <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
            <button
                className={`p-4 text-lg ${active === 'chat' ? 'bg-blue-600' : ''}`}
                onClick={() => handleClick('chat')}
            >
                Chat
            </button>
            <button
                className={`p-4 text-lg ${active === 'profile' ? 'bg-blue-600' : ''}`}
                onClick={() => handleClick('profile')}
            >
                Profile
            </button>
        </div>
    );
};

export default Sidebar;
