'use client';

import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

type ChatInputProps = {
    onSendMessage: (message: string) => void;
};

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() === '') return;
        onSendMessage(input.trim());
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="flex items-center gap-2 border-t pt-3">
            <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button
                onClick={handleSend}
                className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
            >
                <SendHorizonal size={18} />
            </button>
        </div>
    );
}
