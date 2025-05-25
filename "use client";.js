"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
    transports: ["websocket"],
});

export default function NearbyFinder() {
    const [nearbyUsers, setNearbyUsers] = useState<string[]>([]);
    const [discoveryRequest, setDiscoveryRequest] = useState<string | null>(null); // To store the user making the discovery request
    const [chatRoom, setChatRoom] = useState<string | null>(null); // Store the current chat room
    const [chatMessages, setChatMessages] = useState<{ from: string; message: string }[]>([]); // Store chat messages
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to backend ✅", socket.id);
        });

        socket.on("discovery-request", ({ from }) => {
            console.log("📡 Got discovery request from:", from);
            // Set the requestor's socket ID when discovery request is received
            setDiscoveryRequest(from);
        });

        socket.on("discovery-response", ({ from }) => {
            console.log("🧭 Found nearby user:", from);
            setNearbyUsers((prev) => [...new Set([...prev, from])]);
        });

        socket.on("discovery-rejected", ({ from }) => {
            console.log(`User ${from} rejected the discovery request.`);
            setDiscoveryRequest(null); // Clear discovery request if rejected
        });

        socket.on("chat-connected", ({ roomName }) => {
            console.log("Chat connected in room:", roomName);
            setChatRoom(roomName); // Set the chat room when connection is established
        });

        socket.on("chat-message", ({ from, message }) => {
            console.log(`Message from ${from}: ${message}`);
            setChatMessages((prevMessages) => [...prevMessages, { from, message }]);
        });

        return () => {
            socket.off("connect");
            socket.off("discovery-request");
            socket.off("discovery-response");
            socket.off("discovery-rejected");
            socket.off("chat-connected");
            socket.off("chat-message");
        };
    }, []);

    const findNearby = () => {
        setNearbyUsers([]); // Reset before new search
        socket.emit("find-nearby");
    };

    const handleResponse = (accept: boolean) => {
        if (discoveryRequest) {
            socket.emit("respond-to-discovery", {
                to: discoveryRequest,
                accept,
            });
            if (accept) {
                console.log("Discovery accepted!");
            } else {
                console.log("Discovery rejected.");
            }
            setDiscoveryRequest(null); // Clear the request once it's responded to
        }
    };

    const sendMessage = () => {
        if (message.trim() && chatRoom) {
            socket.emit("chat-message", { roomName: chatRoom, message });
            setMessage(""); // Clear input field after sending
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Nearby Finder</h1>
            <button
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                onClick={findNearby}
            >
                ➕ Find Nearby Users
            </button>

            {discoveryRequest && (
                <div className="mt-4">
                    <h2 className="font-semibold mb-2">
                        Discovery request from {discoveryRequest}
                    </h2>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
                        onClick={() => handleResponse(true)}
                    >
                        Accept
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={() => handleResponse(false)}
                    >
                        Reject
                    </button>
                </div>
            )}

            {chatRoom && (
                <div className="mt-4">
                    <h2 className="font-semibold mb-2">Chat Room:</h2>
                    <div className="border p-4">
                        <div className="h-48 overflow-y-auto mb-4">
                            {chatMessages.map((msg, index) => (
                                <div key={index} className="mb-2">
                                    <strong>{msg.from}:</strong> {msg.message}
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border p-2 w-full"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={sendMessage}
                            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <h2 className="font-semibold mb-2">Nearby Users:</h2>
                <ul className="list-disc ml-6">
                    {nearbyUsers.map((id) => (
                        <li key={id}>{id}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
