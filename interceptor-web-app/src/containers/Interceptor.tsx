import React, { useEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";

type Request = {
    method: string;
    url: string;
    headers: Record<string, any>;
    body: any;
    query: any;
    timestamp: string;
};

const Interceptor = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [_, setSocket] = useState<Socket | null>(null);

    useEffect((): any => {
        const newSocket = io(process.env.REACT_APP_SERVER_URL || "http://localhost:3001");
        setSocket(newSocket);

        newSocket.on("newRequest", (data: Request) => {
            setRequests(prevRequests => [data, ...prevRequests]);
        });

        newSocket.on("initialRequests", (data: Request[]) => {
            setRequests(data);
        });

        return () => newSocket.close();
    }, []);

    return (
        <div>
            <h1>Received Requests</h1>
            <ul>
                {requests.map((req, index) => (
                    <li key={index}>
                        <strong>Method:</strong> {req.method} <strong>URL:</strong> {req.url} <strong>Timestamp:</strong> {req.timestamp}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Interceptor;