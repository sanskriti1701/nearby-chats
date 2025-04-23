// components/Layout.tsx
"use client"
import Sidebar from './Sidebar';
import Chat from './Chat';
import Profile from './Profile';
import { useState } from 'react';

const Layout = () => {
    const [activeSection, setActiveSection] = useState('chat');

    return (
        <div className="flex">
            <Sidebar setActiveSection={setActiveSection} />
            <div className="flex-1 p-4">
                {activeSection === 'chat' ? <Chat /> : <Profile />}
            </div>
        </div>
    );
};

export default Layout;
