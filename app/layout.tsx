// app/layout.tsx
"use client";
import { useEffect } from "react";
import io from "socket.io-client";
import './globals.css';

const socket = io();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
