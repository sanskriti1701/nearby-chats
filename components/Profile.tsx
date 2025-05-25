'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface User {
    id: string;
    name: string;
    distance: number; // Example property
}

// Connect to the Socket.IO server
const socket = io('http://localhost:3001');  // Adjust this if your server is running on a different port

export default function Profile() {
    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
    const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);

    useEffect(() => {
        // Fetch the user's geolocation on component mount
        getUserLocation();

        // Listen for nearby users from the server
        socket.on('nearby-users', (users: User[]) => {
            setNearbyUsers(users);
        });

        // Clean up on component unmount
        return () => {
            socket.off('nearby-users');
        };
    }, []);

    // Fetch user location and emit it to the server
    async function getUserLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });

            // Emit user location to the server
            socket.emit('user-location', { latitude, longitude });
        } catch (error) {
            // Log the entire error to understand its structure
            console.error('Error getting location:', error);

            // Now handle the error based on its structure
            if (error instanceof Error) {
                // If the error is an instance of Error (generic JS error)
                console.error('Error message:', error.message);
            } else {
                // Handle other types of errors (e.g., geolocation-specific errors)
                console.error('Unexpected geolocation error:', error);
            }
        }
    }

    // Connect to a nearby user
    const connectToUser = (userId: string) => {
        socket.emit('connect-user', { userId, myLocation: location });
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl shadow-md w-full max-w-md mx-auto mt-6">
            <label className="cursor-pointer">
                <img
                    src={avatar || '/default-avatar.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-300 shadow-md"
                />
                <input type="file" onChange={(e) => setAvatar(URL.createObjectURL(e.target.files![0]))} className="hidden" />
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

            <div className="w-full mt-4">
                <h3 className="text-lg font-semibold">Nearby Users:</h3>
                {nearbyUsers.length > 0 ? (
                    <ul>
                        {nearbyUsers.map((user) => (
                            <li key={user.id} className="flex justify-between items-center mb-2">
                                <div>{user.name}</div>
                                <button
                                    onClick={() => connectToUser(user.id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md"
                                >
                                    Connect
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No nearby users found.</p>
                )}
            </div>
        </div>
    );
}
