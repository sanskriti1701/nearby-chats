"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://nearby-chats-production.up.railway.app", {
    transports: ["websocket"],
});

export default function ChatApp() {
    const [nearbyUsers, setNearbyUsers] = useState<{ id: string; name: string }[]>([]);
    const [discoveryRequest, setDiscoveryRequest] = useState<{ from: string; name: string } | null>(null);
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
    const [messages, setMessages] = useState<{ from: string; to: string; message: string }[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [username, setUsername] = useState<string>("");
    const [isUsernameSet, setIsUsernameSet] = useState(false);

    useEffect(() => {
        if (username && socket.connected) {
            socket.emit("set-username", username);
        }
    }, [username]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to backend ✅", socket.id);

            if (username) {
                socket.emit("set-username", username);
            }
        });

        socket.on("discovery-request", ({ from, name }) => {
            console.log("📡 Got discovery request from:", name);
            console.log(name, "yoss")
            setDiscoveryRequest({ from, name });
        });

        socket.on("discovery-response", ({ from, name }) => {
            console.log("🧭 Found nearby user:", name);
            setNearbyUsers((prev) => {
                if (!prev.find((user) => user.id === from)) {
                    return [...prev, { id: from, name }];
                }
                return prev;
            });
            if (!selectedUser) {
                setSelectedUser({ id: from, name });
            }
        });

        socket.on("discovery-rejected", ({ from }) => {
            console.log(`User ${from} rejected the discovery request.`);
            setDiscoveryRequest(null);
        });

        socket.on("new-message", ({ from, name, message }) => {
            setNearbyUsers((prev) => {
                const exists = prev.find((user) => user.id === from);
                if (!exists) {
                    return [...prev, { id: from, name }];
                } else if (!exists.name && name) {
                    // Update existing user with name if it was missing
                    return prev.map(user =>
                        user.id === from ? { ...user, name } : user
                    );
                }
                return prev;
            });

            setMessages((prev) => [...prev, { from: name, to: socket.id || "", message }]);

            setSelectedUser(prev => {
                if (!prev || prev.id !== from) return prev;
                if (!prev.name && name) return { ...prev, name };
                return prev;
            });
        });


        return () => {
            socket.off("connect");
            socket.off("discovery-request");
            socket.off("discovery-response");
            socket.off("discovery-rejected");
            socket.off("new-message");
        };
    }, [selectedUser, username]);

    const findNearby = () => {
        if (socket.connected) {
            console.log("📡 Emitting find-nearby");
            socket.emit("set-username", username);
            socket.emit("find-nearby", { name: username });
        } else {
            console.warn("⚠️ Socket not connected yet.");
        }
    };

    const handleResponse = (accept: boolean) => {
        if (discoveryRequest) {
            socket.emit("respond-to-discovery", {
                to: discoveryRequest.from,
                accept,
                name: username,
            });

            if (accept) {
                setNearbyUsers((prev) => [...prev, { id: discoveryRequest.from, name: discoveryRequest.name }]);
            }

            setDiscoveryRequest(null);
        }
    };

    const sendMessage = () => {
        if (selectedUser && messageInput.trim()) {
            socket.emit("send-message", { to: selectedUser.id, message: messageInput, name: username });
            setMessages((prev) => [...prev, { from: "You", to: selectedUser.id, message: messageInput }]);
            setMessageInput("");
        }
    };

    const filteredMessages = messages.filter(
        (msg) =>
            (msg.from === selectedUser?.name || msg.to === selectedUser?.id) ||
            (msg.from === "You" && msg.to === selectedUser?.id)
    );

    if (!isUsernameSet) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Enter your name</h2>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    <button
                        onClick={() => setIsUsernameSet(true)}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 w-screen">
            {/* Sidebar */}
            <div className="w-1/4 bg-purple-500 p-4 text-white">
                <div className="flex flex-col items-center">
                    <div className="bg-gray-200 w-24 h-24 rounded-full mb-4"></div>
                    <h2 className="text-xl font-semibold">{username}</h2>
                    <p className="text-sm mb-4">Online</p>

                    <button
                        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-800"
                        onClick={findNearby}
                    >
                        ➕ Find Nearby Users
                    </button>

                    <div className="mt-6 w-full">
                        <h3 className="font-semibold mb-2 text-left">Nearby Users</h3>
                        <ul className="space-y-2 w-full">
                            {nearbyUsers.map((user) => (
                                <li
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`cursor-pointer p-2 rounded ${selectedUser?.id === user.id ? "bg-purple-700" : "hover:bg-purple-600"}`}
                                >
                                    {user.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-white flex flex-col">
                <div className="bg-purple-700 text-white p-4">
                    <h3>{selectedUser ? selectedUser.name : "Select a User to Chat"}</h3>
                </div>

                <div className="flex-1 p-4 overflow-auto">
                    <div className="space-y-4">
                        {filteredMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`p-2 rounded-lg max-w-xs ${msg.from === "You" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex p-4 bg-gray-100">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="w-full p-2 rounded-lg"
                    />
                    <button
                        className="bg-purple-600 text-white p-2 rounded-lg ml-2"
                        onClick={sendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>

            {discoveryRequest && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg">
                        <h2 className="text-lg font-semibold">
                            Discovery request from {discoveryRequest.name}
                        </h2>
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded mt-4 mr-2"
                            onClick={() => handleResponse(true)}
                        >
                            Accept
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                            onClick={() => handleResponse(false)}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
