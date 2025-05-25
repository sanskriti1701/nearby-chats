import { useEffect } from 'react';
import { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');  // Make sure to connect to the correct port

export default function Chat() {
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Ensure that the client is connecting and listening
        socket.on('connect', () => {
            console.log('Socket connected!');
        });

        // Listen for 'message' event from server
        socket.on('message', (msg: string) => {
            console.log('Received message:', msg);
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('message'); // Cleanup on unmount
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('message', message); // Emit message to server
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
