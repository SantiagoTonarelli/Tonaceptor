import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./Interceptor.css";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSocket] = useState<Socket | null>(null);

  useEffect((): any => {
    const newSocket = io(
      process.env.REACT_APP_SERVER_URL || "http://localhost:1891"
    );
    setSocket(newSocket);

    newSocket.on("newRequest", (data: Request) => {
      setRequests((prevRequests) => [data, ...prevRequests]);
    });

    newSocket.on("initialRequests", (data: Request[]) => {
      setRequests(data);
    });

    return () => newSocket.close();
  }, []);

  const handlerDeleteAllRequests = () => {
    setRequests([]);
    fetch(`${process.env.REACT_APP_SERVER_URL || "http://localhost:1891"}/requests`, {
      method: "DELETE",
    });
  };

  return (
    <div className="tab_body">
      <button style={
        {
          backgroundColor: 'red',
          color: 'white',
          padding: '10px',
          margin: '10px',
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer'
        }
      } onClick={handlerDeleteAllRequests
      }>Delete all requests</button>
      
      <h1>Received Requests</h1>
      <section className="accordion">
        {requests.map((req, index) => (
          <div className="tab" key={index}>
            <input type="checkbox" name={`accordion-${index}`} id={`cb${index}`} />
            <label htmlFor={`cb${index}`} className="tab__label">
              <b>{req.method+"    ==>"} {req.url.replace("/itona", "/")}</b>
              <span>{req.timestamp.replace('T',' ')}</span>
            </label>
            <div className="tab__content">
              <section className="accordion accordion--radio">
                {req.headers && (
                  <div className="tab">
                    <input type="checkbox" name={`accordion-${index}-headed`} id={`rb${index}-headed`} />
                    <label htmlFor={`rb${index}-headed`} className="tab__label">
                      Headers:
                    </label>
                    <div className="tab__content">
                      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {JSON.stringify(req.headers, null, 2).replaceAll('"', '') // Remove all double quotes
                          .replaceAll(',', '')}
                      </div>
                    </div>
                  </div>
                )}
                {req.body && (
                  <div className="tab">
                    <input type="checkbox" name={`accordion-${index}-body`} id={`rb${index}-body`} />
                    <label htmlFor={`rb${index}-body`} className="tab__label">
                      Body:
                    </label>
                    <div className="tab__content">
                      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {JSON.stringify(req.body, null, 2).replaceAll('"', '') // Remove all double quotes
                          .replaceAll(',', '')}
                      </div>
                    </div>
                  </div>
                )}
                {req.query && (
                  <div className="tab">
                    <input type="checkbox" name={`accordion-${index}-query`} id={`rb${index}-query`} />
                    <label htmlFor={`rb${index}-query`} className="tab__label">
                      Query:
                    </label>
                    <div className="tab__content">
                      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                        {JSON.stringify(req.query, null, 2).replaceAll('"', '') // Remove all double quotes
                          .replaceAll(',', '')}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Interceptor;
