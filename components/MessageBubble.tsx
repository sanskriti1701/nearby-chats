'use client';

import React from 'react';
import clsx from 'clsx';

type MessageBubbleProps = {
    message: string;
    type: 'incoming' | 'outgoing';
};

export default function MessageBubble({ message, type }: MessageBubbleProps) {
    return (
        <div
            className={clsx(
                'max-w-[70%] px-4 py-2 rounded-lg my-2 shadow-sm text-sm',
                type === 'incoming'
                    ? 'bg-gray-200 text-black self-start rounded-bl-none'
                    : 'bg-purple-500 text-white self-end rounded-br-none'
            )}
        >
            {message}
        </div>
    );
}
